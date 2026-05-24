# Worker Restocking — Plan d'implémentation

## Vue d'ensemble

Le worker est un process Python autonome qui tourne en boucle. Il interroge Supabase pour récupérer les watches actives, scrape chaque URL avec Scrapling, détecte si la variante surveillée est disponible, et envoie les notifications.

```
Supabase (watches) → Worker → Scrapling → Détection stock → Supabase (check_logs) → Resend/Twilio
```

---

## Structure des fichiers

```
worker/
├── main.py                  # Boucle principale, orchestration
├── .env                     # Variables d'environnement (copié depuis .env.example)
├── .env.example             # Template de config
├── requirements.txt         # Dépendances Python
├── db/
│   ├── __init__.py
│   └── client.py            # Client Supabase service_role + helpers
├── scraper/
│   ├── __init__.py
│   ├── fetcher.py           # Fetcher/StealthyFetcher avec fallback automatique
│   ├── detectors.py         # Stratégies de détection stock génériques
│   └── retailers/
│       ├── __init__.py      # Registry retailer → parser
│       ├── zara.py          # Parser Zara (dataLayer + API interne)
│       └── cos.py           # Parser COS (API stock)
└── notifier/
    ├── __init__.py
    ├── email.py             # Resend — template email notif restock
    └── sms.py               # Twilio — SMS notif restock
```

---

## Base de données (schéma existant)

Tables utilisées par le worker (en lecture/écriture via service_role) :

