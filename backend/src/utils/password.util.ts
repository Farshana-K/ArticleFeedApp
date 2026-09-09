import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text value with bcrypt. Used for both the user's
 * password and, separately, for the stored refresh token hash — both
 * are opaque secrets that should never be persisted in plain text.
 */
export async function hashPassword(plainValue: string): Promise<string> {
  return bcrypt.hash(plainValue, SALT_ROUNDS);
}

export async function comparePassword(plainValue: string, hashedValue: string): Promise<boolean> {
  return bcrypt.compare(plainValue, hashedValue);
}
