import { NextApiRequest, NextApiResponse } from 'next';
import handler from './create-payment-intent';
import * as paymentService from '../../features/payment/paymentService';

jest.mock('../../features/payment/paymentService');

const mockRequest = (body: any) => ({
  method: 'POST',
  body,
  headers: {},
}) as NextApiRequest;

const mockResponse = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res as NextApiResponse;
};

describe('create-payment-intent API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject non-POST methods', async () => {
    const req = { method: 'GET' } as NextApiRequest;
    const res = mockResponse();

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method Not Allowed' });
  });

  it('should validate payment amount', async () => {
    const testCases = [
      { amount: undefined, expectedError: 'Invalid payment amount' },
      { amount: 'not a number', expectedError: 'Invalid payment amount' },
      { amount: 49, expectedError: 'Invalid payment amount' }, // Below minimum
    ];

    for (const { amount, expectedError } of testCases) {
      const req = mockRequest({ amount });
      const res = mockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expectedError });
    }
  });

  it('should create payment intent for valid request', async () => {
    const mockCreate = jest.spyOn(paymentService, 'createPaymentIntent')
      .mockResolvedValue({ client_secret: 'test_secret' } as any);

    const req = mockRequest({ amount: 1000, currency: 'usd' });
    const res = mockResponse();

    await handler(req, res);

    expect(mockCreate).toHaveBeenCalledWith(1000, 'usd', {});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ clientSecret: 'test_secret' });
  });

  it('should handle payment intent creation errors', async () => {
    jest.spyOn(paymentService, 'createPaymentIntent')
      .mockRejectedValue(new Error('Stripe error'));

    const req = mockRequest({ amount: 1000 });
    const res = mockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create payment intent' });
  });
});