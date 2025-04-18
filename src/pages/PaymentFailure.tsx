import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './PaymentFailure.module.css';
import { getOrderPaymentStatus } from '../features/payment/paymentService';

interface ErrorDetails {
  code: string;
  message: string;
  suggestion?: string;
}

const errorMap: Record<string, ErrorDetails> = {
  'payment_not_completed': {
    code: 'PAYMENT_INCOMPLETE',
    message: 'Payment processing was not completed.',
    suggestion: 'Please try your payment again.'
  },
  'card_declined': {
    code: 'CARD_DECLINED',
    message: 'Your card was declined by the issuer.',
    suggestion: 'Please try a different payment method or contact your bank.'
  },
  'insufficient_funds': {
    code: 'INSUFFICIENT_FUNDS',
    message: 'Your account has insufficient funds.',
    suggestion: 'Please try a different payment method or contact your bank.'
  },
  'invalid_cvc': {
    code: 'INVALID_SECURITY_CODE',
    message: 'The security code entered is invalid.',
    suggestion: 'Please check your card details and try again.'
  },
  'expired_card': {
    code: 'EXPIRED_CARD',
    message: 'Your card has expired.',
    suggestion: 'Please use a different payment method.'
  },
  'processing_error': {
    code: 'PROCESSING_ERROR',
    message: 'An error occurred while processing your payment.',
    suggestion: 'Please try again later or contact support.'
  },
  'default': {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred during payment processing.',
    suggestion: 'Please contact support.'
  }
};

const PaymentFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const paymentIntentId = searchParams.get('payment_intent');
  const errorCodeParam = searchParams.get('error') || 'default';
  const errorDetails = errorMap[errorCodeParam] || errorMap['default'];

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        if (paymentIntentId) {
          const status = await getOrderPaymentStatus(paymentIntentId);
          setPaymentStatus(status);
        }
      } catch (err) {
        console.error('Failed to fetch payment status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [paymentIntentId]);

  const handleRetry = () => {
    navigate('/cart');
  };

  return (
    <div className={styles.errorContainer}>
      {isLoading ? (
        <div className={styles.loadingSpinner} />
      ) : (
        <>
          <div className={styles.errorIcon}>✕</div>
          <h1 className={styles.errorTitle}>{errorDetails.message}</h1>
          
          <div className={styles.errorDetails}>
            <p className={styles.errorCode}>Error code: {errorDetails.code}</p>
            {paymentStatus?.status && (
              <p className={styles.status}>Payment status: {paymentStatus.status}</p>
            )}
          </div>

          <p className={styles.suggestion}>
            {errorDetails.suggestion}
          </p>

          <div className={styles.actions}>
            <button
              className="primary-button"
              onClick={handleRetry}
            >
              Try Again
            </button>
            <button
              className="secondary-button"
              onClick={() => navigate('/')}
            >
              Back to Menu
            </button>
          </div>
          
          <div className={styles.contactInfo}>
            If problems persist, please contact support at support@restaurant.com
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentFailure;