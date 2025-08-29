import { compare, hash } from 'bcryptjs';

// Hash a plain password
export function hashPassword(plainPassword: string) {
  return hash(plainPassword, 10);
}

// Verify a plain password against a hashed password
export function verifyPassword(plainPassword: string, hashedPassword: string) {
  return compare(plainPassword, hashedPassword);
}
