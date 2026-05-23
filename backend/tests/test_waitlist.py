"""Backend tests for restocking waitlist API."""
import os
import time
import random
import string

import pytest
import requests


BASE_URL = os.environ.get("NEXT_PUBLIC_BACKEND_URL") or "https://38d41397-b1cf-4258-b44b-ea8632fcb75e.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")


def _rand_email() -> str:
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=10))
    return f"test_{int(time.time())}_{suffix}@example.com"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Health endpoint ---
class TestHealth:
    def test_health_ok(self, client):
        r = client.get(f"{BASE_URL}/api/health", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"
        assert data.get("service") == "restocking-waitlist"


# --- Waitlist signup ---
class TestWaitlistSignup:
    def test_signup_valid_email(self, client):
        email = _rand_email()
        r = client.post(f"{BASE_URL}/api/waitlist", json={"email": email, "locale": "en"}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True
        assert data["already_registered"] is False
        assert isinstance(data["position"], int)
        assert data["position"] > 0
        assert "message" in data

    def test_signup_duplicate_returns_already_registered(self, client):
        email = _rand_email()
        r1 = client.post(f"{BASE_URL}/api/waitlist", json={"email": email}, timeout=15)
        assert r1.status_code == 200
        assert r1.json()["already_registered"] is False

        r2 = client.post(f"{BASE_URL}/api/waitlist", json={"email": email}, timeout=15)
        assert r2.status_code == 200
        data = r2.json()
        assert data["ok"] is True
        assert data["already_registered"] is True

    def test_signup_invalid_email_returns_400(self, client):
        r = client.post(f"{BASE_URL}/api/waitlist", json={"email": "not-an-email"}, timeout=15)
        assert r.status_code == 400, r.text

    def test_signup_locale_french_message(self, client):
        email = _rand_email()
        r = client.post(f"{BASE_URL}/api/waitlist", json={"email": email, "locale": "fr"}, timeout=15)
        assert r.status_code == 200
        msg = r.json()["message"]
        assert "Bienvenue" in msg or "n°" in msg

    def test_signup_locale_english_message(self, client):
        email = _rand_email()
        r = client.post(f"{BASE_URL}/api/waitlist", json={"email": email, "locale": "en"}, timeout=15)
        assert r.status_code == 200
        msg = r.json()["message"]
        assert "Welcome" in msg or "number" in msg


# --- Waitlist stats ---
class TestWaitlistStats:
    def test_stats_returns_total(self, client):
        r = client.get(f"{BASE_URL}/api/waitlist/stats", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "total" in data
        assert isinstance(data["total"], int)
        assert data["total"] >= 0

    def test_stats_increments_after_signup(self, client):
        r1 = client.get(f"{BASE_URL}/api/waitlist/stats", timeout=15)
        before = r1.json()["total"]

        email = _rand_email()
        r2 = client.post(f"{BASE_URL}/api/waitlist", json={"email": email}, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["already_registered"] is False

        r3 = client.get(f"{BASE_URL}/api/waitlist/stats", timeout=15)
        after = r3.json()["total"]
        assert after == before + 1
