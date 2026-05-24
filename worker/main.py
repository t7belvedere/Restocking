"""Main worker loop — polls active watches and sends restock notifications.

Flow (every LOOP_SLEEP seconds):
  1. Fetch all active watches from Supabase (with plan info)
  2. For each watch:
     a. Skip if not yet due (based on plan interval since last_check)
     b. Apply per-domain rate-limiting (random 2-8 s delay)
     c. Scrape the URL → (page, method)
     d. Detect stock status via retailer parser or generic detectors
     e. Log the check in check_logs
     f. Update last_status + last_check on the watch
     g. Double-confirmation: require 2 consecutive IN_STOCK readings before
        sending a notification (guards against transient false positives)
  3. Sleep LOOP_SLEEP seconds
  4. Repeat
"""

import logging
import os
import random
import time
import urllib.parse
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("restock.main")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

CHECK_INTERVAL_PRO = int(os.getenv("CHECK_INTERVAL_PRO", "300"))    # 5 min
CHECK_INTERVAL_FREE = int(os.getenv("CHECK_INTERVAL_FREE", "900"))  # 15 min
DOMAIN_DELAY_MIN = float(os.getenv("DOMAIN_DELAY_MIN", "2"))
DOMAIN_DELAY_MAX = float(os.getenv("DOMAIN_DELAY_MAX", "8"))
LOOP_SLEEP = 60  # seconds between full loops

# ---------------------------------------------------------------------------
# Imports from project modules
# ---------------------------------------------------------------------------

from db.client import (
    get_active_watches,
    get_user_email,
    insert_check_log,
    insert_notification,
    update_watch_status,
)
from notifier.email import send_restock_email
from notifier.sms import send_restock_sms  # SMS skipped — no phone in DB schema
from scraper.detectors import detect_stock
from scraper.fetcher import fetch_with_fallback
from scraper.retailers import get_parser

# ---------------------------------------------------------------------------
# In-memory state
# ---------------------------------------------------------------------------

# domain → unix timestamp of last HTTP request
domain_last_request: dict[str, float] = {}

# watch_id → number of consecutive IN_STOCK readings since last OUT_OF_STOCK
consecutive_counts: dict[str, int] = {}

# watch_ids we've already notified for the current IN_STOCK streak
notified_for_streak: set[str] = set()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_due(watch: dict) -> bool:
    """Return True if enough time has elapsed since last_check for this watch."""
    last_check_raw = watch.get("last_check")
    if last_check_raw is None:
        # New watch — always check immediately
        return True

    try:
        last_check = datetime.fromisoformat(last_check_raw)
        if last_check.tzinfo is None:
            last_check = last_check.replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        logger.warning(
            "watch %s: invalid last_check value %r — treating as due",
            watch["id"],
            last_check_raw,
        )
        return True

    interval = CHECK_INTERVAL_PRO if watch.get("plan") == "pro" else CHECK_INTERVAL_FREE
    elapsed = (datetime.now(timezone.utc) - last_check).total_seconds()
    return elapsed >= interval


def _apply_domain_rate_limit(url: str) -> None:
    """Sleep a random delay if the same domain was recently requested."""
    hostname = urllib.parse.urlparse(url).hostname or url
    last_time = domain_last_request.get(hostname)
    if last_time is not None:
        delay = random.uniform(DOMAIN_DELAY_MIN, DOMAIN_DELAY_MAX)
        logger.debug("Rate limiting %s — sleeping %.1fs", hostname, delay)
        time.sleep(delay)
    domain_last_request[hostname] = time.monotonic()


