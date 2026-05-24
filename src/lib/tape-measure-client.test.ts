import { formatInches } from "./tape-measure-client";

describe("formatInches", () => {
  it("formats whole inches with no fraction", () => {
    expect(formatInches(48)).toBe('48"');
    expect(formatInches(10)).toBe('10"');
  });

  it("snaps to the nearest 1/16", () => {
    // 48.123 → 0.123 × 16 ≈ 1.97 → rounds to 2/16 = 1/8
    expect(formatInches(48.123)).toBe('48 1/8"');
    // 48.0625 is exactly 1/16
    expect(formatInches(48.0625)).toBe('48 1/16"');
  });

  it("reduces fractions to lowest terms", () => {
    expect(formatInches(48.125)).toBe('48 1/8"');   // 2/16 → 1/8
    expect(formatInches(48.25)).toBe('48 1/4"');    // 4/16 → 1/4
    expect(formatInches(48.5)).toBe('48 1/2"');     // 8/16 → 1/2
    expect(formatInches(48.75)).toBe('48 3/4"');    // 12/16 → 3/4
  });

  it("keeps odd-sixteenths unreduced", () => {
    expect(formatInches(48.1875)).toBe('48 3/16"'); // 3/16 already reduced
    expect(formatInches(48.3125)).toBe('48 5/16"'); // 5/16 already reduced
    expect(formatInches(48.8125)).toBe('48 13/16"'); // 13/16 already reduced
  });

  it("rolls over when the fraction rounds up to a full inch", () => {
    // 48.9999 → 15.998/16 → rounds to 16/16 → +1 inch
    expect(formatInches(48.9999)).toBe('49"');
  });

  it("handles the common measurement range", () => {
    expect(formatInches(24.5)).toBe('24 1/2"');
    expect(formatInches(36.375)).toBe('36 3/8"');
    expect(formatInches(72.0625)).toBe('72 1/16"');
  });
});
