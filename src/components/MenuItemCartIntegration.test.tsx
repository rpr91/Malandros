import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuItemCard from '../features/menu/components/MenuItemCard'; // Adjust path
import { useCartStore, appStore } from '../store/useCartStore'; // Import store and instance for direct state access in tests

describe('MenuItem Cart Integration', () => {
  beforeEach(() => {
    appStore.getState().clearCart(); // Clear cart state before each test to ensure isolation
  });

  const mockItem = {
    id: 'item1',
    name: 'Taco de Asada',
    description: 'Delicious grilled beef taco',
    price: 3.50,
    image: 'url-to-asada-taco.jpg',
  };

  it('adding MenuItem updates cart state via useCart hook', () => {
    render(<MenuItemCard {...mockItem} onAddToCart={() => appStore.getState().addToCart(mockItem)} />); // Pass addToCart from store
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    const cartState = appStore.getState(); // Get cart state directly from store
    expect(cartState.items).toEqual([{ ...mockItem, quantity: 1 }]); // Expect item to be in cart
    const calculatedTotal1 = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(calculatedTotal1).toBe(mockItem.price);
  });

  it('adding multiple MenuItems updates cart total correctly', () => {
    render(
      <>
        <MenuItemCard {...mockItem} onAddToCart={() => appStore.getState().addToCart(mockItem)} />
        <MenuItemCard {...{ ...mockItem, id: 'item2', name: 'Taco de Pollo', price: 3.00 }} onAddToCart={() => appStore.getState().addToCart({ ...mockItem, id: 'item2', name: 'Taco de Pollo', price: 3.00 })} />
      </>
    );

    const addToCartButton1 = screen.getAllByRole('button', { name: /add to cart/i })[0]; // Get first "Add to Cart" button
    const addToCartButton2 = screen.getAllByRole('button', { name: /add to cart/i })[1]; // Get second "Add to Cart" button

    fireEvent.click(addToCartButton1);
    fireEvent.click(addToCartButton2);

    const cartState = appStore.getState();
    expect(cartState.items).toHaveLength(2);
    const calculatedTotal2 = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(calculatedTotal2).toBe(mockItem.price + 3.00); // Check total is correct
  });
});