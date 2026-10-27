import { describe, expect, it } from "vitest";
import { initials, normalizeSearch, pluralItems } from "./text";

describe("text", () => {
  it("normalizes search", () => {
    expect(normalizeSearch("  SAÚDE ")).toBe("saude");
    expect(normalizeSearch("Salário")).toBe(normalizeSearch("SALARIO"));
  });
  it("builds initials", () => {
    expect(initials("Conta teste")).toBe("CT");
    expect(initials("Maria")).toBe("M");
    expect(initials("")).toBe("");
  });
  it("pluralizes items", () => {
    expect(pluralItems(0)).toBe("0 itens");
    expect(pluralItems(1)).toBe("1 item");
    expect(pluralItems(12)).toBe("12 itens");
  });
});
