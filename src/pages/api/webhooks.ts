import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { updateOrderStatus, fulfillOrder } from '../../features/payment/paymentService';

// Stripe requires the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil'
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let event: Stripe.Event;
  const signature = req.headers['stripe-signature'] as string;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    res.status(400).json({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` });
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const result = await updateOrderStatus(
          paymentIntent.id,
          'completed',
          {
            ...paymentIntent.metadata,
            amountReceived: paymentIntent.amount_received?.toString(),
            currency: paymentIntent.currency,
            paymentMethod: paymentIntent.payment_method_types?.[0]
          }
        );
        
        // Trigger order fulfillment
        await fulfillOrder(paymentIntent.id, {
          ...paymentIntent.metadata,
          amount: paymentIntent.amount.toString(),
          currency: paymentIntent.currency
        });
        
        console.log('✅ Payment succeeded and order fulfillment initiated:', paymentIntent.id);
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
        console.error('❌ Payment failed:', failedPayment.id, 'Details:', failureDetails);
        break;
      
      case 'payment_intent.processing':
        const processingPayment = event.data.object as Stripe.PaymentIntent;
        await updateOrderStatus(processingPayment.id, 'processing', processingPayment.metadata);
        console.log('⚡ Payment processing:', processingPayment.id);
        break;
      
      default:
        console.log('⚡ Unhandled event type:', event.type);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ Webhook handler error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}