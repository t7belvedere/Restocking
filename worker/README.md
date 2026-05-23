# Restocking Worker

Worker Python de scraping — surveille les URLs de produits et détecte les retours en stock.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium  # Pour le DynamicFetcher (fallback)

cp .env.example .env
# Remplir .env avec les clés Supabase (service_role) + Resend + Twilio
```

## Structure (à implémenter en semaine 3)

```
worker/
├── main.py              # Point d'entrée, cron loop
├── scraper/
│   ├── __init__.py
│   ├── fetcher.py       # HTTPFetcher + DynamicFetcher (Scrapling)
│   ├── detectors.py     # dataLayer, add_to_cart_btn, variant_attr
│   └── retailers/       # Parsers spécifiques par retailer (si nécessaire)
│       ├── __init__.py
│       ├── zara.py
│       └── cos.py
├── notifier/
│   ├── __init__.py
│   ├── email.py         # Resend
│   └── sms.py           # Twilio
└── db/
    ├── __init__.py
    └── client.py        # Supabase service_role client
```

## Stratégie de détection (voir PRD section 7)

1. HTTP Fetcher → parse `digitalData` / `dataLayer` JSON
2. Détection bouton "Add to Cart" (attribut `disabled`)
3. Détection attributs variante (`data-size`, `data-color`)
4. Fallback DynamicFetcher Playwright (plan Pro uniquement)

**Confirmation double** : 2 checks consécutifs IN_STOCK avant notification.

## Déploiement Railway

- Cron job toutes les 5 min (plan Pro) + 30 min (plan Free)
- Max 1 requête simultanée par domaine
- Délai aléatoire 2–8s entre checks du même domaine
