import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Ensure IV_LENGTH is 12 bytes for GCM
const IV_LENGTH = 12;

// Get key from environment variable or generate a random one for dev (Not safe for production persistence!)
// In production, ENCRYPTION_KEY must be a 32-byte hex string.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  : crypto.randomBytes(32);

/**
 * Encrypts text using AES-256-GCM.
 * Returns a Buffer containing IV + AuthTag + EncryptedText.
 */
export function encrypt(text: string): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Return IV + AuthTag + Encrypted
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypts a Buffer (IV + AuthTag + EncryptedText) back to string.
 */
export function decrypt(data: Buffer | Uint8Array): string {
  // Convert Uint8Array to Buffer if needed
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

  if (buffer.length < IV_LENGTH + 16) { // 16 bytes is default auth tag length
    throw new Error('Invalid encrypted data length');
  }

  // Extract parts
  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encryptedText = buffer.subarray(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}