| Table | Opérations worker |
|---|---|
| `watches` | SELECT (watches actives) + UPDATE (last_status, last_check) |
| `check_logs` | INSERT (résultat de chaque check) |
| `notifications` | INSERT (notif envoyée) |
| `subscriptions` | SELECT (plan de l'utilisateur → fréquence de check) |
| `auth.users` | SELECT (email de l'utilisateur pour notif) |

Champs `watches` importants :
- `url` — URL produit à scraper
- `variant_label` — libellé taille/couleur ex: "S / Noir"
- `variant_id` — identifiant technique retailer (optionnel, aide la détection)
- `last_status` — dernier statut connu (IN_STOCK / OUT_OF_STOCK / UNKNOWN)
- `last_check` — timestamp du dernier check

---

## Logique principale (`main.py`)

```
boucle infinie:
  1. Récupérer toutes les watches actives depuis Supabase
  2. Grouper par domaine (max 1 requête simultanée par domaine)
  3. Pour chaque watch:
     a. Vérifier si c'est l'heure de checker (Pro: 5 min, Free: 15 min)
     b. Scraper l'URL → obtenir le statut
     c. Écrire dans check_logs
     d. Mettre à jour last_status + last_check sur la watch
     e. Si statut = IN_STOCK ET était OUT_OF_STOCK avant → incrémenter compteur
     f. Si compteur_consecutif_IN_STOCK >= 2 → envoyer notification
  4. Dormir 60 secondes
```

**Double confirmation** : 2 checks consécutifs IN_STOCK avant notification, pour éviter les faux positifs (variante éphémère, bug retailer).

**Rate limiting par domaine** : délai aléatoire 2–8s entre checks du même domaine. Max 1 request simultanée par domaine.

---

## Scraping (`scraper/fetcher.py`)

### Stratégie de fetching (3 niveaux)

```
1. Fetcher (HTTP pur, léger, rapide)
   → Si status 403 / 429 / CloudFlare détecté :
2. StealthyFetcher (headless Playwright avec fingerprint bypass)
   → Si timeout / challenge non résolu :
3. StealthyFetcher(solve_cloudflare=True) (résolution active CF)
```

```python
from scrapling.fetchers import Fetcher, StealthyFetcher

async def fetch_with_fallback(url: str):
    # Tentative 1 : HTTP pur
    page = await Fetcher.async_get(url, stealthy_headers=True)
    if page.status in (200, 304):
        return page, "http"

    # Tentative 2 : headless stealth
    page = await StealthyFetcher.async_fetch(url, headless=True)
    if page.status == 200:
        return page, "stealth"

    # Tentative 3 : résolution CF active
    page = await StealthyFetcher.async_fetch(url, solve_cloudflare=True)
    return page, "stealth_cf"
```

---

## Détection stock (`scraper/detectors.py`)

### Stratégies génériques (ordre de priorité)

**1. dataLayer / digitalData JSON** (le plus fiable)
```python
# Chercher window.dataLayer ou window.digitalData dans le HTML brut
# Contient souvent : { "stock": "inStock" } ou { "availability": "in_stock" }
import json, re

def detect_data_layer(page) -> str | None:
    script = page.css('script:contains("dataLayer")::text').get()
    # parser le JSON, chercher les clés stock/availability
```

**2. Bouton Add to Cart désactivé**
```python
# <button disabled> ou class contenant "out-of-stock", "sold-out"
btn = page.css('button[data-action="add-to-bag"], button[data-add-to-cart]')
if btn and btn.css('::attr(disabled)').get():
    return "OUT_OF_STOCK"
```

**3. Attributs variante**
```python
# <li data-size="S" data-available="false"> ou class="size--unavailable"
# Chercher la variante spécifique via variant_label / variant_id
```

**4. Texte "rupture de stock" / "out of stock"**
```python
# Fallback textuel — fragile mais utile
keywords_out = ["rupture", "out of stock", "sold out", "épuisé", "indisponible"]
keywords_in  = ["ajouter au panier", "add to cart", "add to bag", "en stock"]
```

---

## Parsers retailer (`scraper/retailers/`)

### Zara (`zara.py`)

Zara expose un API JSON interne :
```
GET https://www.zara.com/fr/fr/-p{PRODUCT_ID}.html
→ window.__NEXT_DATA__ contient la disponibilité par taille
```

Clé à parser : `props.pageProps.product.detail.colors[].sizes[].availability`
Valeurs : `"in_stock"` / `"out_of_stock"` / `"low_stock"`

### COS (`cos.py`)

COS (groupe H&M) utilise une API stock :
```
GET https://www.cos.com/api/product/{PRODUCT_ID}/availability
→ JSON { "sizes": [{ "label": "S", "available": true }] }
```

### Autres retailers (générique)

Utiliser les 4 stratégies de `detectors.py` dans l'ordre.

---

## Notifications

### Email (`notifier/email.py`) — Resend

Template HTML envoyé via `resend.Emails.send()` :

```
Sujet : ✅ [Nom produit] — Taille [S] est de retour !
Corps  : Nom produit, image, variante, prix actuel, CTA "Voir le produit"
         + "Désactiver cette alerte" link
```

Envoyé pour : plans Free et Pro.

### SMS (`notifier/sms.py`) — Twilio

```
[Restocking] Taille S / Noir — {Nom produit} est de retour !
→ {URL courte}
```

Envoyé pour : plan Pro uniquement.

---

## Variables d'environnement (`.env`)

```env
# Supabase (service_role — accès total, ne jamais exposer côté client)
SUPABASE_URL=https://ulbmuhswccfvhnpvlsns.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# Resend
RESEND_API_KEY=...
RESEND_FROM=alertes@restocking.app

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Worker config
CHECK_INTERVAL_PRO=300        # 5 min en secondes
CHECK_INTERVAL_FREE=900       # 15 min en secondes
DOMAIN_DELAY_MIN=2            # délai min entre requêtes même domaine (s)
DOMAIN_DELAY_MAX=8            # délai max
```

---

## Déploiement Railway

```dockerfile
# Pas de Dockerfile nécessaire — Railway détecte Python automatiquement
# Procfile ou start command :
python main.py
```

Variables d'env à configurer dans Railway dashboard (identiques à `.env`).

**Playwright dans Railway** : nécessite `playwright install --with-deps chromium` au build. À ajouter dans `railway.toml` ou via un script de build.

```toml
# railway.toml
[build]
builder = "nixpacks"

[build.nixpacksPlan.phases.setup]
cmds = ["pip install -r requirements.txt", "playwright install --with-deps chromium"]

[deploy]
startCommand = "python main.py"
```

---

## Ordre d'implémentation

1. `db/client.py` — client Supabase + helpers (get_active_watches, update_watch_status, insert_check_log, insert_notification)
2. `scraper/fetcher.py` — fetch_with_fallback
3. `scraper/detectors.py` — 4 stratégies génériques
4. `scraper/retailers/zara.py` — parser Zara
5. `scraper/retailers/cos.py` — parser COS
6. `scraper/retailers/__init__.py` — registry domaine → parser
7. `notifier/email.py` — Resend
8. `notifier/sms.py` — Twilio
9. `main.py` — boucle principale + double confirmation
10. Test local avec une vraie URL Zara
11. `railway.toml` — config déploiement

---

## Points de vigilance

- **RLS désactivé côté worker** : le client service_role bypasse les policies RLS — normal, le worker agit pour tous les utilisateurs.
- **Double confirmation** : ne pas notifier si seulement 1 check IN_STOCK — les retailers peuvent afficher une dispo éphémère.
- **Pas de spam** : après une notification envoyée, ne plus notifier pour la même watch tant qu'elle n'est pas repassée OUT_OF_STOCK.
- **Playwright en prod** : `StealthyFetcher` nécessite Chromium installé — à anticiper dans le build Railway.
- **Scrapling version** : le requirements.txt a `0.2.9` — vérifier que l'API `async_fetch` est disponible dans cette version avant de coder.
