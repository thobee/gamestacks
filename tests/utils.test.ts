// tests/utils.test.ts
// Unit tests for utility functions

import { formatNaira, convertToKobo, convertFromKobo } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("formatNaira", () => {
    it("should format currency correctly", () => {
      expect(formatNaira(2500)).toBe("₦2,500");
      expect(formatNaira(1000)).toBe("₦1,000");
      expect(formatNaira(1000000)).toBe("₦1,000,000");
    });

    it("should handle zero", () => {
      expect(formatNaira(0)).toBe("₦0");
    });

    it("should handle large numbers", () => {
      const result = formatNaira(999999999);
      expect(result).toContain("₦");
      expect(result).toContain(",");
    });
  });

  describe("convertToKobo", () => {
    it("should convert Naira to Kobo", () => {
      expect(convertToKobo(2500)).toBe(250000);
      expect(convertToKobo(1)).toBe(100);
      expect(convertToKobo(100)).toBe(10000);
    });

    it("should handle zero", () => {
      expect(convertToKobo(0)).toBe(0);
    });
  });

  describe("convertFromKobo", () => {
    it("should convert Kobo to Naira", () => {
      expect(convertFromKobo(250000)).toBe(2500);
      expect(convertFromKobo(100)).toBe(1);
      expect(convertFromKobo(10000)).toBe(100);
    });

    it("should handle zero", () => {
      expect(convertFromKobo(0)).toBe(0);
    });
  });

  describe("Kobo conversion roundtrip", () => {
    it("should correctly convert Naira to Kobo and back", () => {
      const original = 2500;
      const kobo = convertToKobo(original);
      const back = convertFromKobo(kobo);
      expect(back).toBe(original);
    });
  });
});
