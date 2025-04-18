import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './PaymentSuccess.module.css';
import { useCartStore } from '../store/useCartStore';
import { getOrderPaymentStatus } from '../features/payment/paymentService';

interface PaymentStatus {
  status: string;
  amount: number;
  currency: string;
  created: number;
  metadata: Record<string, string>;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, removeItemFromCart } = useCartStore();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        if (!paymentIntentId) {
          throw new Error('Missing payment intent ID');
        }

        const status = await getOrderPaymentStatus(paymentIntentId);
        setPaymentStatus(status);
        
        // Clear cart only if payment is confirmed successful
        if (status.status === 'succeeded') {
          items.forEach(item => {
            removeItemFromCart(item.itemId);
          });
        }
      } catch (err) {
        console.error('Failed to fetch payment status:', err);
        setError('Failed to verify payment status. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [paymentIntentId, items, removeItemFromCart]);

  if (isLoading) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.loadingSpinner} />
        <p>Verifying your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h1 className={styles.errorTitle}>Verification Error</h1>
        <p className={styles.errorMessage}>{error}</p>
        <div className={styles.actions}>
          <button
            className="primary-button"
            onClick={() => navigate('/')}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.successContainer}>
      <div className={styles.successIcon}>✓</div>
      <h1 className={styles.successTitle}>Payment Successful!</h1>
      <p className={styles.successMessage}>
        Thank you for your order. Your payment of {paymentStatus?.amount ? (paymentStatus.amount / 100).toFixed(2) : ''} {paymentStatus?.currency?.toUpperCase()} has been processed successfully.
      </p>
      {paymentStatus?.metadata?.orderNumber && (
        <p className={styles.orderNumber}>
          Order #: {paymentStatus.metadata.orderNumber}
        </p>
      )}
      <div className={styles.actions}>
        <button
          className="primary-button"
          onClick={() => navigate('/')}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;