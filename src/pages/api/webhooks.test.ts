import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import * as paymentService from '../../features/payment/paymentService';
import handler from './webhooks';

jest.mock('../../features/payment/paymentService');

const stripe = new Stripe('test_key', {
  apiVersion: '2025-03-31.basil'
});

const mockRequest = (body: any, headers: any = {}) => ({
  method: 'POST',
  body,
  headers: { 'stripe-signature': 'test_sig', ...headers },
}) as NextApiRequest;

const mockResponse = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res as NextApiResponse;
};

describe('webhooks API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'test_secret';
  });

  it('should reject non-POST methods', async () => {
    const req = { method: 'GET' } as NextApiRequest;
    const res = mockResponse();

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method Not Allowed' });
  });

  it('should verify stripe webhook signature', async () => {
    const verifySpy = jest.spyOn(stripe.webhooks, 'constructEvent')
      .mockImplementation((...args: any[]) => ({} as Stripe.Event));

    const req = mockRequest({ test: 'body' });
    const res = mockResponse();

    await handler(req, res);

    expect(verifySpy).toHaveBeenCalledWith(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  });

  it('should reject invalid signatures', async () => {
    jest.spyOn(stripe.webhooks, 'constructEvent')
      .mockImplementation(() => { throw new Error('Invalid sig'); });

    const req = mockRequest({});
    const res = mockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Webhook Error: Invalid sig' });
  });

  describe('event handling', () => {
    const createEvent = (type: string, object: any) => ({
      type,
      data: { object }
    } as Stripe.Event);

    beforeEach(() => {
      jest.spyOn(stripe.webhooks, 'constructEvent')
        .mockImplementation(() => createEvent('payment_intent.succeeded', { id: 'pi_test' }));
    });

    it('should handle payment_intent.succeeded', async () => {
      await handler(mockRequest({}), mockResponse());

      expect(paymentService.updateOrderStatus).toHaveBeenCalledWith(
        'pi_test',
        'completed',
        {}
      );
    });

    it('should handle payment_intent.payment_failed', async () => {
      jest.spyOn(stripe.webhooks, 'constructEvent')
        .mockImplementation(() => createEvent('payment_intent.payment_failed', { id: 'pi_test' }));

      await handler(mockRequest({}), mockResponse());

      expect(paymentService.updateOrderStatus).toHaveBeenCalledWith(
        'pi_test',
        'failed',
        {}
      );
    });

    it('should handle payment_intent.processing', async () => {
      jest.spyOn(stripe.webhooks, 'constructEvent')
        .mockImplementation(() => createEvent('payment_intent.processing', { id: 'pi_test' }));

      await handler(mockRequest({}), mockResponse());

      expect(paymentService.updateOrderStatus).toHaveBeenCalledWith(
        'pi_test',
        'processing',
        {}
      );
    });

    it('should ignore unknown event types', async () => {
      jest.spyOn(stripe.webhooks, 'constructEvent')
        .mockImplementation(() => createEvent('unknown.event', { id: 'pi_test' }));

      const res = mockResponse();
      await handler(mockRequest({}), res);

      expect(paymentService.updateOrderStatus).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle service errors', async () => {
      jest.spyOn(paymentService, 'updateOrderStatus')
        .mockRejectedValue(new Error('DB error'));

      const res = mockResponse();
      await handler(mockRequest({}), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });
});