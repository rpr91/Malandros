import { NextApiRequest, NextApiResponse } from 'next';
import { getOrderPaymentStatus } from '../../features/payment/paymentService';

interface OrderPaymentStatusRequest extends NextApiRequest {
  query: {
    orderId: string;
  };
}

export default async function handler(
  req: OrderPaymentStatusRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { orderId } = req.query;

  if (!orderId) {
    res.status(400).json({ error: 'Invalid order ID' });
    return;
  }

  try {
    const paymentStatus = await getOrderPaymentStatus(orderId);
    
    // Add additional status details
    const enhancedStatus = {
      ...paymentStatus,
      isPaid: paymentStatus.status === 'succeeded',
      isFailed: paymentStatus.status === 'requires_payment_method' || paymentStatus.status === 'canceled',
      isProcessing: paymentStatus.status === 'processing' || paymentStatus.status === 'requires_action',
      lastUpdated: new Date().toISOString()
    };
    
    res.status(200).json(enhancedStatus);
  } catch (err) {
    console.error('Failed to get payment status:', err);
    res.status(500).json({
      error: 'Failed to get payment status',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}