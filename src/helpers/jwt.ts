import { type JWTPayload, jwtVerify, SignJWT } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not defined, please set it in your environment variables',
  );
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const alg = 'HS256';
const expiration = '7d';

export async function signToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
