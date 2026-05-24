/**
 * Master retailer catalogue for restocking.app.
 *
 * Each entry carries:
 *  - name:    the brand display text (kept locale-neutral — brands are global)
 *  - domain:  the brand's primary website (used to fetch the official logo
 *             from Brandfetch CDN — https://docs.brandfetch.com/docs/logo-link)
 *  - country: short region tag shown in the tile
 *  - status:  'live' | 'beta' | 'soon' — drives the badge + status filter
 *  - note_fr / note_en: the small descriptor under the wordmark
 *  - wordmark: name of a brand-typography preset (see brand-wordmark.tsx).
 *              We render the brand name in a font/spacing that *evokes* the
 *              brand identity AS A FALLBACK when the official logo fails to
 *              load (offline preview, Brandfetch quota, etc).
 *
 * Important: official logos are fetched via Brandfetch CDN at runtime; if
 * the request fails we degrade gracefully to the typographic wordmark.
 */

export type RetailerStatus = "optimized" | "beta";

export type WordmarkStyle =
  | "serif-bold"
  | "serif-italic"
  | "italiana-thin"
  | "italiana-caps"
  | "anton-caps"
  | "mono-caps"
  | "bricolage-tight"
  | "bricolage-wide"
  | "dm-thin-caps"
  | "dm-bold"
  | "geist-bold";

export type Retailer = {
  name: string;
  domain: string;
  country: string;
  status: RetailerStatus;
  wordmark: WordmarkStyle;
  accent?: "ink" | "orange" | "blue" | "lime" | "red";
  note_fr: string;
  note_en: string;
};

