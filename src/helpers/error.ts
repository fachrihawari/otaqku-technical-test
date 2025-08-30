export enum ErrorCode {
  UnprocessableEntity = 422,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  InternalServerError = 500,
}

export class HttpError extends Error {
  errorCode: ErrorCode = ErrorCode.InternalServerError;

  constructor(errorCode: ErrorCode, message: string) {
    super(message);
    this.errorCode = errorCode;
  }
}

export function notFound(message: string) {
  return new HttpError(ErrorCode.NotFound, message);
}

export function unauthorized(message: string) {
  return new HttpError(ErrorCode.Unauthorized, message);
}

export function forbidden(message: string) {
  return new HttpError(ErrorCode.Forbidden, message);
}

export function conflict(message: string) {
  return new HttpError(ErrorCode.Conflict, message);
}
