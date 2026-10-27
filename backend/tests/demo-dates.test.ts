import { describe, expect, it } from "vitest";
import { calendarDateIn, shiftDemoDates } from "../prisma/demo-dates.js";

describe("shiftDemoDates", () => {
  it("moves the newest date to today and keeps the spacing", () => {
    expect(shiftDemoDates(["2025-12-01", "2025-11-30", "2025-11-18"], new Date("2026-10-26T15:00:00Z"))).toEqual([
      "2026-10-26",
      "2026-10-25",
      "2026-10-13",
    ]);
  });

  it("crosses into the previous month when needed", () => {
    expect(shiftDemoDates(["2025-12-01", "2025-11-18"], new Date("2026-10-05T00:00:00Z"))).toEqual([
      "2026-10-05",
      "2026-09-22",
    ]);
  });

  it("handles input in any order", () => {
    expect(shiftDemoDates(["2025-11-18", "2025-12-01"], new Date("2026-10-26T00:00:00Z"))).toEqual([
      "2026-10-13",
      "2026-10-26",
    ]);
  });
});

describe("calendarDateIn", () => {
  const instant = new Date("2026-10-27T01:00:00Z");

  it("returns the calendar date in the given timezone", () => {
    expect(calendarDateIn(instant, "America/Sao_Paulo")).toBe("2026-10-26");
  });

  it("returns the UTC date for UTC", () => {
    expect(calendarDateIn(instant, "UTC")).toBe("2026-10-27");
  });
});
