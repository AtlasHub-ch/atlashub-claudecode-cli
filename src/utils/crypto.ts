/**
 * Cryptographic utilities
 * @module utils/crypto
 */

import crypto from "node:crypto";

/**
 * Generate SHA-256 hash
 */
export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Generate SHA-512 hash
 */
export function sha512(data: string): string {
  return crypto.createHash("sha512").update(data).digest("hex");
}

/**
 * Generate random bytes as hex string
 */
export function randomHex(length: number): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generate random UUID v4
 */
export function uuid(): string {
  return crypto.randomUUID();
}

/**
 * HMAC-SHA256
 */
export function hmacSha256(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Base64 encode
 */
export function base64Encode(data: string): string {
  return Buffer.from(data).toString("base64");
}

/**
 * Base64 decode
 */
export function base64Decode(data: string): string {
  return Buffer.from(data, "base64").toString("utf-8");
}

/**
 * URL-safe Base64 encode
 */
export function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * URL-safe Base64 decode
 */
export function base64UrlDecode(data: string): string {
  const padded = data + "=".repeat((4 - (data.length % 4)) % 4);
  return Buffer.from(
    padded.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf-8");
}
