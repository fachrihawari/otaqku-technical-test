import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { usersTable } from '../db/schema';
import { conflict, unauthorized } from '../helpers/error';
import { hashPassword, verifyPassword } from '../helpers/hash';
import { signToken } from '../helpers/jwt';

export class AuthService {
  static async register(email: string, password: string) {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length > 0) {
      throw conflict('Email already exists');
    }

    // Create new user
    const [user] = await db
      .insert(usersTable)
      .values({
        email,
        password: await hashPassword(password),
      })
      .returning({ id: usersTable.id, email: usersTable.email });

    return user;
  }

  static async login(email: string, password: string) {
    // Find user
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) {
      throw unauthorized('Invalid email or password');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw unauthorized('Invalid email or password');
    }

    // Generate token
    const accessToken = await signToken({ id: user.id });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email
      }
    };
  }
}
