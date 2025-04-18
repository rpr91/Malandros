import { generateCsrfToken, validateCsrfToken, createCsrfCookie } from './csrf';

describe('CSRF Utilities', () => {
  beforeAll(() => {
    process.env.CSRF_SECRET = 'test-secret';
  });

  describe('generateCsrfToken', () => {
    it('should generate token with correct format', () => {
      const token = generateCsrfToken();
      expect(token).toMatch(/^[a-f0-9]{64}:[a-f0-9]{64}$/);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('validateCsrfToken', () => {
    it('should validate correct token', () => {
      const token = generateCsrfToken();
      expect(validateCsrfToken(token, token)).toBe(true);
    });

    it('should reject missing tokens', () => {
      expect(validateCsrfToken(undefined, 'token')).toBe(false);
      expect(validateCsrfToken('token', undefined)).toBe(false);
    });

    it('should reject tampered tokens', () => {
      const token = generateCsrfToken();
      const [validToken, validHmac] = token.split(':');
      const tamperedToken = `${validToken}:${validHmac.slice(0, -1)}x`;
      expect(validateCsrfToken(tamperedToken, token)).toBe(false);
    });

    it('should reject mismatched tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(validateCsrfToken(token1, token2)).toBe(false);
    });
  });

  describe('createCsrfCookie', () => {
    it('should create secure cookie in production', () => {
      process.env.NODE_ENV = 'production';
      const cookie = createCsrfCookie('token');
      expect(cookie).toContain('Secure');
      process.env.NODE_ENV = 'test';
    });

    it('should respect custom options', () => {
      const cookie = createCsrfCookie('token', {
        secure: true,
        sameSite: 'strict'
      });
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('SameSite=Strict');
    });
  });
});