import {
  createPaymentIntent,
  updateOrderStatus,
  getOrderPaymentStatus,
  fulfillOrder,
  handleWebhookEvent
} from './paymentService';
import Stripe from 'stripe';
import axios from 'axios';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn()
    }
  }));
});

jest.mock('axios');

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent with correct parameters', async () => {
      const mockCreate = (Stripe as jest.MockedClass<typeof Stripe>).mock.results[0].value.paymentIntents.create;
      mockCreate.mockResolvedValue({ id: 'pi_test', client_secret: 'secret_test' });

      const result = await createPaymentIntent(1000, 'usd', { orderId: '123' });
      
      expect(mockCreate).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'usd',
        metadata: { orderId: '123' },
        automatic_payment_methods: { enabled: true }
      });
      expect(result).toEqual({ id: 'pi_test', client_secret: 'secret_test' });
    });

    it('should throw error when Stripe API fails', async () => {
      const mockCreate = (Stripe as jest.MockedClass<typeof Stripe>).mock.results[0].value.paymentIntents.create;
      mockCreate.mockRejectedValue(new Error('Stripe error'));

      await expect(createPaymentIntent(1000, 'usd')).rejects.toThrow('Stripe error');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status via API', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: { success: true } });
      
      const result = await updateOrderStatus('pi_test', 'completed', { orderId: '123' });
      
      expect(axios.post).toHaveBeenCalledWith('/api/orders/update-status', {
        paymentIntentId: 'pi_test',
        status: 'completed',
        metadata: { orderId: '123' }
      });
      expect(result.success).toBe(true);
    });

    it('should clear cart for completed orders', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: { success: true } });
      const mockSetItems = jest.fn();
      const mockStore = {
        items: [{ itemId: '1', name: 'Item', price: 10, quantity: 1 }],
        setItems: jest.fn()
      };
      jest.spyOn(require('../../store/useStore'), 'default').mockImplementation(() => mockStore);

      await updateOrderStatus('pi_test', 'completed', {});
      expect(mockSetItems).toHaveBeenCalledWith([]);
    });
  });

  describe('getOrderPaymentStatus', () => {
    it('should retrieve payment status from Stripe and API', async () => {
      (Stripe as jest.MockedClass<typeof Stripe>).mock.results[0].value.paymentIntents.retrieve
        .mockResolvedValue({
          status: 'succeeded',
          amount: 1000,
          currency: 'usd',
          created: 1234567890,
          metadata: { orderId: '123' }
        });
      (axios.get as jest.Mock).mockResolvedValue({ data: { orderDetails: { shipping: '123 Main St' } } });

      const result = await getOrderPaymentStatus('pi_test');
      
      expect(result).toEqual({
        status: 'succeeded',
        amount: 1000,
        currency: 'usd',
        created: 1234567890,
        metadata: {
          orderId: '123',
          shipping: '123 Main St'
        }
      });
    });

    it('should handle Stripe API errors', async () => {
      (Stripe as jest.MockedClass<typeof Stripe>).mock.results[0].value.paymentIntents.retrieve
        .mockRejectedValue(new Error('Stripe API error'));
      
      await expect(getOrderPaymentStatus('pi_test')).rejects.toThrow('Stripe API error');
    });

    it('should handle order API errors', async () => {
      (Stripe as jest.MockedClass<typeof Stripe>).mock.results[0].value.paymentIntents.retrieve
        .mockResolvedValue({
          status: 'succeeded',
          metadata: { orderId: '123' }
        });
      (axios.get as jest.Mock).mockRejectedValue(new Error('Order API error'));
      
      await expect(getOrderPaymentStatus('pi_test')).rejects.toThrow('Order API error');
    });
  });

  describe('webhook event handling', () => {
    it('should handle processing payment status', async () => {
      const mockUpdate = jest.spyOn(require('./paymentService'), 'updateOrderStatus');
      
      const event = {
        type: 'payment_intent.processing',
        data: {
          object: {
            id: 'pi_test',
            metadata: { orderId: '123' }
          }
        }
      } as unknown as Stripe.Event;

      await handleWebhookEvent(event);
      
      expect(mockUpdate).toHaveBeenCalledWith('pi_test', 'processing', { orderId: '123' });
    });

    it('should handle failed payment with error details', async () => {
      const mockUpdate = jest.spyOn(require('./paymentService'), 'updateOrderStatus');
      
      const event = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test',
            metadata: { orderId: '123' },
            last_payment_error: {
              message: 'Card declined',
              code: 'card_declined',
              type: 'card_error'
            }
          }
        }
      } as unknown as Stripe.Event;

      await handleWebhookEvent(event);
      
      expect(mockUpdate).toHaveBeenCalledWith('pi_test', 'failed', {
        orderId: '123',
        lastPaymentError: 'Card declined',
        failureCode: 'card_declined',
        failureType: 'card_error'
      });
    });

    it('should ignore unhandled event types', async () => {
      const mockUpdate = jest.spyOn(require('./paymentService'), 'updateOrderStatus');
      
      const event = {
        type: 'charge.succeeded',
        data: { object: { id: 'ch_test' } }
      } as unknown as Stripe.Event;

      await handleWebhookEvent(event);
      
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('fulfillOrder', () => {
    it('should trigger order fulfillment via API', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: { success: true } });
      
      const result = await fulfillOrder('pi_test', { orderId: '123' });
      
      expect(axios.post).toHaveBeenCalledWith('/api/orders/fulfill', {
        paymentIntentId: 'pi_test',
        orderId: '123'
      });
      expect(result.success).toBe(true);
    });
  });
});