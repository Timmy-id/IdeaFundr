import { type SignOptions, sign, verify } from 'jsonwebtoken';
import { logger } from './logger';

export function signJwt(payload: Object, key: string, options: SignOptions = {}) {
  const privateKey = Buffer.from(key, 'base64').toString('ascii');

  return sign(payload, privateKey, {
    ...(Boolean(options) && options),
    algorithm: 'RS256'
  });
}

export function verifyJwt<T>(token: string, key: string): T | null {
  try {
    const publicKey = Buffer.from(key, 'base64').toString('ascii');
    const decoded = verify(token, publicKey) as T;

    return decoded;
  } catch (error: any) {
    logger.error(error.message);
    return null;
  }
}
