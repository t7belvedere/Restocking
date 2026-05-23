# PRD — Restocking
**restocking.app**
**Alertes de retour en stock, taille-spécifiques, pour les acheteurs de mode EU**
*Version 2.0 — document de référence pour la construction du MVP*

---

## 1. Problème

Les acheteurs de mode en ligne ratent les restocks parce que :

- Les alertes natives des retailers (Zara, Aritzia, COS, Uniqlo…) sont lentes (45 min à 24h de délai), partielles, ou absentes
- Les outils généralistes (Distill, Visualping) génèrent des faux positifs massifs sur les sites fashion en SPA, et ne font pas de détection par variante (taille/couleur)
- Il n'existe aucun service consumer-facing qui couvre les grands retailers EU mid-market non-Shopify

**La douleur documentée** : des utilisateurs vérifient manuellement 20 à 30 fois par jour, certains se lèvent la nuit pour checker. Les threads Reddit sur Aritzia et Zara montrent des alertes natives arrivant après que le stock soit déjà épuisé.

---

## 2. Solution

Service web (restocking.app) qui surveille des URLs de produits mode, détecte le retour en stock **par variante (taille + couleur)**, et envoie une notification en moins de 5 minutes.

**Proposition de valeur en une phrase** : *"Colle l'URL, choisis ta taille — on t'alerte avant que ce soit reparti." — restocking.app*

---

## 3. Utilisateur cible (MVP)

**Persona principal — la seule cible du MVP** :

> Femme ou homme, 22–38 ans, EU (France, UK, Allemagne en priorité). Achète sur Zara, COS, Aritzia, Uniqlo, Sézane, Arket, Mango. A déjà raté un article en rupture dans sa taille. Non-technique — ne sait pas ce qu'est un CSS selector. Utilise principalement son téléphone.

**Personas secondaires (post-MVP uniquement)** :

- Sneakerheads / drops limités
- Parents (jouets/vêtements enfant)
- Gamers (consoles, GPU)

> ⚠️ Le MVP ne cible pas ces personas. Un seul persona, un seul message, un seul canal d'acquisition.

---

## 4. Fonctionnalités MVP (v1)

### 4.1 Core features

| Feature | Description | Priorité |
|---|---|---|
| Ajout URL produit | Coller une URL → détection auto nom, image, prix, variantes disponibles | P0 |
| Sélection de variante | L'utilisateur choisit sa taille/couleur visuellement (pas un sélecteur technique) | P0 |
| Surveillance automatique | Check 30 min (Free) / 5 min (Pro) | P0 |
| Notification email | Email immédiat au restock de la variante exacte | P0 |
| Dashboard | Liste des produits surveillés + statut stock en temps réel | P0 |
| Authentification | Email/password + Google OAuth | P0 |
| Plan Free | 3 produits max, check 30 min, email uniquement | P0 |
| Plan Pro (7,99€/mois) | 20 produits, check 5 min, email + SMS | P0 |
| Landing page | Page de conversion avec liste d'attente **avant tout développement** | P0 |

### 4.2 Hors scope MVP (v2+)

- Notification push mobile (PWA)
- Historique des prix + graphe
- Alerte baisse de prix
- Plan Business (50+ produits, API, webhook)
- Extension Chrome
- Support US retailers
- Application mobile native

---

## 5. Stack technique

### Frontend
- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS + shadcn/ui**
- Déploiement : **Vercel**

### Backend
- **Supabase** : PostgreSQL, Auth, Edge Functions
- **Stripe** : abonnements (Checkout + Customer Portal)

### Scraping (worker Python)
- **Python 3.11 + Scrapling**
- Stratégie d'extraction (ordre de priorité) :
  1. **HTTP Fetcher** → parse `digitalData` / `dataLayer` JSON embarqué (signal e-commerce universel)
  2. **Détection bouton "Add to Cart"** : attribut `disabled` → signal le plus fiable pour le statut stock
  3. **Détection attributs variante** : `data-size`, `data-color`, classes CSS spécifiques au retailer
  4. **Fallback DynamicFetcher (Playwright)** uniquement si les 3 étapes précédentes échouent (coûteux)
