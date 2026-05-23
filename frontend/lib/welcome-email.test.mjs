import test from "node:test";
import assert from "node:assert/strict";

import { buildWaitlistWelcomeEmail } from "./welcome-email.mjs";

test("buildWaitlistWelcomeEmail returns french subject and branded html", () => {
  const email = buildWaitlistWelcomeEmail({
    email: "marine@example.com",
    locale: "fr",
  });

  assert.equal(email.subject, "Bienvenue chez Restocking.");
  assert.match(email.html, /marine@example\.com/);
  assert.match(email.html, /Tu es officiellement sur la liste/);
  assert.match(email.html, /3 mois de Pro offerts/);
  assert.match(email.html, /background:\s*#171717/i);
});

test("buildWaitlistWelcomeEmail returns english copy when locale is en", () => {
  const email = buildWaitlistWelcomeEmail({
    email: "alex@example.com",
    locale: "en",
  });

  assert.equal(email.subject, "Welcome to Restocking.");
  assert.match(email.html, /You are officially on the list/);
  assert.match(email.html, /3 free months of Pro/);
  assert.match(email.html, /restocking\.app/);
});

test("buildWaitlistWelcomeEmail falls back to french for unknown locales", () => {
  const email = buildWaitlistWelcomeEmail({
    email: "sam@example.com",
    locale: "de",
  });

  assert.equal(email.subject, "Bienvenue chez Restocking.");
  assert.match(email.html, /sam@example\.com/);
  assert.match(email.html, /On t'écrira dès que l'accès est prêt/);
});
