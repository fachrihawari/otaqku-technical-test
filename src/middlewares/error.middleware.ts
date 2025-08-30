import type { NextFunction, Request, Response } from 'express';
import { errors } from 'jose';
import z, { ZodError } from 'zod';
import { ErrorCode, HttpError } from '../helpers/error';

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  req.log.error(err);

  // Handle validation errors
  if (err instanceof ZodError) {
    const flattened = z.flattenError(err);
    return res.status(ErrorCode.UnprocessableEntity).json({
      message: flattened.formErrors[0] || 'Validation error',
      details: flattened.fieldErrors,
    });
  }

  // Handle JWT errors
  if (
    err instanceof errors.JWSInvalid ||
    err instanceof errors.JWSSignatureVerificationFailed
  ) {
    return res
      .status(ErrorCode.Unauthorized)
      .json({ message: 'Invalid token' });
  }

  // Handle HTTP errors
  if (err instanceof HttpError) {
    return res.status(err.errorCode).json({ message: err.message });
  }

  // Fallback error
  return res
    .status(ErrorCode.InternalServerError)
    .json({ message: 'Internal Server Error' });
}