def _send_notifications(watch: dict, status: str) -> None:
    """Send email (all plans) and SMS (pro only, skipped — no phone in schema)."""
    watch_id = watch["id"]
    user_id = watch["user_id"]
    name = watch.get("name", "Produit")
    variant_label = watch.get("variant_label")
    url = watch["url"]
    plan = watch.get("plan", "free")

    # Fetch email — not stored directly on the watch dict
    to_email = get_user_email(user_id)
    if to_email:
        success = send_restock_email(
            to_email=to_email,
            product_name=name,
            variant_label=variant_label,
            product_url=url,
        )
        insert_notification(watch_id, channel="email", success=success)
        if success:
            logger.info("watch %s: email notification sent to %s", watch_id, to_email)
        else:
            logger.warning("watch %s: email notification FAILED for %s", watch_id, to_email)
    else:
        logger.warning("watch %s: could not resolve email for user %s — skipping email", watch_id, user_id)

    # SMS — Pro plan only, but no phone number is stored in the current DB schema
    if plan == "pro":
        logger.info(
            "watch %s: SMS notification skipped — phone number not available in DB schema",
            watch_id,
        )
        # When phone support is added, call send_restock_sms here and
        # insert_notification(watch_id, channel="sms", success=...).


def _process_watch(watch: dict) -> None:
    """Run a single check cycle for one watch."""
    watch_id = watch["id"]
    url = watch["url"]
    name = watch.get("name", "?")
    variant_label = watch.get("variant_label")
    variant_id = watch.get("variant_id")

    logger.info("watch %s (%s) — checking %s", watch_id, name, url)

    # --- Rate limiting ---
    _apply_domain_rate_limit(url)

    # --- Scrape ---
    page, method = fetch_with_fallback(url)
    logger.debug("watch %s: fetched via %s", watch_id, method)

    # --- Detect stock ---
    parser = get_parser(url)
    if parser is not None:
        status, signal_source = parser(page, variant_label, variant_id, url=url)
        logger.debug("watch %s: retailer parser → %s (source: %s)", watch_id, status, signal_source)
    else:
        status, signal_source = detect_stock(page, variant_label, variant_id)
        logger.debug("watch %s: generic detector → %s (source: %s)", watch_id, status, signal_source)

    # --- Log the check ---
    insert_check_log(
        watch_id=watch_id,
        status=status,
        signal_source=signal_source,
        raw_signal=method,
    )

    # --- Update watch last_status + last_check ---
    update_watch_status(watch_id, status)
    logger.info("watch %s: status=%s", watch_id, status)

    # --- Double-confirmation logic ---
    current_count = consecutive_counts.get(watch_id, 0)

    if status == "IN_STOCK":
        new_count = current_count + 1
        consecutive_counts[watch_id] = new_count
        logger.debug("watch %s: consecutive IN_STOCK count = %d", watch_id, new_count)

        if new_count >= 2 and watch_id not in notified_for_streak:
            # Two consecutive IN_STOCK readings and not yet notified for this streak → notify
            logger.info(
                "watch %s: double-confirmed IN_STOCK (count=%d) — sending notification",
                watch_id,
                new_count,
            )
            _send_notifications(watch, status)
            notified_for_streak.add(watch_id)
    else:
        # OUT_OF_STOCK or UNKNOWN — reset the streak
        if current_count > 0:
            logger.debug(
                "watch %s: status=%s — resetting consecutive count from %d to 0",
                watch_id,
                status,
                current_count,
            )
        consecutive_counts[watch_id] = 0
        notified_for_streak.discard(watch_id)


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------

def run() -> None:
    """Start the infinite polling loop."""
    logger.info(
        "Worker starting — PRO interval=%ds, FREE interval=%ds, loop_sleep=%ds",
        CHECK_INTERVAL_PRO,
        CHECK_INTERVAL_FREE,
        LOOP_SLEEP,
    )

    while True:
        try:
            watches = get_active_watches()
            logger.info("Fetched %d active watch(es)", len(watches))
        except Exception:
            logger.exception("Failed to fetch active watches — will retry next loop")
            time.sleep(LOOP_SLEEP)
            continue

        for watch in watches:
            if not _is_due(watch):
                logger.debug("watch %s: not yet due — skipping", watch.get("id"))
                continue

            try:
                _process_watch(watch)
            except Exception:
                logger.exception(
                    "watch %s: unhandled error — skipping to next watch",
                    watch.get("id"),
                )

        logger.info("Loop complete — sleeping %ds", LOOP_SLEEP)
        time.sleep(LOOP_SLEEP)


if __name__ == "__main__":
    run()
