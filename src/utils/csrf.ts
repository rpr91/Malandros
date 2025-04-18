import { randomBytes, createHmac } from 'crypto';
import { serialize } from 'cookie';

// @ts-ignore - process.env is defined by Node.js
const CSRF_SECRET: string = process.env.CSRF_SECRET || '';
const CSRF_COOKIE_NAME = 'csrf-token';

if (!CSRF_SECRET) {
  throw new Error('CSRF_SECRET environment variable is required');
}

interface CsrfOptions {
  secure?: boolean;
  sameSite?: true | false | 'lax' | 'strict' | 'none';
}

export const generateCsrfToken = (): string => {
  const token = randomBytes(32).toString('hex');
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(token);
  return `${token}:${hmac.digest('hex')}`;
};

export const validateCsrfToken = (token?: string, cookieToken?: string): boolean => {
  if (!token || !cookieToken) return false;
  
  const [receivedToken, receivedHmac] = token.split(':');
  const [storedToken] = cookieToken.split(':');
  
  if (!receivedToken || !receivedHmac || !storedToken) return false;
  
  // Validate tokens match
  if (receivedToken !== storedToken) return false;
  
  // Validate HMAC
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(receivedToken);
  const expectedHmac = hmac.digest('hex');
  
  return receivedHmac === expectedHmac;
};

export const createCsrfCookie = (token: string, options?: CsrfOptions) => {
  return serialize(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: options?.secure ?? process.env.NODE_ENV === 'production',
    sameSite: options?.sameSite ?? 'lax',
    path: '/',
  });
};