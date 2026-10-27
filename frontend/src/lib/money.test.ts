import { describe, expect, it } from "vitest";
import { centsFromDigits, formatCurrency, formatSignedAmount } from "./money";

describe("money", () => {
  it("formats cents as pt-BR currency with a regular space", () => {
    expect(formatCurrency(1284732)).toBe("R$ 12.847,32");
    expect(formatCurrency(0)).toBe("R$ 0,00");
    expect(formatCurrency(-1000)).toBe("-R$ 10,00");
  });
  it("formats signed amounts", () => {
    expect(formatSignedAmount("INCOME", 34025)).toBe("+ R$ 340,25");
    expect(formatSignedAmount("EXPENSE", 8950)).toBe("- R$ 89,50");
  });
  it("extracts cents from digits only", () => {
    expect(centsFromDigits("1.234,56")).toBe(123456);
    expect(centsFromDigits("")).toBe(0);
    expect(centsFromDigits("abc")).toBe(0);
  });
});
