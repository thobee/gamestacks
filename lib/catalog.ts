// lib/catalog.ts
// Single source of truth for genres, categories, and item types.
// Used by admin upload, storefront filters, and navbar — so they always match.

/** Full genre list — matches admin upload + storefront filters */
export const CATALOG_GENRES = [
  "Action",
  "Adventure",
  "Fighting",
  "Racing",
  "Sports",
  "Shooter",
  "Simulation",
  "First Person",
  "Third Person",
  "Arcade",
  "Cars",
  "Action RPG",
  "Driving",
  "Soccer",
  "Role Playing",
  "Offline Multiplayer",
  "Horror",
  "Stealth",
  "Open World",
] as const;

export type CatalogGenre = (typeof CATALOG_GENRES)[number];

/** Product categories (platform / product-line) — not genres */
export const CATALOG_CATEGORIES = [
  "PC",
  "Game Keys Online",
  "Consoles",
  "Gamepads",
  "Accessories",
  "PlayStation",
  "Xbox",
  "Nintendo Switch",
  "Other",
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

export const CATALOG_ITEM_TYPES = [
  { value: "game", label: "Game", desc: "Digital or physical game title" },
  { value: "console", label: "Console", desc: "Gaming console / system" },
  { value: "gamepad", label: "Gamepad", desc: "Controller or gamepad" },
  { value: "disc", label: "Disc", desc: "Physical game disc" },
  { value: "game-key", label: "Game Key", desc: "Digital license key" },
  { value: "accessory", label: "Accessory", desc: "Headset, cable, etc." },
] as const;

export type CatalogItemType = (typeof CATALOG_ITEM_TYPES)[number]["value"];

/** Suggested store category when admin picks an item type */
export const DEFAULT_CATEGORY_BY_ITEM_TYPE: Record<
  CatalogItemType,
  CatalogCategory
> = {
  game: "PC",
  console: "Consoles",
  gamepad: "Gamepads",
  disc: "PlayStation",
  "game-key": "Game Keys Online",
  accessory: "Accessories",
};

/** itemTypes where a Download button makes sense */
export const DIGITAL_ITEM_TYPES = ["game", "game-key", "disc"] as const;

/** itemTypes that should only show Home Delivery (no Download button) */
export const PHYSICAL_ONLY_ITEM_TYPES = [
  "console",
  "gamepad",
  "accessory",
] as const;

/** itemTypes that use genres on the product page / filters */
export const GENRE_ITEM_TYPES = ["game", "disc", "game-key"] as const;

/** itemTypes that show PC system requirements fields in admin */
export const SYSTEM_REQ_ITEM_TYPES = ["game", "game-key"] as const;

export function isDigitalItemType(itemType: string): boolean {
  return (DIGITAL_ITEM_TYPES as readonly string[]).includes(itemType);
}

export function isPhysicalOnlyItemType(itemType: string): boolean {
  return (PHYSICAL_ONLY_ITEM_TYPES as readonly string[]).includes(itemType);
}

export function itemTypeUsesGenres(itemType: string): boolean {
  return (GENRE_ITEM_TYPES as readonly string[]).includes(itemType);
}

export function itemTypeUsesSystemReqs(itemType: string): boolean {
  return (SYSTEM_REQ_ITEM_TYPES as readonly string[]).includes(itemType);
}

/**
 * Storefront genre filter pills — every CATALOG_GENRES entry, with icons.
 * Names must stay identical to admin genre toggles.
 */
export const STOREFRONT_GENRE_LIST: { label: CatalogGenre; icon: string }[] = [
  { label: "Action", icon: "⚡" },
  { label: "Adventure", icon: "🧭" },
  { label: "Fighting", icon: "🥊" },
  { label: "Racing", icon: "🏁" },
  { label: "Sports", icon: "🏅" },
  { label: "Shooter", icon: "🔫" },
  { label: "Simulation", icon: "🛠️" },
  { label: "First Person", icon: "👁️" },
  { label: "Third Person", icon: "🧍" },
  { label: "Arcade", icon: "🕹️" },
  { label: "Cars", icon: "🚗" },
  { label: "Action RPG", icon: "🗡️" },
  { label: "Driving", icon: "🏎️" },
  { label: "Soccer", icon: "⚽" },
  { label: "Role Playing", icon: "📜" },
  { label: "Offline Multiplayer", icon: "👥" },
  { label: "Horror", icon: "👻" },
  { label: "Stealth", icon: "🤫" },
  { label: "Open World", icon: "🌐" },
];

/** Navbar dropdown — same genre set as catalog / store filters */
export const NAVBAR_GENRES: { name: CatalogGenre; href: string }[] = [
  { name: "Action", href: "/games?genre=Action" },
  { name: "Adventure", href: "/games?genre=Adventure" },
  { name: "Fighting", href: "/games?genre=Fighting" },
  { name: "Racing", href: "/games?genre=Racing" },
  { name: "Sports", href: "/games?genre=Sports" },
  { name: "Shooter", href: "/games?genre=Shooter" },
  { name: "Simulation", href: "/games?genre=Simulation" },
  { name: "First Person", href: "/games?genre=First+Person" },
  { name: "Third Person", href: "/games?genre=Third+Person" },
  { name: "Arcade", href: "/games?genre=Arcade" },
  { name: "Cars", href: "/games?genre=Cars" },
  { name: "Action RPG", href: "/games?genre=Action+RPG" },
  { name: "Driving", href: "/games?genre=Driving" },
  { name: "Soccer", href: "/games?genre=Soccer" },
  { name: "Role Playing", href: "/games?genre=Role+Playing" },
  { name: "Offline Multiplayer", href: "/games?genre=Offline+Multiplayer" },
  { name: "Horror", href: "/games?genre=Horror" },
  { name: "Stealth", href: "/games?genre=Stealth" },
  { name: "Open World", href: "/games?genre=Open+World" },
];

/**
 * Navbar Store dropdown — product-line shortcuts.
 * These are browsed from the navbar, not duplicated in the store sidebar filters.
 */
export const NAVBAR_STORE_CATEGORIES: {
  name: string;
  href: string;
  description: string;
}[] = [
  {
    name: "PC",
    href: "/games?category=PC",
    description: "PC games",
  },
  {
    name: "PlayStation",
    href: "/games?category=PlayStation",
    description: "PS titles & discs",
  },
  {
    name: "Gamepads",
    href: "/games?category=Gamepads",
    description: "Controllers",
  },
  {
    name: "Accessories",
    href: "/games?category=Accessories",
    description: "Headsets & more",
  },
];

/**
 * Expand shortcut / legacy category values.
 * Includes old "PC Offline" / "PC Online" so existing products still match "PC".
 */
export const CATEGORY_GROUP_ALIASES: Record<string, string[]> = {
  PC: ["PC", "PC Offline", "PC Online"],
};

export function resolveCategoryFilter(
  category: string | null | undefined,
): string | { in: string[] } | undefined {
  if (!category) return undefined;
  const group = CATEGORY_GROUP_ALIASES[category];
  if (group) return { in: group };
  return category;
}
