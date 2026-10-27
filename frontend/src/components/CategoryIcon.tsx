import { categoryColorClasses, categoryIcon } from "@/lib/category-style";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  icon: string;
  color: string;
  /** Tile side in px (default 40, as in the category cards); the glyph scales with it. */
  size?: number;
}

export function CategoryIcon({ icon, color, size = 40 }: CategoryIconProps) {
  const Icon = categoryIcon(icon);
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-lg", categoryColorClasses(color).tile)}
    >
      <Icon style={{ width: size * 0.4, height: size * 0.4 }} />
    </span>
  );
}
