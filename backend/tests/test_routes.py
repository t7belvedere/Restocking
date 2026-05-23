"""Marketing + auth route smoke tests for the Next.js frontend served via the preview ingress.

These tests verify HTTP-level behavior only (no DOM assertions). They confirm that:
  - Marketing pages return 200
  - An unknown path returns 404
  - /auth/callback and /auth/confirm exist and respond with a 307 redirect
"""

import os
import pytest
import requests

BASE_URL = os.environ.get("NEXT_PUBLIC_BACKEND_URL") or os.environ.get(
    "REACT_APP_BACKEND_URL"
)
if not BASE_URL:
    # Fall back to reading from frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("NEXT_PUBLIC_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
    except FileNotFoundError:
        pass

assert BASE_URL, "BASE_URL must be set"
BASE_URL = BASE_URL.rstrip("/")


# --- Marketing pages should all 200 ---
@pytest.mark.parametrize(
    "path",
    ["/", "/how-it-works", "/retailers", "/pricing", "/faq", "/manifesto", "/login", "/signup"],
)
def test_marketing_pages_load(path):
    r = requests.get(f"{BASE_URL}{path}", timeout=15)
    assert r.status_code == 200, f"GET {path} -> {r.status_code}"


# --- Unknown route returns 404 ---
def test_unknown_route_returns_404():
    r = requests.get(f"{BASE_URL}/this-route-does-not-exist-xyz-1234", timeout=15)
    assert r.status_code == 404


# --- /auth/callback redirects to /login when no code or Supabase not configured ---
def test_auth_callback_redirects():
    r = requests.get(f"{BASE_URL}/auth/callback", timeout=15, allow_redirects=False)
    assert r.status_code in (302, 307, 308), f"expected redirect, got {r.status_code}"
    loc = r.headers.get("Location", "")
    assert "/login" in loc, f"expected redirect to /login, got {loc}"
    # error param should be set to one of the documented codes
    assert (
        "error=auth-not-configured" in loc
        or "error=missing-oauth-code" in loc
        or "error=auth-client-init-failed" in loc
    ), f"unexpected error param: {loc}"


# --- /auth/confirm redirects similarly ---
def test_auth_confirm_redirects():
    r = requests.get(f"{BASE_URL}/auth/confirm", timeout=15, allow_redirects=False)
    assert r.status_code in (302, 307, 308)
    loc = r.headers.get("Location", "")
    assert "/login" in loc
    assert (
        "error=auth-not-configured" in loc
        or "error=missing-token" in loc
        or "error=auth-client-init-failed" in loc
    )
