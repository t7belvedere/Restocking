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

import json
import logging
import os
import random
import re
import threading
import time
import urllib.parse
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

# Disable Chromium sandbox for container environments (Railway).
# scrapling's PlaywrightEngine hard-codes chromium_sandbox=True which
# crashes on Docker/container runtimes that lack kernel sandbox support.
# We monkey-patch before any scrapling imports run.
def _patch_playwright_sandbox() -> None:
    try:
        from scrapling.engines.pw import PlaywrightEngine
        _orig = PlaywrightEngine._PlaywrightEngine__launch_kwargs

        def _patched(self):
            kw = _orig(self)
            kw["chromium_sandbox"] = False
            return kw

        PlaywrightEngine._PlaywrightEngine__launch_kwargs = _patched
    except Exception:
        pass

_patch_playwright_sandbox()

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
    get_user_phone,
    insert_check_log,
    insert_notification,
    update_watch_metadata,
    update_watch_status,
)
from notifier.discord import send_discord_notification
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

    # UNKNOWN watches: retry after 120s instead of immediately.
    # Prevents infinite re-check loops when stock detection can't read a page.
    if watch.get("last_status") == "UNKNOWN":
        interval = 120

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


def _extract_price(html: str) -> float | None:
    """Extract price from HTML meta tags or regex fallback."""
    for key in ("og:price:amount", "product:price:amount"):
        m = re.search(
            rf'<meta[^>]+(?:property|name)=["\']{key}["\'][^>]+content=["\']([^"\']+)["\']',
            html,
            re.IGNORECASE,
        )
        if m:
            try:
                return float(m.group(1).replace(",", "."))
            except (ValueError, TypeError):
                pass
    m = re.search(r"(\d{1,4}(?:[.,]\d{2})?)\s*€", html)
    if m:
        try:
            return float(m.group(1).replace(",", "."))
        except (ValueError, TypeError):
            pass
    return None


def _extract_jsonld_variant_data(html: str, url: str) -> tuple[float | None, str | None]:
    """Extract variant-specific price and label from Shopify ProductGroup JSON-LD.

    Matches the ?variant= query param to a hasVariant @id in the JSON-LD.
    Returns (price, variant_label) — both can be None.
    """
    from urllib.parse import parse_qs, urlparse as _urlparse

    variant_qp = None
    try:
        qs = parse_qs(_urlparse(url).query)
        variant_qp = qs.get("variant", [None])[0]
    except Exception:
        pass

    for m in re.finditer(
        r'<script type="application/ld\+json"[^>]*>(.*?)</script>',
        html, re.DOTALL,
    ):
        try:
            data = json.loads(m.group(1))
        except Exception:
            continue
        if not isinstance(data, dict):
            continue
        items = data.get("@graph") or [data]
        for item in items:
            if item.get("@type") != "ProductGroup":
                continue
            variants_raw = item.get("hasVariant") or []
            base_name = item.get("name", "")
            for v in variants_raw:
                v_id = v.get("@id", "")
                v_name = v.get("name", "")
                offers = v.get("offers") or {}
                v_price = offers.get("price")
                # Match by variant query param
                if variant_qp and variant_qp in v_id:
                    label = v_name
                    if base_name and v_name.startswith(base_name):
                        label = v_name[len(base_name):].strip(" -–\xa0")
                    elif " - " in v_name:
                        label = v_name.rsplit(" - ", 1)[-1].strip()
                    try:
                        return (float(v_price) if v_price else None), label
                    except (ValueError, TypeError):
                        return None, label
            # Fallback: return first variant's price
            if variants_raw:
                v0 = variants_raw[0]
                v0_price = (v0.get("offers") or {}).get("price")
                v0_name = v0.get("name", "")
                label = v0_name
                if base_name and v0_name.startswith(base_name):
                    label = v0_name[len(base_name):].strip(" -–\xa0")
                elif " - " in v0_name:
                    label = v0_name.rsplit(" - ", 1)[-1].strip()
                try:
                    return (float(v0_price) if v0_price else None), label
                except (ValueError, TypeError):
                    return None, label
            return None, None
    return None, None


