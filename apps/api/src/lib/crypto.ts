/**
 * GDPR Crypto helpers
 *
 * ⚠️  These are intentionally stubbed with TODO comments.
 *     Replace the bodies with real AES-256-GCM (or your KMS call) before
 *     going to production.  The function signatures are stable so no other
 *     file needs to change.
 *
 * Prisma represents `Bytes` columns as `Uint8Array`, so we use that type
 * throughout (Node's `Buffer` extends `Uint8Array` and is compatible at
 * runtime, but we declare `Uint8Array` to satisfy the generated Prisma types).
 */

/**
 * Encrypt a plain-text string into a `Buffer` that will be stored in
 * the PostgreSQL `bytea` column (Prisma `Bytes` type).
 *
 * TODO: replace with real AES-256-GCM encryption, e.g.:
 *   const iv  = crypto.randomBytes(12);
 *   const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
 *   const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
 *   …
 */
export function encrypt(plainText: string): Buffer {
  // STUB – stores UTF-8 bytes as-is (NOT secure for production)
  return Buffer.from(plainText, "utf-8");
}

/**
 * Decrypt a `Buffer` (read from Prisma `Bytes`) back into a plain-text
 * string to be returned in API responses.
 *
 * TODO: replace with the inverse of the AES-256-GCM encryption above.
 */
export function decrypt(cipherBytes: Buffer | Uint8Array): string {
  // Convert Uint8Array to Buffer if needed (Prisma might return either depending on runtime)
  const buffer = Buffer.isBuffer(cipherBytes)
    ? cipherBytes
    : Buffer.from(cipherBytes);
  // STUB – assumes plain UTF-8 (NOT secure for production)
  return buffer.toString("utf-8");
}
