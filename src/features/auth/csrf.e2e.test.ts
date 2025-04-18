import { NextApiRequest, NextApiResponse } from 'next';
import { csrfMiddleware } from '../../middleware/csrfMiddleware';
import { generateCsrfToken } from '../../utils/csrf';

describe('CSRF End-to-End Flow', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      headers: {},
      cookies: {}
    };
    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should complete full CSRF flow', async () => {
    // Step 1: GET request sets cookie
    await csrfMiddleware(jest.fn())(mockReq as NextApiRequest, mockRes as NextApiResponse);
    expect(mockRes.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.any(String));
    
    // Step 2: Extract token from cookie
    const cookie = (mockRes.setHeader as jest.Mock).mock.calls[0][1];
    const token = cookie.match(/csrf-token=([^;]+)/)[1];
    
    // Step 3: POST with valid token
    mockReq.method = 'POST';
    mockReq.headers = { 'x-csrf-token': token };
    mockReq.cookies = { 'csrf-token': token };
    
    const mockHandler = jest.fn();
    await csrfMiddleware(mockHandler)(mockReq as NextApiRequest, mockRes as NextApiResponse);
    expect(mockHandler).toHaveBeenCalled();
    
    // Step 4: POST with invalid token
    mockReq.headers = { 'x-csrf-token': 'invalid' };
    await csrfMiddleware(jest.fn())(mockReq as NextApiRequest, mockRes as NextApiResponse);
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });
});