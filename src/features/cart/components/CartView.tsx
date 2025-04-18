import React, { useState, useEffect, useCallback } from 'react';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import initializeStripe from '../../../utils/stripeUtils';
import { useCartStore } from '../../../store/useCartStore';
import styles from './CartView.module.css';

export const CartView = () => {
  const { items, increaseQuantity, decreaseQuantity, removeItemFromCart } = useCartStore();
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle'|'processing'|'succeeded'|'failed'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const createPaymentIntent = useCallback(async () => {
    try {
      setPaymentStatus('processing');
      setPaymentError(null);
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'usd',
          metadata: {
            cartItems: JSON.stringify(items),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
      setPaymentStatus('idle');
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setPaymentStatus('failed');
      setPaymentError(err instanceof Error ? err.message : 'Payment failed');
    }
  }, [total, items]);

  useEffect(() => {
    const initStripe = async () => {
      const stripe = await initializeStripe();
      setStripePromise(stripe);
    };
    initStripe();
  }, []);


  const PaymentElementForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements || !clientSecret) {
        setError('Payment system not ready');
        return;
      }

      try {
        setProcessing(true);
        setError(null);
        
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin,
          },
        });

        if (error) {
          setError(error.message || 'Payment failed');
          return;
        }

        setPaymentStatus('succeeded');
      } catch (err) {
        console.error('Payment error:', err);
        setError('An unexpected error occurred');
      } finally {
        setProcessing(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className={styles.paymentForm}>
        <PaymentElement
          options={{layout: 'tabs'}}
        />
        {error && <div className={styles.paymentError}>{error}</div>}
        <button
          type="submit"
          disabled={!stripe || processing || !clientSecret}
          className={styles.payButton}
        >
          {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>
      </form>
    );
  };
  return (
    <div className={styles.cartContainer}>
      <h2 className={styles.cartTitle}>Your Cart</h2>
      {items.length === 0 ? (
        <p className={styles.emptyCart}>Your cart is empty</p>
      ) : (
        <>
          <ul className={styles.cartItems}>
            {items.map((item) => (
              <li key={item.itemId} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                </div>
                <div className={styles.itemControls}>
                  <button 
                    className={styles.quantityButton}
                    onClick={() => decreaseQuantity(item.itemId)}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className={styles.itemQuantity}>{item.quantity}</span>
                  <button 
                    className={styles.quantityButton}
                    onClick={() => increaseQuantity(item.itemId)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                  <button 
                    className={styles.removeButton}
                    onClick={() => removeItemFromCart(item.itemId)}
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                </div>
                <div className={styles.itemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.cartTotal}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          {stripePromise && (
            <div className={styles.paymentSection}>
              <h3 className={styles.paymentTitle}>Payment</h3>
              <Elements stripe={stripePromise}>
                {!clientSecret && (
                  <button
                    onClick={createPaymentIntent}
                    className={styles.checkoutButton}
                    disabled={paymentStatus === 'processing'}
                  >
                    {paymentStatus === 'processing' ? 'Loading...' : 'Proceed to Payment'}
                  </button>
                )}
                 
                 {paymentError && <div className={styles.paymentError}>{paymentError}</div>}
                 
                 {paymentStatus === 'processing' && !clientSecret && (
                   <div className={styles.loadingMessage}>Setting up payment...</div>
                 )}
               
                 {clientSecret && (
                   <PaymentElementForm />
                 )}
              </Elements>
            </div>
          )}
        </>
      )}
    </div>
  );
};