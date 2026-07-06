// tests/auth-utils.test.ts
// Unit tests for authentication utilities

import {
  hashPassword,
  verifyPassword,
  validatePassword,
  isValidEmail,
  generateToken,
  extractTokenFromHeader,
  isTokenExpired,
} from "@/lib/auth-utils";

describe("Auth Utils", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "TestPassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it("should produce different hashes for the same password", async () => {
      const password = "TestPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should verify a correct password", async () => {
      const password = "TestPassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "TestPassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("WrongPassword123", hash);

      expect(isValid).toBe(false);
    });

    it("should be case-sensitive", async () => {
      const password = "TestPassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("testpassword123", hash);

      expect(isValid).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should accept a valid password", () => {
      const result = validatePassword("ValidPassword123");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject passwords shorter than 8 characters", () => {
      const result = validatePassword("Short1");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("8 characters");
    });

    it("should reject passwords without uppercase letters", () => {
      const result = validatePassword("lowercase123");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("uppercase");
    });

    it("should reject passwords without numbers", () => {
      const result = validatePassword("NoNumbers");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("number");
    });
  });

  describe("isValidEmail", () => {
    it("should accept valid emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("test.user+tag@example.co.uk")).toBe(true);
      expect(isValidEmail("user123@subdomain.example.com")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("invalid@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user @example.com")).toBe(false);
    });
  });

  describe("generateToken", () => {
    it("should generate a token", () => {
      const token = generateToken();
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate unique tokens", () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("extractTokenFromHeader", () => {
    it("should extract token from a valid Bearer header", () => {
      expect(extractTokenFromHeader("Bearer mytoken123")).toBe("mytoken123");
    });

    it("should return null for missing header", () => {
      expect(extractTokenFromHeader(undefined)).toBeNull();
      expect(extractTokenFromHeader("")).toBeNull();
    });

    it("should return null when scheme is not Bearer", () => {
      expect(extractTokenFromHeader("Basic abc123")).toBeNull();
      expect(extractTokenFromHeader("Token abc123")).toBeNull();
    });

    it("should return null for malformed header (no space)", () => {
      expect(extractTokenFromHeader("Bearertoken")).toBeNull();
    });

    it("should return null for header with too many parts", () => {
      expect(extractTokenFromHeader("Bearer token extra")).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    it("should return true for a date in the past", () => {
      const past = new Date(Date.now() - 1000);
      expect(isTokenExpired(past)).toBe(true);
    });

    it("should return false for a date in the future", () => {
      const future = new Date(Date.now() + 60_000);
      expect(isTokenExpired(future)).toBe(false);
    });
  });
});
