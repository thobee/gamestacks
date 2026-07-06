// lib/auth-utils.ts
// Authentication utilities — server-side only (uses Node.js crypto)

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt
 * @param password - The plaintext password
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plaintext password against a hash
 * @param password - The plaintext password
 * @param hash - The hashed password
 * @returns True if password matches hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a cryptographically secure random token for email verification or password reset
 * @returns A hex-encoded random token string
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Check if a password meets security requirements
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 * @param password - The password to validate
 * @returns Object with isValid and error message
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }

  return { isValid: true };
}

/**
 * Validate email format
 * @param email - The email to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extract token from Authorization header
 * @param authHeader - The Authorization header value
 * @returns The token or null
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

/**
 * Check if token is expired
 * @param expiresAt - The expiration timestamp
 * @returns True if token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
