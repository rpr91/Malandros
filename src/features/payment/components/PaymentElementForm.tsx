import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import styles from './PaymentElementForm.module.css';

interface PaymentElementFormProps {
  clientSecret: string;
  onSuccess: () => void;
  paymentIntentId: string;
}

const PaymentElementForm: React.FC<PaymentElementFormProps> = ({
  clientSecret,
  onSuccess,
  paymentIntentId
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setErrorCode(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?payment_intent=${paymentIntentId}`,
        },
        redirect: 'if_required'
      });

      if (error) {
        let userMessage = 'Payment failed. Please try again.';
        let errorCode = error.code || 'unknown_error';
        
        if (error.type === 'card_error' || error.type === 'validation_error') {
          userMessage = error.message || userMessage;
        } else if (error.type === 'api_error') {
          userMessage = 'A system error occurred. Please try again later.';
        }

        setErrorMessage(userMessage);
        setErrorCode(errorCode);
        window.location.href = `${window.location.origin}/payment/failure?payment_intent=${paymentIntentId}&error=${encodeURIComponent(errorCode)}`;
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      } else {
        window.location.href = `${window.location.origin}/payment/failure?payment_intent=${paymentIntentId}&error=payment_not_completed`;
      }
    } catch (err) {
      const error = err as Error;
      setErrorMessage('An unexpected error occurred. Please try again.');
      setErrorCode('unexpected_error');
      window.location.href = `${window.location.origin}/payment/failure?payment_intent=${paymentIntentId}&error=unexpected_error`;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <PaymentElement className={styles.stripeElement} />
      
      {errorMessage && (
        <div className={styles.errorMessage} role="alert">
          <div>{errorMessage}</div>
          {errorCode && (
            <div className={styles.errorCode}>
              Error code: {errorCode}
            </div>
          )}
        </div>
      )}

      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="primary-button"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default PaymentElementForm;