def _enrich_watch(watch_id: str, page) -> None:
    """Extract product metadata from a Scrapling page and update the watch row.

    Mirrors the frontend's analyzeUrl logic: reads og:meta tags, price, etc.
    """
    html = getattr(page, "html_content", "")
    if not html:
        return

    def _pick_meta(prop: str) -> str | None:
        m = re.search(
            rf'<meta[^>]+(?:property|name)=["\']{prop}["\'][^>]+content=["\']([^"\']+)["\']',
            html,
            re.IGNORECASE,
        )
        return m.group(1) if m else None

    name = _pick_meta("og:title")
    image_url = _pick_meta("og:image")
    price = _extract_price(html)

    if name or image_url or price is not None:
        update_watch_metadata(watch_id, name=name, image_url=image_url, price=price)
        logger.info("watch %s: metadata enriched — name=%s price=%s", watch_id, name, price)


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
        # Extract brand name from URL domain
        brand_name = None
        try:
            hostname = urllib.parse.urlparse(url).hostname or ""
            # e.g. "www.zara.com" → "Zara", "rixolondon.com" → "Rixo London"
            parts = hostname.replace("www.", "").split(".")[0]
            brand_name = " ".join(w.capitalize() for w in parts.replace("-", " ").split())
        except Exception:
            pass

        success = send_restock_email(
            to_email=to_email,
            product_name=name,
            variant_label=variant_label,
            product_url=url,
            watch_id=watch_id,
            image_url=watch.get("image_url"),
            price=watch.get("price"),
            brand_name=brand_name,
        )
        insert_notification(watch_id, channel="email", success=success)
        if success:
            logger.info("watch %s: email notification sent to %s", watch_id, to_email)
        else:
            logger.warning("watch %s: email notification FAILED for %s", watch_id, to_email)
    else:
        logger.warning("watch %s: could not resolve email for user %s — skipping email", watch_id, user_id)

    # Discord — always sent alongside email when webhook is configured
    discord_ok = send_discord_notification(
        product_name=name,
        variant_label=variant_label,
        product_url=url,
        brand_name=brand_name,
        price=watch.get("price"),
        image_url=watch.get("image_url"),
        watch_id=watch_id,
    )
    if discord_ok:
        logger.info("watch %s: Discord notification sent", watch_id)

    # SMS — Pro plan only
    if plan == "pro":
        to_phone = get_user_phone(user_id)
        if to_phone:
            sms_success = send_restock_sms(
                to_phone=to_phone,
                product_name=name,
                variant_label=variant_label,
                product_url=url,
                brand_name=brand_name,
                price=watch.get("price"),
            )
            insert_notification(watch_id, channel="sms", success=sms_success)
            if sms_success:
                logger.info("watch %s: SMS notification sent to %s", watch_id, to_phone)
            else:
                logger.warning("watch %s: SMS notification FAILED for %s", watch_id, to_phone)
        else:
            logger.info(
                "watch %s: SMS skipped — no phone saved in profile",
                watch_id,
            )


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
    # Proxy is reserved for Pro users as a last resort (IPRoyal is expensive)
    plan = watch.get("plan", "free")
    use_proxy = plan == "pro"
    page, method = fetch_with_fallback(url, use_proxy=use_proxy)
    logger.debug("watch %s: fetched via %s (proxy=%s)", watch_id, method, use_proxy)

    # --- Enrich metadata if missing ---
    if not watch.get("name"):
        try:
            _enrich_watch(watch_id, page)
        except Exception:
            logger.exception("watch %s: enrichment failed — continuing with stock check", watch_id)

    # --- Detect stock ---
    parser = get_parser(url)
    if parser is not None:
        status, signal_source = parser(page, variant_label, variant_id, url=url)
        logger.debug("watch %s: retailer parser → %s (source: %s)", watch_id, status, signal_source)
        # Fallback to generic detector if retailer parser returns UNKNOWN
        if status == "UNKNOWN":
            gen_status, gen_source = detect_stock(page, variant_label, variant_id)
            if gen_status != "UNKNOWN":
                status, signal_source = gen_status, gen_source
                logger.debug("watch %s: fallback to generic → %s (source: %s)", watch_id, status, signal_source)
    else:
        status, signal_source = detect_stock(page, variant_label, variant_id)
        logger.debug("watch %s: generic detector → %s (source: %s)", watch_id, status, signal_source)

    # --- Log the check ---
    html = getattr(page, "html_content", "")
    check_price = _extract_price(html)
    check_variant = variant_label

    # Shopify: get variant-specific price + label from JSON-LD
    jld_price, jld_variant = _extract_jsonld_variant_data(html, url)
    if jld_price is not None:
        check_price = jld_price
    if not check_variant:
        check_variant = jld_variant

    insert_check_log(
        watch_id=watch_id,
        status=status,
        signal_source=signal_source,
        raw_signal=method,
        price=check_price,
        variant_label=check_variant,
    )

    # --- Update watch metadata (price + variant if enriched) ---
    update_watch_status(watch_id, status)

    # Store variant_label + price on watch if newly discovered
    if check_variant and not variant_label:
        try:
            update_watch_metadata(watch_id, price=check_price, variant_label=check_variant)
        except Exception:
            pass
    elif check_price is not None:
        try:
            update_watch_metadata(watch_id, price=check_price)
        except Exception:
            pass

    logger.info("watch %s: status=%s variant=%s price=%s", watch_id, status, check_variant, check_price)

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

def _start_api_server() -> None:
    """Launch the FastAPI server in a background daemon thread."""
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    logger.info("API server starting on port %d", port)

    # Run in a daemon thread so it doesn't block the main process exiting
    config = uvicorn.Config("api:app", host="0.0.0.0", port=port, log_level="info")
    server = uvicorn.Server(config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()


def run() -> None:
    """Start the API server and the infinite polling loop."""
    _start_api_server()

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
