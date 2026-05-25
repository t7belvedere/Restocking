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
    note_fr: "Nouveautés chaque semaine", note_en: "New drops every week" },
  { name: "COS", domain: "cos.com", country: "EU", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Minimalisme intemporel", note_en: "Timeless minimalism" },
  { name: "BERSHKA", domain: "bershka.com", country: "EU", status: "optimized", wordmark: "anton-caps",
    note_fr: "Tendances à petits prix", note_en: "Affordable trends" },
  { name: "Pull&Bear", domain: "pullandbear.com", country: "EU", status: "optimized", wordmark: "bricolage-tight",
    note_fr: "Style décontracté & cool", note_en: "Casual cool style" },
  { name: "Stradivarius", domain: "stradivarius.com", country: "EU", status: "optimized", wordmark: "serif-italic",
    note_fr: "Féminin & accessible", note_en: "Feminine & accessible" },
  { name: "ASOS", domain: "asos.com", country: "UK", status: "optimized", wordmark: "geist-bold",
    note_fr: "850+ marques mode", note_en: "850+ fashion brands" },
  { name: "Zalando", domain: "zalando.fr", country: "FR", status: "optimized", wordmark: "bricolage-wide",
    note_fr: "Le géant mode européen", note_en: "Europe's fashion giant" },
  { name: "Na-KD", domain: "na-kd.com", country: "SE", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Scandi tendance & frais", note_en: "Fresh Scandi style" },
  { name: "Gina Tricot", domain: "ginatricot.com", country: "SE", status: "optimized", wordmark: "bricolage-tight",
    note_fr: "Mode suédoise cool", note_en: "Cool Swedish fashion" },
  { name: "Pimkie", domain: "pimkie.fr", country: "FR", status: "optimized", wordmark: "serif-italic",
    note_fr: "Mode française abordable", note_en: "Affordable French style" },

  // ── PREMIUM FR ───────────────────────────────────────────────────
  { name: "Sézane", domain: "sezane.com", country: "FR", status: "optimized", wordmark: "italiana-thin",
    note_fr: "L'icône parisienne", note_en: "The Parisian icon" },
  { name: "MAJE", domain: "maje.com", country: "FR", status: "optimized", wordmark: "bricolage-wide",
    note_fr: "Élégance parisienne pointue", note_en: "Sharp Parisian elegance" },
  { name: "SANDRO", domain: "sandro-paris.com", country: "FR", status: "optimized", wordmark: "bricolage-wide",
    note_fr: "Chic effortless", note_en: "Effortless chic" },
  { name: "Ba&sh", domain: "ba-sh.com", country: "FR", status: "optimized", wordmark: "serif-italic",
    note_fr: "La Parisienne moderne", note_en: "The modern Parisian" },
  { name: "Jacquemus", domain: "jacquemus.com", country: "FR", status: "optimized", wordmark: "italiana-caps",
    note_fr: "Le nouveau luxe français", note_en: "New French luxury" },
  { name: "A.P.C.", domain: "apc.fr", country: "FR", status: "optimized", wordmark: "mono-caps",
    note_fr: "Denim brut culte", note_en: "Cult raw denim" },
  { name: "AMI PARIS", domain: "amiparis.com", country: "FR", status: "optimized", wordmark: "geist-bold",
    note_fr: "Cool minimaliste", note_en: "Minimalist cool" },
  { name: "POLÈNE", domain: "polene-paris.com", country: "FR", status: "optimized", wordmark: "serif-bold",
    note_fr: "Sacs qui font parler", note_en: "Bags worth the buzz" },

  // ── LUXURY / DESIGNER ─────────────────────────────────────────────
  { name: "GUCCI", domain: "gucci.com", country: "IT", status: "optimized", wordmark: "serif-bold",
    note_fr: "Luxe italien iconique", note_en: "Iconic Italian luxury" },
  { name: "PRADA", domain: "prada.com", country: "IT", status: "optimized", wordmark: "serif-bold",
    note_fr: "Intemporel & désirable", note_en: "Timeless & desirable" },
  { name: "BALENCIAGA", domain: "balenciaga.com", country: "FR", status: "optimized", wordmark: "anton-caps",
    note_fr: "Avant-garde & volume", note_en: "Avant-garde & volume" },
  { name: "Maison Margiela", domain: "maisonmargiela.com", country: "FR", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Déconstruction d'exception", note_en: "Exceptional deconstruction" },
  { name: "Acne Studios", domain: "acnestudios.com", country: "SE", status: "optimized", wordmark: "italiana-thin",
    note_fr: "Style suédois pointu", note_en: "Sharp Swedish style" },
  { name: "Coperni", domain: "coperni.com", country: "FR", status: "optimized", wordmark: "geist-bold",
    note_fr: "Futurisme mode", note_en: "Fashion futurism" },
  { name: "Saint Laurent", domain: "ysl.com", country: "FR", status: "beta", wordmark: "dm-thin-caps",
    note_fr: "L'essence du cool parisien", note_en: "The essence of Parisian cool" },
  { name: "LOEWE", domain: "loewe.com", country: "ES", status: "beta", wordmark: "serif-bold",
    note_fr: "Craft & désir espagnol", note_en: "Spanish craft & desire" },

  // ── PREMIUM UK ───────────────────────────────────────────────────
  { name: "Rixo", domain: "rixolondon.com", country: "UK", status: "optimized", wordmark: "italiana-caps",
    note_fr: "Imprimés romantiques", note_en: "Romantic prints" },
  { name: "House of Sunny", domain: "houseofsunny.com", country: "UK", status: "optimized", wordmark: "anton-caps",
    note_fr: "Indie cool londonien", note_en: "London indie cool" },

  // ── SCANDI / EU PREMIUM ──────────────────────────────────────────
  { name: "GANNI", domain: "ganni.com", country: "DK", status: "optimized", wordmark: "anton-caps",
    note_fr: "Scandi 2.0 playful", note_en: "Playful Scandi 2.0" },
  { name: "Sporty & Rich", domain: "sportyandrich.com", country: "US/UK", status: "optimized", wordmark: "dm-bold",
    note_fr: "Preppy bien-être", note_en: "Wellness preppy" },
  { name: "TOTEME", domain: "toteme-studio.com", country: "SE", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Luxe discret suédois", note_en: "Discreet Swedish luxury" },

  // ── US PREMIUM ──────────────────────────────────────────────────
  { name: "Cult Gaia", domain: "cultgaia.com", country: "US", status: "optimized", wordmark: "italiana-thin",
    note_fr: "Robes sculpturales", note_en: "Sculptural dresses" },
  { name: "Doen", domain: "shopdoen.com", country: "US", status: "optimized", wordmark: "serif-italic",
    note_fr: "Bohème californienne", note_en: "Californian bohemian" },
  { name: "Réalisation Par", domain: "realisationpar.com", country: "US", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Robes culte virales", note_en: "Viral cult dresses" },
  { name: "REFORMATION", domain: "thereformation.com", country: "US", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Mode durable & cool", note_en: "Cool sustainable fashion" },
  { name: "ARITZIA", domain: "aritzia.com", country: "CA/US", status: "optimized", wordmark: "italiana-caps",
    note_fr: "L'incontournable canadien", note_en: "Canada's essential" },

  // ── STREET / URBAN ──────────────────────────────────────────────
  { name: "Stüssy", domain: "stussy.com", country: "US/EU", status: "optimized", wordmark: "anton-caps",
    note_fr: "Streetwear originel", note_en: "Original streetwear" },
  { name: "Carhartt WIP", domain: "carhartt-wip.com", country: "EU", status: "optimized", wordmark: "anton-caps",
    note_fr: "Workwear réinventé", note_en: "Workwear reinvented" },
  { name: "Scuffers", domain: "scuffers.com", country: "FR", status: "optimized", wordmark: "bricolage-tight",
    note_fr: "Streetwear français", note_en: "French streetwear" },
  { name: "Brandy Melville", domain: "brandymelville.com", country: "IT/US", status: "optimized", wordmark: "italiana-thin",
    note_fr: "Californie effortless", note_en: "California effortless" },

  // ── BIJOUX ──────────────────────────────────────────────────────
  { name: "Lou Jewelry", domain: "loujewelry.fr", country: "FR", status: "optimized", wordmark: "italiana-thin",
    note_fr: "Bijoux dorés délicats", note_en: "Delicate gold jewelry" },
  { name: "ZAG Bijoux", domain: "zagbijoux.fr", country: "FR", status: "optimized", wordmark: "dm-thin-caps",
    note_fr: "Acier doré & nacre", note_en: "Gold steel & nacre" },
  { name: "Unique By M", domain: "uniquebym.fr", country: "FR", status: "optimized", wordmark: "serif-italic",
    note_fr: "Colliers acier fins", note_en: "Fine steel necklaces" },

  // ── BABY / KIDS ─────────────────────────────────────────────────
  { name: "Babyboo", domain: "babyboofashion.com", country: "UK", status: "optimized", wordmark: "bricolage-wide",
    note_fr: "Robes de soirée tendance", note_en: "Trendy evening dresses" },
  { name: "Suite Benedict", domain: "suitebenedict.com", country: "FR", status: "optimized", wordmark: "italiana-caps",
    note_fr: "Mode italienne chic", note_en: "Chic Italian fashion" },

  // ── SNEAKERS ────────────────────────────────────────────────────
  { name: "Salomon", domain: "salomon.com", country: "FR", status: "optimized", wordmark: "geist-bold",
    note_fr: "XT-6 & éditions limitées", note_en: "XT-6 & limited editions" },

  // ── BETA / ROADMAP ───────────────────────────────────────────────
  { name: "Victoria's Secret", domain: "victoriassecret.com", country: "US", status: "beta", wordmark: "serif-italic",
    note_fr: "Lingerie & pyjamas cultes", note_en: "Cult lingerie & sleepwear" },
  { name: "Gimaguas", domain: "gimaguas.com", country: "ES", status: "beta", wordmark: "italiana-thin",
    note_fr: "Slow fashion espagnol", note_en: "Spanish slow fashion" },
  { name: "Edikted", domain: "edikted.com", country: "US", status: "beta", wordmark: "bricolage-tight",
    note_fr: "Fast fashion viral US", note_en: "Viral US fast fashion" },
  { name: "Princess Polly", domain: "princesspolly.com", country: "AU/US", status: "beta", wordmark: "serif-italic",
    note_fr: "Trendy australien", note_en: "Australian trendy" },
  { name: "Subdued", domain: "subdued.com", country: "IT", status: "beta", wordmark: "dm-thin-caps",
    note_fr: "Esthétique italienne cool", note_en: "Cool Italian aesthetic" },

  // ── LIMITED DROPS ─────────────────────────────────────────────────
  { name: "StockX", domain: "stockx.com", country: "US", status: "beta", wordmark: "geist-bold",
    note_fr: "Sneakers & streetwear limités", note_en: "Limited sneakers & streetwear" },
  { name: "Kith", domain: "kith.com", country: "US", status: "beta", wordmark: "serif-bold",
    note_fr: "Drops du lundi convoités", note_en: "Coveted Monday drops" },
  { name: "Aimé Leon Dore", domain: "aimeleondore.com", country: "US", status: "beta", wordmark: "italiana-caps",
    note_fr: "Drops new-yorkais rares", note_en: "Rare NYC drops" },
  { name: "Palace", domain: "palaceskateboards.com", country: "UK", status: "beta", wordmark: "anton-caps",
    note_fr: "Drops skate hebdo cultes", note_en: "Cult weekly skate drops" },
];

export const RETAILER_COUNTS = {
  total: RETAILERS.length,
  optimized: RETAILERS.filter((r) => r.status === "optimized").length,
  beta: RETAILERS.filter((r) => r.status === "beta").length,
};
