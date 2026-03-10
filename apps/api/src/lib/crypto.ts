import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

// ── Key bootstrap ─────────────────────────────────────────────────────────────
// ENCRYPTION_KEY must be a 64-char hex string (32 bytes).
// Failing fast here is intentional: if the key is missing or wrong the API
// must NOT start, because any data already written would become unreadable.

if (!process.env.ENCRYPTION_KEY) {
  throw new Error(
    '[crypto] ENCRYPTION_KEY is not set. ' +
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
}

const keyBuffer = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

if (keyBuffer.length !== 32) {
  throw new Error(
    `[crypto] ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Got ${keyBuffer.length} bytes.`
  );
}

const ENCRYPTION_KEY = keyBuffer;

/**
 * Encrypts text using AES-256-GCM.
 * Returns a Buffer containing: IV (12 bytes) | AuthTag (16 bytes) | CipherText.
 */
export function encrypt(text: string): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypts a Buffer (IV | AuthTag | CipherText) back to a UTF-8 string.
 */
export function decrypt(data: Buffer | Uint8Array): string {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

  if (buffer.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('[crypto] Invalid encrypted data: buffer too short.');
  }

  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encryptedText = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encryptedText), decipher.final()]).toString('utf8');
}
