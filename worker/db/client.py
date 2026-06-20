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
    """Return all active watches with plan info from subscriptions."""
    watches_resp = (
        supabase.table("watches")
        .select("*")
        .eq("is_active", True)
        .execute()
    )
    rows: list[dict] = watches_resp.data or []
    if not rows:
        return []

    user_ids = list({row["user_id"] for row in rows})
    subs_resp = (
        supabase.table("subscriptions")
        .select("user_id, plan")
        .in_("user_id", user_ids)
        .execute()
    )
    plan_map: dict[str, str] = {
        s["user_id"]: s["plan"] for s in (subs_resp.data or [])
    }

    for row in rows:
        row["plan"] = plan_map.get(row["user_id"], "free")
    return rows


def get_user_email(user_id: str) -> str | None:
    """Fetch user email via Supabase Admin API."""
    try:
        response = supabase.auth.admin.get_user_by_id(user_id)
        return response.user.email if response.user else None
    except Exception:
        return None


def get_user_phone(user_id: str) -> str | None:
    """Fetch verified user phone from user_metadata via Supabase Admin API."""
    try:
        response = supabase.auth.admin.get_user_by_id(user_id)
        if response.user and response.user.user_metadata:
            meta = response.user.user_metadata
            phone = meta.get("phone")
            verified = meta.get("phone_verified", False)
            if phone and verified:
                return phone
    except Exception:
        pass
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
    price: float | None = None,
    variant_label: str | None = None,
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
    if price is not None:
        row["price"] = price
    if variant_label is not None:
        row["variant_label"] = variant_label
    supabase.table("check_logs").insert(row).execute()


def update_watch_metadata(
    watch_id: str,
    name: str | None = None,
    image_url: str | None = None,
    price: float | None = None,
) -> None:
    """Update product metadata on a watch (called after enrichment scrape)."""
    patch: dict = {}
    if name is not None:
        patch["name"] = name
    if image_url is not None:
        patch["image_url"] = image_url
    if price is not None:
        patch["price"] = price
    if patch:
        supabase.table("watches").update(patch).eq("id", watch_id).execute()


def insert_notification(watch_id: str, channel: str, success: bool = True) -> None:
    """Insert a row into notifications."""
    supabase.table("notifications").insert({
        "watch_id": watch_id,
        "channel": channel,
        "success": success,
    }).execute()
