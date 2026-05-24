"""Supabase client (service_role) + DB helper functions for the restocking worker."""

import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

_url = os.getenv("SUPABASE_URL", "")
_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
if not _url or not _key:
    raise EnvironmentError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")

supabase: Client = create_client(_url, _key)


def get_active_watches() -> list[dict]:
    """Return all active watches with subscription plan.

    Email is not fetched here — use get_user_email(user_id) when needed.
    """
    response = (
        supabase.table("watches")
        .select("*, subscriptions!inner(plan)")
        .eq("is_active", True)
        .execute()
    )
    rows = response.data or []
    result = []
    for row in rows:
        flat = dict(row)
        subs = flat.pop("subscriptions", None)
        if subs:
            flat["plan"] = subs.get("plan") if isinstance(subs, dict) else (subs[0].get("plan") if subs else None)
        result.append(flat)
    return result


def get_user_email(user_id: str) -> str | None:
    """Fetch user email via Supabase Admin API."""
    try:
        response = supabase.auth.admin.get_user(user_id)
        return response.user.email if response.user else None
    except Exception:
        return None


def update_watch_status(watch_id: str, status: str) -> None:
    """Update last_status and last_check on a watch."""
    supabase.table("watches").update({
        "last_status": status,
        "last_check": datetime.now(timezone.utc).isoformat(),
    }).eq("id", watch_id).execute()


def insert_check_log(
    watch_id: str,
    status: str,
    signal_source: str | None = None,
    raw_signal: str | None = None,
) -> None:
    """Insert a row into check_logs.

    signal_source valid values: 'dataLayer', 'add_to_cart_btn', 'variant_attr', 'playwright'.
    """
    row: dict = {
        "watch_id": watch_id,
        "status": status,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
    if signal_source is not None:
        row["signal_source"] = signal_source
    if raw_signal is not None:
        row["raw_signal"] = raw_signal
    supabase.table("check_logs").insert(row).execute()


def insert_notification(watch_id: str, channel: str, success: bool = True) -> None:
    """Insert a row into notifications."""
    supabase.table("notifications").insert({
        "watch_id": watch_id,
        "channel": channel,
        "success": success,
    }).execute()
