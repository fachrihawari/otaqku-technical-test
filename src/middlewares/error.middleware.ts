import type { NextFunction, Request, Response } from 'express';
import z, { ZodError } from 'zod';
import { ErrorCode, HttpError } from '../helpers/error';
import { DrizzleQueryError } from 'drizzle-orm';

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  req.log.error(err);

  if (err instanceof ZodError) {
    const flattened = z.flattenError(err);
    return res.status(ErrorCode.UnprocessableEntity).json({
      message: flattened.formErrors[0] || 'Validation error',
      details: flattened.fieldErrors,
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.errorCode).json({ message: err.message });
  }

  return res
    .status(ErrorCode.InternalServerError)
    .json({ message: 'Internal Server Error' });
}
