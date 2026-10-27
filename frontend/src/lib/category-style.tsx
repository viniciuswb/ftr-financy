import {
  BaggageClaim, BookOpen, BriefcaseBusiness, CarFront, Dumbbell, Gift, HeartPulse, House,
  Mailbox, PawPrint, PiggyBank, ReceiptText, ShoppingCart, Tag, Ticket, ToolCase, Utensils,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICON_KEYS: readonly string[] = [
  "briefcase-business", "car-front", "heart-pulse", "piggy-bank", "shopping-cart", "ticket",
  "tool-case", "utensils", "paw-print", "house", "gift", "dumbbell", "book-open",
  "baggage-claim", "mailbox", "receipt-text",
];

export const CATEGORY_COLOR_KEYS: readonly string[] = [
  "green", "blue", "purple", "pink", "red", "orange", "yellow",
];

const ICONS: Record<string, LucideIcon> = {
  "briefcase-business": BriefcaseBusiness,
  "car-front": CarFront,
  "heart-pulse": HeartPulse,
  "piggy-bank": PiggyBank,
  "shopping-cart": ShoppingCart,
  ticket: Ticket,
  "tool-case": ToolCase,
  utensils: Utensils,
  "paw-print": PawPrint,
  house: House,
  gift: Gift,
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  "baggage-claim": BaggageClaim,
  mailbox: Mailbox,
  "receipt-text": ReceiptText,
};

export function categoryIcon(key: string): LucideIcon {
  return ICONS[key] ?? Tag;
}

export interface CategoryColorClasses {
  tile: string;
  tag: string;
  swatch: string;
  icon: string;
}

// Full class names are spelled out so Tailwind can detect them statically.
const COLORS: Record<string, CategoryColorClasses> = {
  green: { tile: "bg-green-light text-green-base", tag: "bg-green-light text-green-dark", swatch: "bg-green-base", icon: "text-green-base" },
  blue: { tile: "bg-blue-light text-blue-base", tag: "bg-blue-light text-blue-dark", swatch: "bg-blue-base", icon: "text-blue-base" },
  purple: { tile: "bg-purple-light text-purple-base", tag: "bg-purple-light text-purple-dark", swatch: "bg-purple-base", icon: "text-purple-base" },
  pink: { tile: "bg-pink-light text-pink-base", tag: "bg-pink-light text-pink-dark", swatch: "bg-pink-base", icon: "text-pink-base" },
  red: { tile: "bg-red-light text-red-base", tag: "bg-red-light text-red-dark", swatch: "bg-red-base", icon: "text-red-base" },
  orange: { tile: "bg-orange-light text-orange-base", tag: "bg-orange-light text-orange-dark", swatch: "bg-orange-base", icon: "text-orange-base" },
  yellow: { tile: "bg-yellow-light text-yellow-base", tag: "bg-yellow-light text-yellow-dark", swatch: "bg-yellow-base", icon: "text-yellow-base" },
  gray: { tile: "bg-gray-200 text-gray-600", tag: "bg-gray-200 text-gray-700", swatch: "bg-gray-500", icon: "text-gray-600" },
};

export function categoryColorClasses(key: string): CategoryColorClasses {
  return COLORS[key] ?? COLORS.gray;
}