- **Confirmation double** : 2 checks consécutifs IN_STOCK avant d'envoyer une notification (anti faux positifs)
- Déploiement worker : **Railway** (simple, scalable, pas de gestion serveur)

### Notifications
- **Resend** : emails transactionnels
- **Twilio** : SMS (plan Pro uniquement)

---

## 6. Modèle de données

```sql
-- Produits surveillés
create table watches (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  url           text not null,
  name          text,
  image_url     text,
  price         numeric,
  -- Variante sélectionnée par l'utilisateur
  variant_label text,           -- ex : "Taille S / Bleu marine" (affiché à l'utilisateur)
  variant_id    text,           -- identifiant technique côté retailer (ex: "sku-12345-S-navy")
  -- Statut
  last_status   text default 'UNKNOWN', -- IN_STOCK | OUT_OF_STOCK | UNKNOWN
  last_check    timestamptz,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- Historique des checks
create table check_logs (
  id            uuid primary key default gen_random_uuid(),
  watch_id      uuid references watches not null,
  status        text not null,       -- IN_STOCK | OUT_OF_STOCK | UNKNOWN
  price         numeric,
  signal_source text,                -- 'dataLayer' | 'add_to_cart_btn' | 'variant_attr' | 'playwright'
  raw_signal    text,                -- valeur brute détectée (pour debug)
  checked_at    timestamptz default now()
);

-- Notifications envoyées
create table notifications (
  id            uuid primary key default gen_random_uuid(),
  watch_id      uuid references watches not null,
  channel       text not null,       -- 'email' | 'sms'
  sent_at       timestamptz default now(),
  success       boolean default true
);

-- Plans utilisateurs (miroir Stripe)
create table subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null unique,
  plan          text default 'free', -- 'free' | 'pro'
  stripe_sub_id text,
  current_period_end timestamptz,
  updated_at    timestamptz default now()
);
```

---

## 7. Architecture du worker de scraping

```
Cron job (toutes les 5 min pour Pro, 30 min pour Free)
    ↓
Récupère les watches actives depuis Supabase
(groupées par domaine pour éviter le rate limiting)
    ↓
Pour chaque URL + variante :

  ÉTAPE 1 — HTTP Fetcher (Scrapling)
  ├── Parse digitalData / dataLayer JSON
  ├── Si variante trouvée → extrait availability
  └── Si vide → ÉTAPE 2

  ÉTAPE 2 — Détection bouton Add to Cart
  ├── Cherche button[disabled] ou button.out-of-stock
  ├── Vérifie attributs data-variant correspondant à variant_id
  └── Si SPA détectée (pas de contenu statique) → ÉTAPE 3

  ÉTAPE 3 — DynamicFetcher Playwright (fallback)
  └── Rendu complet → reprend ÉTAPE 1 + 2 sur le DOM rendu

  RÉSULTAT
  ├── Log dans check_logs (avec signal_source + raw_signal)
  ├── Si nouveau statut = IN_STOCK ET check précédent = IN_STOCK (confirmation double)
  │   └── Déclenche notification (email / SMS selon plan)
  └── Met à jour last_status + last_check dans watches
```

**Règles anti-détection** :
- Rotation User-Agent (pool de 10+ UA réels)
- Délai aléatoire entre checks du même domaine (2–8 secondes)
- Max 1 requête simultanée par domaine
- Respect des headers Accept-Language (fr-FR, en-GB selon retailer)

---

## 8. Monétisation

| Plan | Prix | Produits surveillés | Fréquence check | Notifications |
|---|---|---|---|---|
| **Free** | 0€ | 3 | 30 min | Email |
| **Pro** | 7,99€/mois | 20 | 5 min | Email + SMS |
| **Pro annuel** | 59€/an (~4,90€/mois) | 20 | 5 min | Email + SMS |

> Le plan annuel réduit le churn et améliore le cash flow. À promouvoir dès l'onboarding.

**Limites techniques par plan** :
- Free : DynamicFetcher désactivé (trop coûteux), HTTP uniquement
- Pro : DynamicFetcher autorisé, SMS activé, priorité dans la queue de scraping

---

## 9. Retailers cibles MVP

Priorité de support dans l'ordre :

