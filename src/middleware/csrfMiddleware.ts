import { generateCsrfToken, validateCsrfToken, createCsrfCookie } from '../utils/csrf';
import type { NextApiRequest, NextApiResponse } from '../types';

export const csrfMiddleware = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip CSRF for GET requests and set token cookie
    if (req.method === 'GET') {
      const token = generateCsrfToken();
      res.setHeader('Set-Cookie', createCsrfCookie(token));
      return handler(req, res);
    }

    // Validate CSRF for state-changing methods
    const csrfToken = req.headers['x-csrf-token'] as string | undefined;
    const cookieToken = req.cookies['csrf-token'];

    if (!validateCsrfToken(csrfToken, cookieToken)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    // Generate new token for subsequent requests
    const newToken = generateCsrfToken();
    res.setHeader('Set-Cookie', createCsrfCookie(newToken));

    return handler(req, res);
  };
};