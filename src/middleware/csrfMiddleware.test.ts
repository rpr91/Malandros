import { csrfMiddleware } from './csrfMiddleware';
import { generateCsrfToken, createCsrfCookie } from '../utils/csrf';
import { NextApiRequest, NextApiResponse } from '../types';

describe('csrfMiddleware', () => {
  const mockHandler = jest.fn();
  const mockReq = {
    method: 'GET',
    headers: {},
    cookies: {},
  } as unknown as NextApiRequest;
  const mockRes = {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as NextApiResponse;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set CSRF cookie for GET requests', async () => {
    await csrfMiddleware(mockHandler)(mockReq, mockRes);
    expect(mockRes.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.any(String));
    expect(mockHandler).toHaveBeenCalled();
  });

  it('should reject POST without CSRF token', async () => {
    const req = { ...mockReq, method: 'POST' };
    await csrfMiddleware(mockHandler)(req, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should reject invalid CSRF token', async () => {
    const req = {
      ...mockReq,
      method: 'POST',
      headers: { 'x-csrf-token': 'invalid' },
      cookies: { 'csrf-token': 'token' }
    };
    await csrfMiddleware(mockHandler)(req, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });

  it('should accept valid CSRF token', async () => {
    const token = generateCsrfToken();
    const req = {
      ...mockReq,
      method: 'POST',
      headers: { 'x-csrf-token': token },
      cookies: { 'csrf-token': token }
    };
    await csrfMiddleware(mockHandler)(req, mockRes);
    expect(mockHandler).toHaveBeenCalled();
    expect(mockRes.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.any(String));
  });
});