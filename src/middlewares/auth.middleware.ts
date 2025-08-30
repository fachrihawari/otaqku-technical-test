import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../helpers/error';
import { AuthService } from '../services/auth.service';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  // Check for authorization header
  const authorization = req.headers.authorization;
  if (!authorization) {
    throw unauthorized('Invalid token');
  }

  // Parse token from authorization header
  const [type, token] = authorization.split(' ');
  if (type !== 'Bearer' || !token) {
    throw unauthorized('Invalid token');
  }

  // Verify token
  const user = await AuthService.verify(token);
  req.user = user;

  next();
}
