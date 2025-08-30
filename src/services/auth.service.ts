import { db } from '../db/db';
import { users } from '../db/schema';
import { conflict, unauthorized } from '../helpers/error';
import { hashPassword, verifyPassword } from '../helpers/hash';
import { signToken, verifyToken } from '../helpers/jwt';

export class AuthService {
  static async register(email: string, password: string) {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      throw conflict('Email already exists');
    }

    // Create new user
    const hashedPassword = await hashPassword(password);
    const user = await db
      .insert(users)
      .values({ email, password: hashedPassword })
      .returning({ id: users.id, email: users.email });

    return user;
  }

  static async login(email: string, password: string) {
    // Find user
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!user) {
      throw unauthorized('Invalid email or password');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw unauthorized('Invalid email or password');
    }

    // Generate token
    const accessToken = await signToken({ sub: user.id });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  static async verify(token: string) {
    // Verify jwt token
    const { sub: userId } = await verifyToken(token);
    if (!userId) {
      throw unauthorized('Invalid token');
    }

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });
    if (!user) {
      throw unauthorized('Invalid token');
    }

    return user;
  }
}