export const RETAILERS: Retailer[] = [
  // ── HIGH-STREET ──────────────────────────────────────────────────
  { name: "ZARA", domain: "zara.com", country: "EU", status: "optimized", wordmark: "serif-bold",
    note_fr: "API Next.js native", note_en: "Native Next.js API" },
  { name: "COS", domain: "cos.com", country: "EU", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "API stock dédiée", note_en: "Dedicated stock API" },
  { name: "BERSHKA", domain: "bershka.com", country: "EU", status: "optimized", wordmark: "anton-caps",
    note_fr: "LLM validé, parfait", note_en: "LLM validated, perfect" },
  { name: "Pull&Bear", domain: "pullandbear.com", country: "EU", status: "optimized", wordmark: "bricolage-tight",
    note_fr: "LLM + JSON variants", note_en: "LLM + JSON variants" },
  { name: "Stradivarius", domain: "stradivarius.com", country: "EU", status: "optimized", wordmark: "serif-italic",
    note_fr: "Tailles EU parfaites", note_en: "EU sizes perfect" },
  { name: "ASOS", domain: "asos.com", country: "UK", status: "optimized", wordmark: "geist-bold",
    note_fr: "LLM nettoie les variantes", note_en: "LLM cleans variants" },
  { name: "Zalando", domain: "zalando.fr", country: "FR", status: "optimized", wordmark: "bricolage-wide",
    note_fr: "Multi-marques validé", note_en: "Multi-brand validated" },
  { name: "Na-KD", domain: "na-kd.com", country: "SE", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Tailles + image OK", note_en: "Sizes + image OK" },
  { name: "Gina Tricot", domain: "ginatricot.com", country: "SE", status: "optimized", wordmark: "bricolage-tight",
    note_fr: "Couleurs avec codes", note_en: "Colors with codes" },
  { name: "Pimkie", domain: "pimkie.fr", country: "FR", status: "optimized", wordmark: "serif-italic",
    note_fr: "Stock par variante OK", note_en: "Per-variant stock OK" },

  // ── PREMIUM FR ───────────────────────────────────────────────────
  { name: "Sézane", domain: "sezane.com", country: "FR", status: "optimized", wordmark: "italiana-thin",
    note_fr: "Shopify, parfait", note_en: "Shopify, perfect" },
  { name: "MAJE", domain: "maje.com", country: "FR", status: "optimized", wordmark: "bricolage-wide",
    note_fr: "Tailles EU validées", note_en: "EU sizes validated" },
  { name: "SANDRO", domain: "sandro-paris.com", country: "FR", status: "optimized", wordmark: "bricolage-wide",
    note_fr: "5 couleurs extraites", note_en: "5 colors extracted" },
  { name: "Ba&sh", domain: "ba-sh.com", country: "FR", status: "optimized", wordmark: "serif-italic",
    note_fr: "Variantes propres OK", note_en: "Clean variants OK" },
  { name: "Jacquemus", domain: "jacquemus.com", country: "FR", status: "optimized", wordmark: "italiana-caps",
    note_fr: "Couleurs luxe OK", note_en: "Luxury colors OK" },
  { name: "A.P.C.", domain: "apc.fr", country: "FR", status: "optimized", wordmark: "mono-caps",
    note_fr: "Denim japonais surveillé", note_en: "Japanese denim watched" },
  { name: "AMI PARIS", domain: "amiparis.com", country: "FR", status: "optimized", wordmark: "geist-bold",
    note_fr: "Cœur de stock", note_en: "Heart of stock" },
  { name: "POLÈNE", domain: "polene-paris.com", country: "FR", status: "optimized", wordmark: "serif-bold",
    note_fr: "Numéro Un & Neuf", note_en: "Numéro Un & Neuf" },

  // ── LUXURY / DESIGNER ─────────────────────────────────────────────
  { name: "GUCCI", domain: "gucci.com", country: "IT", status: "optimized", wordmark: "serif-bold",
    note_fr: "Tailles IT 36-48 OK", note_en: "IT sizes 36-48 OK" },
  { name: "PRADA", domain: "prada.com", country: "IT", status: "optimized", wordmark: "serif-bold",
    note_fr: "Accessoires convoités", note_en: "Wanted accessories" },
  { name: "BALENCIAGA", domain: "balenciaga.com", country: "FR", status: "optimized", wordmark: "anton-caps",
    note_fr: "Couleurs framboise OK", note_en: "Framboise color OK" },
  { name: "Maison Margiela", domain: "maisonmargiela.com", country: "FR", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Pointures 35-42 OK", note_en: "Shoe sizes 35-42 OK" },
  { name: "Acne Studios", domain: "acnestudios.com", country: "SE", status: "optimized", wordmark: "italiana-thin",
    note_fr: "Tailles 32-42 OK", note_en: "Sizes 32-42 OK" },
  { name: "Coperni", domain: "coperni.com", country: "FR", status: "optimized", wordmark: "geist-bold",
    note_fr: "Sacs et accessoires", note_en: "Bags and accessories" },
  { name: "Saint Laurent", domain: "ysl.com", country: "FR", status: "beta", wordmark: "dm-thin-caps",
    note_fr: "Pépites vintage & new", note_en: "Vintage & new gems" },
  { name: "LOEWE", domain: "loewe.com", country: "ES", status: "beta", wordmark: "serif-bold",
    note_fr: "Maroquinerie d'exception", note_en: "Fine leather goods" },

  // ── PREMIUM UK ───────────────────────────────────────────────────
  { name: "Rixo", domain: "rixolondon.com", country: "UK", status: "optimized", wordmark: "italiana-caps",
    note_fr: "XXS-6XL validé", note_en: "XXS-6XL validated" },
  { name: "House of Sunny", domain: "houseofsunny.com", country: "UK", status: "optimized", wordmark: "anton-caps",
    note_fr: "XS-3XL parfait", note_en: "XS-3XL perfect" },

  // ── SCANDI / EU PREMIUM ──────────────────────────────────────────
  { name: "GANNI", domain: "ganni.com", country: "DK", status: "optimized", wordmark: "anton-caps",
    note_fr: "24 couleurs extraites", note_en: "24 colors extracted" },
  { name: "Sporty & Rich", domain: "sportyandrich.com", country: "US/UK", status: "optimized", wordmark: "dm-bold",
    note_fr: "Shopify clean OK", note_en: "Clean Shopify OK" },
  { name: "TOTEME", domain: "toteme-studio.com", country: "SE", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Manteaux convoités", note_en: "Coat hunters welcome" },

  // ── US PREMIUM ──────────────────────────────────────────────────
  { name: "Cult Gaia", domain: "cultgaia.com", country: "US", status: "optimized", wordmark: "italiana-thin",
    note_fr: "Pointures 35-42 OK", note_en: "Shoe sizes 35-42 OK" },
  { name: "Doen", domain: "shopdoen.com", country: "US", status: "optimized", wordmark: "serif-italic",
    note_fr: "3 couleurs parfaites", note_en: "3 colors perfect" },
  { name: "Réalisation Par", domain: "realisationpar.com", country: "US", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "XS-XL + couleurs OK", note_en: "XS-XL + colors OK" },
  { name: "REFORMATION", domain: "thereformation.com", country: "US", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Tailles volatiles", note_en: "Sizes fly" },
  { name: "ARITZIA", domain: "aritzia.com", country: "CA/US", status: "optimized", wordmark: "italiana-caps",
    note_fr: "Alerte native cassée", note_en: "Native alert broken" },

  // ── STREET / URBAN ──────────────────────────────────────────────
  { name: "Stüssy", domain: "stussy.com", country: "US/EU", status: "optimized", wordmark: "anton-caps",
    note_fr: "Shopify, XS-XXL OK", note_en: "Shopify, XS-XXL OK" },
  { name: "Carhartt WIP", domain: "carhartt-wip.com", country: "EU", status: "optimized", wordmark: "anton-caps",
    note_fr: "9 couleurs validées", note_en: "9 colors validated" },
  { name: "Scuffers", domain: "scuffers.com", country: "FR", status: "optimized", wordmark: "bricolage-tight",
    note_fr: "XS-XXL streetwear", note_en: "XS-XXL streetwear" },
  { name: "Brandy Melville", domain: "brandymelville.com", country: "IT/US", status: "optimized", wordmark: "italiana-thin",
    note_fr: "19 couleurs extraites", note_en: "19 colors extracted" },

  // ── BIJOUX ──────────────────────────────────────────────────────
  { name: "Lou Jewelry", domain: "loujewelry.fr", country: "FR", status: "optimized", wordmark: "italiana-thin",
    note_fr: "Charms par variante OK", note_en: "Charms per variant OK" },
  { name: "ZAG Bijoux", domain: "zagbijoux.fr", country: "FR", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Acier doré + nacre OK", note_en: "Gold steel + nacre OK" },
  { name: "Unique By M", domain: "uniquebym.fr", country: "FR", status: "optimized", wordmark: "serif-italic",
    note_fr: "Colliers acier OK", note_en: "Steel necklaces OK" },

  // ── BABY / KIDS ─────────────────────────────────────────────────
  { name: "Babyboo", domain: "babyboofashion.com", country: "UK", status: "optimized", wordmark: "bricolage-wide",
    note_fr: "XS-XXL robes OK", note_en: "XS-XXL dresses OK" },
  { name: "Suite Benedict", domain: "suitebenedict.com", country: "FR", status: "optimized", wordmark: "italiana-caps",
    note_fr: "XS-M italien OK", note_en: "XS-M Italian OK" },

  // ── SNEAKERS ────────────────────────────────────────────────────
  { name: "Salomon", domain: "salomon.com", country: "FR", status: "optimized", wordmark: "geist-bold",
    note_fr: "XT-6 restock rapide", note_en: "Fast XT-6 restocks" },

  // ── BETA / ROADMAP ───────────────────────────────────────────────
  { name: "Victoria's Secret", domain: "victoriassecret.com", country: "US", status: "beta", wordmark: "serif-italic",
    note_fr: "US sizes 34-44 OK", note_en: "US sizes 34-44 OK" },
  { name: "Gimaguas", domain: "gimaguas.com", country: "ES", status: "beta", wordmark: "italiana-thin",
    note_fr: "Shopify, 3 couleurs OK", note_en: "Shopify, 3 colors OK" },
  { name: "Edikted", domain: "edikted.com", country: "US", status: "beta", wordmark: "bricolage-tight",
    note_fr: "Fast fashion US OK", note_en: "US fast fashion OK" },
  { name: "Princess Polly", domain: "princesspolly.com", country: "AU/US", status: "beta", wordmark: "serif-italic",
    note_fr: "Trendy US OK", note_en: "Trendy US OK" },
  { name: "Subdued", domain: "subdued.com", country: "IT", status: "beta", wordmark: "dm-thin-caps",
    note_fr: "Magento taille OK", note_en: "Magento size OK" },
];

export const RETAILER_COUNTS = {
  total: RETAILERS.length,
  optimized: RETAILERS.filter((r) => r.status === "optimized").length,
  beta: RETAILERS.filter((r) => r.status === "beta").length,
};
