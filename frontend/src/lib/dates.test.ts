import { describe, expect, it } from "vitest";
import {
  currentMonthKey,
  formatShortDate,
  fromIsoDate,
  monthKey,
  monthLabel,
  toIsoDate,
} from "./dates";

describe("dates", () => {
  it("formats short dates", () => {
    expect(formatShortDate("2025-11-30")).toBe("30/11/25");
  });
  it("uses local Y/M/D in toIsoDate", () => {
    expect(toIsoDate(new Date(2025, 10, 30, 23, 59))).toBe("2025-11-30");
    expect(toIsoDate(new Date(2025, 10, 30, 0, 0))).toBe("2025-11-30");
  });
  it("round-trips ISO dates", () => {
    expect(toIsoDate(fromIsoDate("2025-11-30"))).toBe("2025-11-30");
    expect(fromIsoDate("2025-11-30").getHours()).toBe(0);
  });
  it("builds month keys and labels", () => {
    expect(monthKey("2025-11-30")).toBe("2025-11");
    expect(monthLabel("2025-11")).toBe("Novembro / 2025");
    expect(currentMonthKey(new Date(2026, 9, 26))).toBe("2026-10");
  });
});
