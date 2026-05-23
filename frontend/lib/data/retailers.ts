/**
 * Master retailer catalogue for restocking.app.
 *
 * Each entry carries:
 *  - name:    the brand display text (kept locale-neutral — brands are global)
 *  - country: short region tag shown in the tile
 *  - status:  'live' | 'beta' | 'soon' — drives the badge + status filter
 *  - note_fr / note_en: the small descriptor under the wordmark
 *  - wordmark: name of a brand-typography preset (see brand-wordmark.tsx).
 *              We render the brand name in a font/spacing that *evokes* the
 *              brand identity without using their real logo asset.
 *
 * Important: we never use trademarked logo files. Wordmarks are
 * typographic interpretations only.
 */

export type RetailerStatus = "live" | "beta" | "soon";

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
  country: string;
  status: RetailerStatus;
  wordmark: WordmarkStyle;
  accent?: "ink" | "orange" | "blue" | "lime" | "red";
  note_fr: string;
  note_en: string;
};

export const RETAILERS: Retailer[] = [
  // ── HIGH-STREET (Inditex / H&M / Uniqlo family) ─────────────────
  {
    name: "ZARA",
    country: "EU",
    status: "live",
    wordmark: "serif-bold",
    note_fr: "Le boss du restock raté",
    note_en: "The king of missed restocks",
  },
  {
    name: "COS",
    country: "EU",
    status: "live",
    wordmark: "dm-thin-caps",
    note_fr: "Le sweet spot du restock",
    note_en: "The restock sweet spot",
  },
  {
    name: "ARKET",
    country: "EU",
    status: "live",
    wordmark: "bricolage-wide",
    note_fr: "Couvert dès le jour 1",
    note_en: "Covered from day 1",
  },
  {
    name: "& Other Stories",
    country: "EU",
    status: "live",
    wordmark: "serif-italic",
    note_fr: "Tailles fines volatiles",
    note_en: "Smaller sizes fly",
  },
  {
    name: "Weekday",
    country: "EU",
    status: "live",
    wordmark: "bricolage-tight",
    note_fr: "Denim restock chaud",
    note_en: "Denim restocks hot",
  },
  {
    name: "Monki",
    country: "EU",
    status: "live",
    wordmark: "bricolage-tight",
    note_fr: "Petites séries",
    note_en: "Small drops",
  },
  {
    name: "H&M",
    country: "EU",
    status: "live",
    wordmark: "bricolage-tight",
    accent: "red",
    note_fr: "Studio + Conscious surveillés",
    note_en: "Studio + Conscious watched",
  },
  {
    name: "UNIQLO",
    country: "EU",
    status: "live",
    wordmark: "geist-bold",
    accent: "red",
    note_fr: "U et J +J en priorité",
    note_en: "U and +J first",
  },
  {
    name: "MANGO",
    country: "EU",
    status: "live",
    wordmark: "dm-thin-caps",
    note_fr: "HTTP propre, parfait",
    note_en: "Clean HTTP, perfect",
  },
  {
    name: "Massimo Dutti",
    country: "EU",
    status: "live",
    wordmark: "serif-italic",
    note_fr: "Manteaux et cuir",
    note_en: "Coats and leather",
  },
  {
    name: "BERSHKA",
    country: "EU",
    status: "live",
    wordmark: "anton-caps",
    note_fr: "Pour les chasses ado",
    note_en: "Teen drop hunters",
  },
  {
    name: "Pull&Bear",
    country: "EU",
    status: "live",
    wordmark: "bricolage-tight",
    note_fr: "Restock streetwear",
    note_en: "Streetwear restocks",
  },
  {
    name: "Stradivarius",
    country: "EU",
    status: "live",
    wordmark: "serif-italic",
    note_fr: "Drop hebdo",
    note_en: "Weekly drops",
  },

  // ── PREMIUM FR ──────────────────────────────────────────────────
  {
    name: "Sézane",
    country: "FR",
    status: "live",
    wordmark: "italiana-thin",
    note_fr: "Aucune alerte officielle",
    note_en: "No official alert",
  },
  {
    name: "Rouje",
    country: "FR",
    status: "live",
    wordmark: "italiana-thin",
    note_fr: "Précommandes incluses",
    note_en: "Pre-orders included",
  },
  {
    name: "OCTOBRE ÉDITIONS",
    country: "FR",
    status: "beta",
    wordmark: "dm-thin-caps",
    note_fr: "Petites quantités",
    note_en: "Limited runs",
  },
  {
    name: "Soeur",
    country: "FR",
    status: "beta",
    wordmark: "italiana-thin",
    note_fr: "Stock tendu",
    note_en: "Tight stock",
  },
  {
    name: "MAJE",
    country: "FR",
    status: "beta",
    wordmark: "bricolage-wide",
    note_fr: "Soldes très convoités",
    note_en: "Sale items in demand",
  },
  {
    name: "SANDRO",
    country: "FR",
    status: "beta",
    wordmark: "bricolage-wide",
    note_fr: "Pareil que Maje",
    note_en: "Same vibe as Maje",
  },
  {
    name: "Claudie Pierlot",
    country: "FR",
    status: "soon",
    wordmark: "serif-italic",
    note_fr: "Sur la roadmap",
    note_en: "On the roadmap",
  },
  {
    name: "the kooples",
    country: "FR",
    status: "soon",
    wordmark: "dm-thin-caps",
    note_fr: "Sur la roadmap",
    note_en: "On the roadmap",
  },
  {
    name: "A.P.C.",
    country: "FR",
    status: "live",
    wordmark: "mono-caps",
    note_fr: "Denim japonais surveillé",
    note_en: "Japanese denim watched",
  },
  {
    name: "Jacquemus",
    country: "FR",
    status: "beta",
    wordmark: "italiana-caps",
    note_fr: "Drops chaotiques",
    note_en: "Chaotic drops",
  },
  {
    name: "Lemaire",
    country: "FR",
    status: "soon",
    wordmark: "italiana-caps",
    note_fr: "Pré-orders incluses",
    note_en: "Pre-orders included",
  },

  // ── UK ──────────────────────────────────────────────────────────
  {
    name: "ASOS",
    country: "UK",
    status: "beta",
    wordmark: "geist-bold",
    note_fr: "Variantes complexes",
    note_en: "Complex variants",
  },
  {
    name: "REISS",
    country: "UK",
    status: "beta",
    wordmark: "italiana-caps",
    note_fr: "Marques propres",
    note_en: "Own labels",
  },
  {
    name: "ME+EM",
    country: "UK",
    status: "beta",
    wordmark: "bricolage-wide",
    note_fr: "Site propre + filtres",
    note_en: "Clean site + filters",
  },
  {
    name: "WHISTLES",
    country: "UK",
    status: "soon",
    wordmark: "italiana-caps",
    note_fr: "Sur la roadmap",
    note_en: "On the roadmap",
  },
  {
    name: "TOAST",
    country: "UK",
    status: "soon",
    wordmark: "dm-thin-caps",
    note_fr: "Edition limitée",
    note_en: "Limited editions",
  },
  {
    name: "Boden",
    country: "UK",
    status: "soon",
    wordmark: "bricolage-tight",
    note_fr: "Surveillance famille",
    note_en: "Family wardrobes",
  },

  // ── NORTH AMERICA ──────────────────────────────────────────────
  {
    name: "ARITZIA",
    country: "CA/US",
    status: "live",
    wordmark: "italiana-caps",
    note_fr: "Alerte native cassée",
    note_en: "Native alert broken",
  },
  {
    name: "REFORMATION",
    country: "US",
    status: "live",
    wordmark: "dm-thin-caps",
    note_fr: "Tailles volatiles",
    note_en: "Sizes fly",
  },
  {
    name: "Everlane",
    country: "US",
    status: "beta",
    wordmark: "dm-thin-caps",
    note_fr: "EU shipping requis",
    note_en: "EU shipping required",
  },
  {
    name: "Theory",
    country: "US",
    status: "soon",
    wordmark: "dm-thin-caps",
    note_fr: "Sur la roadmap",
    note_en: "On the roadmap",
  },
  {
    name: "VINCE",
    country: "US",
    status: "soon",
    wordmark: "italiana-caps",
    note_fr: "Sur la roadmap",
    note_en: "On the roadmap",
  },
  {
    name: "FRAME",
    country: "US",
    status: "soon",
    wordmark: "dm-bold",
    note_fr: "Sur demande",
    note_en: "On request",
  },

  // ── SCANDI / EU PREMIUM ─────────────────────────────────────────
  {
    name: "Acne Studios",
    country: "SE",
    status: "beta",
    wordmark: "italiana-thin",
    note_fr: "Drops surveillés",
    note_en: "Drops watched",
  },
  {
    name: "GANNI",
    country: "DK",
    status: "live",
    wordmark: "anton-caps",
    note_fr: "Prints rapidos épuisés",
    note_en: "Prints sell out fast",
  },
  {
    name: "TOTEME",
    country: "SE",
    status: "live",
    wordmark: "dm-thin-caps",
    note_fr: "Manteaux convoités",
    note_en: "Coat hunters welcome",
  },
  {
    name: "Filippa K",
    country: "SE",
    status: "soon",
    wordmark: "dm-thin-caps",
    note_fr: "Sur la roadmap",
    note_en: "On the roadmap",
  },
  {
    name: "Samsøe Samsøe",
    country: "DK",
    status: "soon",
    wordmark: "dm-thin-caps",
    note_fr: "Sur la roadmap",
    note_en: "On the roadmap",
  },
  {
    name: "Stine Goya",
    country: "DK",
    status: "soon",
    wordmark: "serif-italic",
    note_fr: "Sur la roadmap",
    note_en: "On the roadmap",
  },

  // ── WORKWEAR / OUTDOOR ──────────────────────────────────────────
  {
    name: "Carhartt WIP",
    country: "EU",
    status: "beta",
    wordmark: "anton-caps",
    note_fr: "Doublure noire / brown",
    note_en: "Black + brown lined",
  },
  {
    name: "Patagonia",
    country: "EU",
    status: "soon",
    wordmark: "anton-caps",
    note_fr: "Re-issues & Worn Wear",
    note_en: "Re-issues & Worn Wear",
  },
  {
    name: "Arc'teryx",
    country: "EU",
    status: "soon",
    wordmark: "geist-bold",
    note_fr: "Shells convoitées",
    note_en: "Most-wanted shells",
  },

  // ── NICHE / NEW WAVE ────────────────────────────────────────────
  {
    name: "The Frankie Shop",
    country: "EU",
    status: "beta",
    wordmark: "bricolage-wide",
    note_fr: "Boxy blazers + tailoring",
    note_en: "Boxy blazers + tailoring",
  },
  {
    name: "Lisa Yang",
    country: "SE",
    status: "soon",
    wordmark: "italiana-thin",
    note_fr: "Cashmere convoité",
    note_en: "Cashmere hunt",
  },
  {
    name: "KHAITE",
    country: "US",
    status: "soon",
    wordmark: "italiana-caps",
    note_fr: "Drops très limités",
    note_en: "Very limited drops",
  },
];

export const RETAILER_COUNTS = {
  total: RETAILERS.length,
  live: RETAILERS.filter((r) => r.status === "live").length,
  beta: RETAILERS.filter((r) => r.status === "beta").length,
  soon: RETAILERS.filter((r) => r.status === "soon").length,
};