| Retailer | Pays | Difficulté scraping | Alerte native |
|---|---|---|---|
| Zara | EU | Moyenne (SPA) | Partielle, 3 jours de délai |
| COS | EU | Faible | Absente |
| Uniqlo | EU | Faible | Partielle |
| Aritzia | EU/US | Faible | Documentée cassée |
| Mango | EU | Faible | Absente |
| Sézane | FR | Faible | Absente |
| ASOS | UK/EU | Moyenne | Délai 45 min |
| Arket | EU | Faible | Absente |

> Commencer par COS, Sézane, Mango — HTTP simple, pas de SPA agressive. Zara en dernier (le plus complexe).

---

## 10. Métriques de succès

### Semaine 0 (avant code)
- 80+ pré-inscriptions sur la landing page en 2 semaines

### 3 mois post-lancement
- 500 comptes créés
- 50 abonnés Pro (taux de conversion Free→Pro ≥ 10%)
- Taux de détection restock correct > 95%
- Délai moyen de détection < 8 min (plan Pro)
- Taux de faux positifs < 2% (grâce à la confirmation double)
- Churn mensuel < 5%

### Indicateur clé de santé produit
> **Taux de détection** = restocks correctement détectés / total restocks survenus
> Mesurable via check_logs : comparer les IN_STOCK détectés aux signaux réels.

---

## 11. Risques et mitigations

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Cloudflare bloque le scraping | Haute | Critique | Scrapling bypass intégré + fallback Playwright + proxy résidentiel si nécessaire (Oxylabs, ~50€/mois) |
| Faux positifs (stock incorrect côté retailer) | Moyenne | Élevé | Confirmation double sur 2 checks consécutifs avant notification |
| Coûts infra explosent | Faible | Élevé | Rate limiting strict par plan, Playwright désactivé en Free, batch async |
| Stripe/RGPD compliance EU | Faible | Moyen | Politique de confidentialité, données EU uniquement (Supabase EU region), pas de stockage données personnelles inutiles |
| robots.txt des retailers | Haute | Faible | Scraping d'informations publiques uniquement, pas de login, pas d'automatisation d'achat — risque légal faible mais réel |

---

## 12. Roadmap

```
SEMAINE 0 (avant tout code)
├── Landing page simple (Next.js statique ou Framer)
├── Formulaire pré-inscription email
├── Posts Reddit ciblés (r/frugalmalefashion, r/femalefashionadvice, r/Zara, r/Aritzia)
└── Objectif : 80 pré-inscrits → GO | < 30 → pivot message

SEMAINE 1-2
├── Setup projet Next.js 15 + Supabase + Stripe
├── Auth (email + Google OAuth)
├── Dashboard basique (liste des watches, statut)
└── Ajout URL + sélection variante (UI)

SEMAINE 3
├── Worker Python (Scrapling)
├── Détection stock multi-étapes (dataLayer → bouton → Playwright)
├── Cron job Railway (5 min / 30 min selon plan)
└── Tests sur COS, Sézane, Mango (retailers les plus simples)

SEMAINE 4
├── Notifications email (Resend)
├── Confirmation double anti-faux-positifs
├── Logging complet (signal_source, raw_signal)
└── Tests end-to-end sur 3 retailers

SEMAINE 5
├── Intégration Stripe (Free/Pro/Pro annuel)
├── Customer Portal (gestion abonnement)
├── SMS Twilio (plan Pro)
└── Limites par plan dans le worker

SEMAINE 6
├── Support Zara + Aritzia (plus complexes)
├── Polish UI + onboarding
├── Emails transactionnels (bienvenue, confirmation watch, alerte restock)
└── Bêta privée (pré-inscrits semaine 0)
```

---

## 13. Décisions d'architecture à documenter

Ces décisions doivent être prises explicitement avant de coder :

- [ ] **Région Supabase** : choisir EU (Frankfurt) pour conformité RGPD
- [ ] **Gestion des proxies** : commencer sans proxy, ajouter si Cloudflare bloque (budget ~50€/mois)
- [ ] **Queue de scraping** : simple cron Railway pour le MVP, migrer vers BullMQ si besoin de scale
- [ ] **Détection variante** : implémenter un parser par retailer ou pattern universel ? → commencer par pattern universel, parser spécifique si nécessaire
- [ ] **Position robots.txt** : documenter la décision explicitement dans le code (commentaire légal)
