import type { Request, Response } from 'express';
import z from 'zod';
import { AuthService } from '../services/auth.service';

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

    // Process registration
    const user = await AuthService.register(email, password);
    
    res.status(201).json(user);
  }

  static async login(req: Request, res: Response) {
    // Validate request body
    const { email, password } = bodySchema.parse(req.body);

    // Process login
    const result = await AuthService.login(email, password);
    
    res.json(result);
  }
}
