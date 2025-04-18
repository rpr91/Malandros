import Stripe from 'stripe';
import { useStore } from '../../store/useStore';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil'
});

export const createPaymentIntent = async (amount: number, currency: string, metadata: Record<string, string> = {}) => {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

export const updateOrderStatus = async (paymentIntentId: string, status: 'completed'|'failed'|'processing', metadata: Record<string, string | undefined>) => {
  try {
    // Update local state
    const store = useStore.getState();

    // In a real app, we would send this to our backend API
    const response = await axios.post('/api/orders/update-status', {
      paymentIntentId,
      status,
      metadata
    });

    // If status is completed, clear the cart
    if (status === 'completed') {
      store.items = [];
    }

    console.log(`Order ${paymentIntentId} status updated to: ${status}`);
    if (status === 'failed') {
      console.error('Payment failure details:', metadata.failureDetails || 'No details provided');
    }

    return { success: true, paymentIntentId, status, order: response.data?.order };
  } catch (err) {
    console.error('Failed to update order status:', err);
    throw err;
  }
};

export const getOrderPaymentStatus = async (orderId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(orderId);
    
    // Get additional order details from our API
    const response = await axios.get(`/api/orders/${orderId}`);
    
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      metadata: {
        ...paymentIntent.metadata,
        ...response.data?.orderDetails
      }
    };
  } catch (err) {
    console.error('Failed to retrieve payment status:', err);
    throw err;
  }
};

export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await updateOrderStatus(
        paymentIntent.id,
        'completed',
        {
          ...paymentIntent.metadata,
          amountReceived: paymentIntent.amount_received?.toString(),
          currency: paymentIntent.currency,
          paymentMethod: paymentIntent.payment_method_types?.[0]
        }
      );
      await fulfillOrder(paymentIntent.id, {
        ...paymentIntent.metadata,
        amount: paymentIntent.amount.toString(),
        currency: paymentIntent.currency
      });
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      const failureDetails = {
        ...failedPayment.metadata,
        lastPaymentError: failedPayment.last_payment_error?.message || '',
        failureCode: failedPayment.last_payment_error?.code || '',
        failureType: failedPayment.last_payment_error?.type || ''
      };
      await updateOrderStatus(failedPayment.id, 'failed', failureDetails);
      break;
    
    case 'payment_intent.processing':
      const processingPayment = event.data.object as Stripe.PaymentIntent;
      await updateOrderStatus(processingPayment.id, 'processing', processingPayment.metadata);
      break;
    
    default:
      // Ignore unhandled event types
      break;
  }
};

export const fulfillOrder = async (paymentIntentId: string, metadata: Record<string, string>) => {
  try {
    // In a real app, this would trigger order fulfillment logic
    const response = await axios.post('/api/orders/fulfill', {
      paymentIntentId,
      ...metadata
    });

    return {
      success: true,
      message: 'Order fulfillment initiated',
      data: response.data
    };
  } catch (err) {
    console.error('Failed to fulfill order:', err);
    throw err;
  }
};