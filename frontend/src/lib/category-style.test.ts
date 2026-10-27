import { Tag } from "lucide-react";
import { describe, expect, it } from "vitest";
import {
  CATEGORY_COLOR_KEYS,
  CATEGORY_ICON_KEYS,
  categoryColorClasses,
  categoryIcon,
} from "./category-style";

describe("category-style", () => {
  it("exposes the key lists", () => {
    expect(CATEGORY_ICON_KEYS).toHaveLength(16);
    expect(CATEGORY_COLOR_KEYS).toEqual(["green", "blue", "purple", "pink", "red", "orange", "yellow"]);
  });
  it("resolves every icon key to a distinct non-fallback icon", () => {
    const icons = CATEGORY_ICON_KEYS.map(categoryIcon);
    icons.forEach((i) => expect(i).not.toBe(Tag));
    expect(new Set(icons).size).toBe(16);
  });
  it("falls back to Tag for unknown icons", () => {
    expect(categoryIcon("nope")).toBe(Tag);
  });
  it("falls back to gray for unknown colors", () => {
    expect(categoryColorClasses("unknown").tag).toBe(categoryColorClasses("gray").tag);
    expect(categoryColorClasses("blue").tile).toContain("bg-blue-light");
    expect(categoryColorClasses("blue").swatch).toContain("bg-blue-base");
  });
});
