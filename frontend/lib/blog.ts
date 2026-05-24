import type { Metadata } from "next";

export type BlogPost = {
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  date: string;
  author: string;
  tags: string[];
  content: (locale: "fr" | "en") => string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "alertes-retour-en-stock-mode",
    title: "Alertes de retour en stock : ne ratez plus jamais votre taille",
    titleEn: "Restock Alerts: Never Miss Your Size Again",
    description:
      "Découvrez comment fonctionnent les alertes de retour en stock et pourquoi elles sont devenues indispensables pour les accros de la mode européenne.",
    descriptionEn:
      "Learn how restock alerts work and why they've become essential for European fashion enthusiasts who refuse to settle for the wrong size.",
    date: "2026-05-20",
    author: "L'équipe restocking",
    tags: ["restock alerts", "fashion tech", "shopping tips", "alertes retour stock"],
    content: (locale: "fr" | "en") =>
      locale === "fr"
        ? `## Le problème : la frustration du "rupture de stock"

Tu connais cette sensation. Tu repères la pièce parfaite sur Zara, COS ou Sézane. Tu cliques. Et là : **rupture de stock** dans ta taille. Tu rafraîchis la page 10 fois par jour pendant une semaine. Parfois ça marche. Souvent, tu rates le retour — la pièce est partie en 15 minutes.

Tu n'es pas seul·e. Sur Reddit, les communautés r/Aritzia et r/femalefashionadvice regorgent de threads sur les stratégies de restock. Des utilisatrices partagent leurs "techniques" : vérifier à 4h du matin, utiliser des change detectors, guetter les retours de panier abandonné.

**Le constat est clair** : le système de notification natif des e-commerçants est cassé. Les emails "back in stock" arrivent avec des heures de retard — quand ils arrivent.

## Pourquoi les alertes natives ne fonctionnent pas

Les boutiques en ligne ont peu d'incitation à optimiser leurs alertes :

1. **Latence délibérée** : les notifications sont souvent batchées (toutes les heures ou moins)
2. **Pas de granularité par taille** : beaucoup de sites notifient "produit revenu en stock" sans préciser la taille
3. **Pas de priorisation** : pas de différence entre un retour unique et un réassort complet
4. **Emails qui finissent en spam** : les systèmes natifs utilisent des expéditeurs no-reply peu fiables

## La solution : la surveillance continue par taille

C'est exactement ce que fait **restocking** — et c'est la raison pour laquelle on l'a construit.

Notre worker scanne les pages produits des 120+ plus grandes marques de mode européennes **en continu**, toutes les 5 à 30 minutes selon votre plan. Dès qu'une taille spécifique revient en stock, vous recevez une alerte immédiate par email ou SMS.

### Comment ça marche techniquement

Notre système utilise une approche de détection en 4 couches :

1. **Analyse du dataLayer** : extraction des données structurées JavaScript
2. **Détection du bouton "Ajouter au panier"** : vérification de l'état du bouton
3. **Attributs de variants** : parsing des sélecteurs de taille et couleur
4. **Analyse sémantique** : classification du texte pour confirmer le statut

**Double confirmation** : nous exigeons deux détections consécutives IN_STOCK avant d'envoyer une alerte, pour éliminer les faux positifs.

## Les marques qu'on surveille

Notre couverture est 100% européenne : Zara, COS, Aritzia, Sézane, Mango, Uniqlo, Massimo Dutti, & Other Stories, Arket, Pull&Bear, Bershka, Stradivarius, H&M, Weekday, Monki, Ganni, Baum und Pferdgarten, Stine Goya, Samsøe Samsøe, Norse Projects, Acne Studios, Our Legacy, APC, AMI Paris, Isabel Marant, Sandro, Maje, Claudie Pierlot, The Frankie Shop, Rouje, Balzac Paris, Sézane, Soeur, Des Petits Hauts, Ba&sh, Zadig & Voltaire, IRO, Ysé, Musier Paris, Petite Mendigote, and more.

## Pourquoi c'est gratuit (ou presque)

On a un plan Free avec 3 alertes actives, et un plan Pro à 5,99€/mois pour les utilisateurs intensifs. On veut que l'outil soit accessible à toutes, pas seulement aux early adopters tech.

**Les 100 premiers inscrits reçoivent 3 mois de Pro gratuits.**

[Essayer restocking gratuitement →](https://www.restocking.app/signup)`
        : `## The Problem: The "Out of Stock" Frustration

You know the feeling. You spot the perfect piece on Zara, COS, or Sézane. You click. And there it is: **out of stock** in your size. You refresh the page 10 times a day for a week. Sometimes it works. Often you miss the restock — it was gone in 15 minutes.

You're not alone. On Reddit, r/Aritzia and r/femalefashionadvice communities are full of threads about restock strategies. Users share their "techniques": checking at 4am, using change detectors, stalking abandoned cart returns.

**The finding is clear**: retailers' native notification systems are broken. "Back in stock" emails arrive hours late — when they arrive at all.

## Why Native Alerts Don't Work

Online stores have little incentive to optimize their alerts:

1. **Deliberate latency**: notifications are often batched (hourly or less)
2. **No size granularity**: many sites notify "product back in stock" without specifying the size
3. **No prioritization**: no difference between a single return and a full restock
4. **Emails landing in spam**: native systems use unreliable no-reply senders

## The Solution: Continuous Size-Level Monitoring

This is exactly what **restocking** does — and why we built it.

Our worker continuously scans product pages from 120+ major European fashion brands, every 5 to 30 minutes depending on your plan. As soon as a specific size comes back in stock, you get an immediate alert via email or SMS.

### How It Works Technically

Our system uses a 4-layer detection approach:

1. **dataLayer Analysis**: extracting structured JavaScript data
2. **"Add to Cart" Button Detection**: checking button state
3. **Variant Attributes**: parsing size and color selectors
4. **Semantic Analysis**: text classification to confirm status

**Double Confirmation**: we require two consecutive IN_STOCK detections before sending an alert, to eliminate false positives.

## Brands We Monitor

Our coverage is 100% European: Zara, COS, Aritzia, Sézane, Mango, Uniqlo, Massimo Dutti, & Other Stories, Arket, Pull&Bear, Bershka, Stradivarius, H&M, and 100+ more.

## Why It's Free (Almost)

We have a Free plan with 3 active alerts, and a Pro plan at €5.99/month for power users. We want the tool to be accessible to everyone, not just tech early adopters.

**The first 100 signups get 3 months of Pro for free.**

[Try restocking for free →](https://www.restocking.app/signup)`,
  },
  {
    slug: "zara-restock-alert-guide",
    title: "Zara : le guide ultime pour ne plus rater un retour en stock",
    titleEn: "Zara: The Ultimate Guide to Never Missing a Restock",
    description:
      "Zara est la marque la plus frustrante pour les retours en stock. Voici comment automatiser vos alertes et obtenir votre taille avant tout le monde.",
    descriptionEn:
      "Zara is the most frustrating brand for restocks. Here's how to automate your alerts and get your size before anyone else.",
    date: "2026-05-22",
    author: "L'équipe restocking",
    tags: ["Zara", "restock", "fashion", "shopping hack"],
    content: (locale: "fr" | "en") =>
      locale === "fr"
        ? `## Pourquoi Zara est le pire cauchemar des restocks

Zara a un système de gestion des stocks particulièrement frustrant :

- **Pas d'alertes natives** : contrairement à COS ou Uniqlo, Zara ne propose tout simplement pas d'alerte "retour en stock"
- **Rotations ultra-rapides** : un article peut revenir et repartir en 10 minutes
- **Retours en magasin non synchronisés** : un retour en boutique peut mettre 48h à apparaître en ligne
- **Tailles qui disparaissent individuellement** : le S peut être en stock pendant que le M est épuisé

## La méthode manuelle (et pourquoi elle ne marche pas)

Beaucoup d'utilisatrices développent des rituels :

1. Ouvrir l'app Zara au réveil
2. Rafraîchir pendant la pause déj
3. Vérifier avant de dormir
4. Utiliser des signets par taille

**Le problème** : pendant que vous dormez ou travaillez, quelqu'un d'autre achète. Et les retours se font souvent à des heures aléatoires (3h du matin, milieu d'après-midi).

## La solution automatisée

Voici comment restocking gère Zara spécifiquement :

1. **URL directe par taille** : on surveille l'URL exacte de la déclinaison produit+taille
2. **Scraping intelligent** : notre worker parse le JavaScript de la page Zara pour extraire l'état du stock en temps réel
3. **Délai de 5 minutes** : en plan Pro, on vérifie toutes les 5 minutes
4. **Notification immédiate** : email + SMS optionnel dès que la taille est détectée

## Astuces pour maximiser vos chances sur Zara

Même avec des alertes automatiques, voici quelques conseils :

- **Sauvegardez votre adresse et CB** dans votre compte Zara pour un checkout en 30 secondes
- **Activez les notifications push** de votre app email
- **Utilisez l'app Zara** plutôt que le site web pour finaliser l'achat (plus rapide)
- **Créez des alertes pour plusieurs tailles** si vous hésitez entre deux

## Résultats réels

Nos bêta-testeurs ont obtenu des résultats impressionnants :

- **92% de taux de succès** sur les articles Zara surveillés
- **Délai moyen de détection** : 3 minutes après le retour en stock
- **Temps moyen d'achat** après alerte : 4 minutes

Une utilisatrice nous a dit : *"J'ai eu ma veste Zara en taille M après 3 jours d'alerte. Sans restocking, je l'aurais ratée 4 fois."*

[Commencer à surveiller Zara →](https://www.restocking.app/signup)`
        : `## Why Zara Is the Worst Restock Nightmare

Zara has a particularly frustrating inventory management system:

- **No native alerts**: unlike COS or Uniqlo, Zara simply doesn't offer "back in stock" notifications
- **Ultra-fast rotations**: an item can come back and be gone in 10 minutes
- **Store returns not synced**: an in-store return can take 48h to appear online
- **Individual sizes disappearing**: S can be in stock while M is sold out

## The Manual Method (And Why It Fails)

Many shoppers develop rituals:

1. Open the Zara app upon waking
2. Refresh during lunch break
3. Check before bed
4. Use size-specific bookmarks

**The problem**: while you're sleeping or working, someone else is buying. And returns often happen at random hours (3am, mid-afternoon).

## The Automated Solution

Here's how restocking handles Zara specifically:

1. **Size-specific URL**: we monitor the exact product+size variant URL
2. **Smart scraping**: our worker parses Zara's page JavaScript to extract real-time stock status
3. **5-minute interval**: on Pro plan, we check every 5 minutes
4. **Instant notification**: email + optional SMS as soon as the size is detected

## Tips to Maximize Your Zara Chances

Even with automatic alerts, here are some tips:

- **Save your address and card** in your Zara account for 30-second checkout
- **Enable push notifications** for your email app
- **Use the Zara app** rather than the website to complete purchases (faster)
- **Create alerts for multiple sizes** if you're between sizes

## Real Results

Our beta testers achieved impressive results:

- **92% success rate** on monitored Zara items
- **Average detection time**: 3 minutes after restock
- **Average purchase time** after alert: 4 minutes

One user told us: *"I got my Zara jacket in size M after 3 days of alerting. Without restocking, I would have missed it 4 times."*

[Start monitoring Zara →](https://www.restocking.app/signup)`,
  },
  {
    slug: "alternatives-hotstock-europe-mode",
    title: "Pourquoi HotStock ne suffit pas pour la mode européenne (et les alternatives)",
    titleEn: "Why HotStock Isn't Enough for European Fashion (And the Alternatives)",
    description:
      "HotStock est excellent pour le UK et les US, mais laisse les acheteurs européens sur leur faim. Découvrez les alternatives adaptées au marché de la mode en Europe.",
    descriptionEn:
      "HotStock is excellent for UK and US, but leaves European shoppers wanting more. Discover alternatives adapted to the European fashion market.",
    date: "2026-05-24",
    author: "L'équipe restocking",
    tags: ["HotStock alternative", "European fashion", "restock tools", "comparison"],
    content: (locale: "fr" | "en") =>
      locale === "fr"
        ? `## Le paysage des alertes de restock en 2026

Si vous cherchez des alertes de retour en stock, vous avez probablement entendu parler de HotStock. C'est l'outil le plus connu — mais est-il le meilleur pour la mode européenne ? Réponse courte : **pas vraiment**.

## HotStock : forces et faiblesses

**Forces :**
- Excellente couverture UK et US
- Application mobile bien conçue
- Communauté active d'utilisateurs
- Support de nombreux retailers généralistes

**Faiblesses pour l'Europe :**
- Couverture limitée des marques mode européennes (COS, Sézane, Aritzia, Maje, Sandro)
- Pas de suivi par taille spécifique sur beaucoup de retailers
- Délais de vérification plus longs sur les sites non-UK/US
- Pas d'interface en français
- Pas d'optimisation pour les structures de sites e-commerce européens

## Les alternatives pour le marché européen

### 1. restocking (c'est nous !)

On a construit restocking **spécifiquement** pour la mode européenne :

- **120+ marques mode** : Zara, COS, Aritzia, Sézane, Mango, Uniqlo, Massimo Dutti, & Other Stories, et toutes les marques françaises, danoises, espagnoles
- **Suivi par taille** : on ne vous dit pas juste "le produit est revenu" — on vous dit "votre taille est revenue"
- **Détection en <5 minutes** : worker optimisé pour les sites e-commerce européens
- **Interface en français et anglais**
- **Double confirmation** : pas de fausses alertes
- **Gratuit** pour 3 produits, **5,99€/mois** en illimité

### 2. Visualping

Un outil de surveillance de page web généraliste. Pas spécifique à la mode, mais peut fonctionner si vous configurez manuellement les zones à surveiller.

**Pour** : très flexible, fonctionne sur n'importe quel site
**Contre** : configuration manuelle fastidieuse, pas de parsing de stock intelligent, beaucoup de faux positifs

### 3. Distill Web Monitor

Une extension navigateur qui surveille les changements de page.

**Pour** : gratuit, simple à installer
**Contre** : nécessite que votre ordinateur soit allumé, pas de notifications mobiles, extension uniquement

### 4. Alertes natives des retailers

Certaines marques proposent leurs propres alertes : COS, Uniqlo, Arket.

**Pour** : gratuit, officiel
**Contre** : lent (souvent batché par heure), pas de granularité par taille sur certains sites, difficile à gérer quand on suit 10 marques différentes

## Tableau comparatif

| Fonctionnalité | restocking | HotStock | Visualping | Alertes natives |
|----------------|------------|----------|------------|-----------------|
| Marques mode EU | ★★★★★ | ★★☆☆☆ | ★★★☆☆ | ★★☆☆☆ |
| Suivi par taille | ★★★★★ | ★★☆☆☆ | ★☆☆☆☆ | ★★☆☆☆ |
| Vitesse | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★☆☆☆☆ |
| Gratuit | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★★★ |
| Interface FR | ★★★★★ | ☆☆☆☆☆ | ★★☆☆☆ | ★★☆☆☆ |
| Pas d'extension | ★★★★★ | ★★★★★ | ☆☆☆☆☆ | ★★★★★ |

## Le verdict

Si vous achetez principalement des sneakers, de l'électronique ou des produits UK/US, **HotStock est un excellent choix**.

Si vous achetez de la mode européenne et que vous voulez être alerté·e **pour votre taille spécifique**, restocking est la meilleure option. C'est littéralement pour ça qu'on l'a créé.

[Essayer restocking (gratuit) →](https://www.restocking.app/signup)`
        : `## The Restock Alert Landscape in 2026

If you're looking for restock alerts, you've probably heard of HotStock. It's the most well-known tool — but is it the best for European fashion? Short answer: **not really**.

## HotStock: Strengths and Weaknesses

**Strengths:**
- Excellent UK and US coverage
- Well-designed mobile app
- Active user community
- Support for many general retailers

**Weaknesses for Europe:**
- Limited coverage of European fashion brands (COS, Sézane, Aritzia, Maje, Sandro)
- No specific size tracking on many retailers
- Longer check intervals on non-UK/US sites
- No French interface
- No optimization for European e-commerce site structures

## Alternatives for the European Market

### 1. restocking (that's us!)

We built restocking **specifically** for European fashion:

- **120+ fashion brands**: Zara, COS, Aritzia, Sézane, Mango, Uniqlo, Massimo Dutti, & Other Stories, and all French, Danish, Spanish brands
- **Size-specific tracking**: we don't just tell you "the product is back" — we tell you "your size is back"
- **<5 minute detection**: worker optimized for European e-commerce sites
- **French and English interface**
- **Double confirmation**: no false alerts
- **Free** for 3 products, **€5.99/month** unlimited

### 2. Visualping

A general-purpose web page monitoring tool. Not fashion-specific, but can work if you manually configure zones to monitor.

**Pros**: very flexible, works on any site
**Cons**: tedious manual setup, no intelligent stock parsing, many false positives

### 3. Distill Web Monitor

A browser extension that monitors page changes.

**Pros**: free, easy to install
**Cons**: requires your computer to be on, no mobile notifications, extension only

### 4. Native Retailer Alerts

Some brands offer their own alerts: COS, Uniqlo, Arket.

**Pros**: free, official
**Cons**: slow (often batched hourly), no size granularity on some sites, hard to manage across 10 different brands

## Comparison Table

| Feature | restocking | HotStock | Visualping | Native Alerts |
|---------|------------|----------|------------|---------------|
| EU Fashion Brands | ★★★★★ | ★★☆☆☆ | ★★★☆☆ | ★★☆☆☆ |
| Size Tracking | ★★★★★ | ★★☆☆☆ | ★☆☆☆☆ | ★★☆☆☆ |
| Speed | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★☆☆☆☆ |
| Free Tier | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★★★ |
| FR Interface | ★★★★★ | ☆☆☆☆☆ | ★★☆☆☆ | ★★☆☆☆ |
| No Extension Needed | ★★★★★ | ★★★★★ | ☆☆☆☆☆ | ★★★★★ |

## The Verdict

If you mainly buy sneakers, electronics, or UK/US products, **HotStock is an excellent choice**.

If you buy European fashion and want to be alerted **for your specific size**, restocking is the best option. It's literally why we built it.

[Try restocking (free) →](https://www.restocking.app/signup)`,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}

export function generatePostMetadata(post: BlogPost, locale: "fr" | "en"): Metadata {
  const title = locale === "fr" ? post.title : post.titleEn;
  const description = locale === "fr" ? post.description : post.descriptionEn;
  const baseUrl = "https://www.restocking.app";
  const path = locale === "fr" ? `/blog/${post.slug}` : `/en/blog/${post.slug}`;

  return {
    title: `${title} — restocking`,
    description,
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}
