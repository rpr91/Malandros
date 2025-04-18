import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<any> | null = null;

const initializeStripe = async () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

export default initializeStripe;