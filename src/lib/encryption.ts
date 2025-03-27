import crypto from 'crypto';

const ENCRYPTION_KEY = (
  process.env.ENCRYPTION_KEY || 'default_key_32bytes_long'
).padEnd(32, '0');
const IV_LENGTH = 16; // AES requires 16-byte IV

export const encryptPassword = (password: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'utf-8'),
    iv
  );

  let encrypted = cipher.update(password, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
};

export const decryptPassword = (encryptedPassword: string): string => {
  try {
    if (!encryptedPassword.includes(':')) {
      throw new Error('Invalid encrypted password format');
    }

    const [ivHex, encrypted] = encryptedPassword.split(':');

    if (!ivHex || !encrypted) {
      throw new Error('Missing IV or encrypted data');
    }

    const iv = Buffer.from(ivHex, 'hex');
    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'utf-8'),
      iv
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  } catch (error) {
    console.error('Decryption Error:', error);
    return 'DECRYPTION_FAILED'; // Return placeholder if decryption fails
  }
};
