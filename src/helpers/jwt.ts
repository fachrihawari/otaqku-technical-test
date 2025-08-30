import { jwtVerify, SignJWT } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not defined, please set it in your environment variables',
  );
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const alg = 'HS256';

export async function signToken(payload: { id: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken<T>(token: string) {
  const { payload } = await jwtVerify<T>(token, secret);
  return payload;
}
