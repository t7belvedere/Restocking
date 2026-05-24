"""Supabase client (service_role) + DB helper functions for the restocking worker."""

import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

_url: str = os.environ["SUPABASE_URL"]
_key: str = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supabase: Client = create_client(_url, _key)


def get_active_watches() -> list[dict]:
    """Return all active watches with user subscription info.

    Query: SELECT watches.*, subscriptions.plan, auth.users.email
    FROM watches
    JOIN subscriptions ON watches.user_id = subscriptions.user_id
    JOIN auth.users ON watches.user_id = auth.users.id
    WHERE watches.active = true
    """
    response = (
        supabase.table("watches")
        .select(
            "*, subscriptions!inner(plan), users:user_id(email)"
        )
        .eq("active", True)
        .execute()
    )
    rows = response.data or []
    # Flatten nested joins so callers get a flat dict per watch
    result = []
    for row in rows:
        flat = dict(row)
        subs = flat.pop("subscriptions", None)
        users = flat.pop("users", None)
        if subs:
            flat["plan"] = subs.get("plan") if isinstance(subs, dict) else (subs[0].get("plan") if subs else None)
        if users:
            flat["email"] = users.get("email") if isinstance(users, dict) else (users[0].get("email") if users else None)
        result.append(flat)
    return result


def update_watch_status(
    watch_id: str,
    status: str,
    consecutive_in_stock: int,
) -> None:
    """Update last_status, last_check (now), consecutive_in_stock on a watch."""
    supabase.table("watches").update(
        {
            "last_status": status,
            "last_check": datetime.now(timezone.utc).isoformat(),
            "consecutive_in_stock": consecutive_in_stock,
        }
    ).eq("id", watch_id).execute()


def insert_check_log(
    watch_id: str,
    status: str,
    method: str,
    error: str | None = None,
) -> None:
    """Insert a row into check_logs table.

    Fields: watch_id, status, method (http/stealth/stealth_cf), error, checked_at (now)
    """
    supabase.table("check_logs").insert(
        {
            "watch_id": watch_id,
            "status": status,
            "method": method,
            "error": error,
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }
    ).execute()


def insert_notification(
    watch_id: str,
    user_id: str,
    channel: str,
) -> None:
    """Insert a row into notifications table.

    Fields: watch_id, user_id, channel (email/sms), sent_at (now)
    """
    supabase.table("notifications").insert(
        {
            "watch_id": watch_id,
            "user_id": user_id,
            "channel": channel,
            "sent_at": datetime.now(timezone.utc).isoformat(),
        }
    ).execute()
