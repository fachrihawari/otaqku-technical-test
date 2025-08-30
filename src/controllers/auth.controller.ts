import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import z from 'zod';
import { db } from '../db/db';
import { usersTable } from '../db/schema';
import { conflict, unauthorized } from '../helpers/error';
import { hashPassword, verifyPassword } from '../helpers/hash';
import { signToken } from '../helpers/jwt';

const bodySchema = z.object({
  email: z.email('Invalid email format'),
  password: z
    .string('Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    // Validate request body
    const { email, password } = bodySchema.parse(req.body);

    // Check if user already exists
    const exists = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (exists.length) {
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

    res.status(201).json(user);
  }

  static async login(req: Request, res: Response) {
    // Validate request body
    const { email, password } = bodySchema.parse(req.body);

    // Check if user exists
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (!user) {
      throw unauthorized('Invalid email or password');
    }

    // Check password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw unauthorized('Invalid email or password');
    }

    // Generate JWT token
    const accessToken = await signToken({ id: user.id });

    res.json({ accessToken });
  }
}
