import React from 'react';
import { Button } from '../../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import styles from './GuestCheckoutButton.module.css';

export const GuestCheckoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleGuestCheckout = () => {
    const guestSessionId = `guest_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('guestSessionId', guestSessionId);
    navigate('/checkout/guest');
  };

  return (
    <Button variant="primary" onClick={handleGuestCheckout}>
      Checkout as Guest
    </Button>
  );
};