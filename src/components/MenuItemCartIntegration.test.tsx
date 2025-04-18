import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuItemCard from '../features/menu/components/MenuItemCard'; // Adjust path
import { useCartStore } from '../store/useCartStore'; // Import store for direct state access in tests

describe('MenuItem Cart Integration', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart(); // Clear cart state before each test to ensure isolation
  });

  const mockItem = {
    itemId: 'item1',
    name: 'Taco de Asada',
    description: 'Delicious grilled beef taco',
    price: 3.50,
    imageUrl: 'url-to-asada-taco.jpg',
  };

  it('adding MenuItem updates cart state via useCart hook', () => {
    render(<MenuItemCard {...mockItem} onAddToCart={() => useCartStore.getState().addItem(mockItem)} />); // Pass addItem from store
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    const cartState = useCartStore.getState(); // Get cart state directly from store
    expect(cartState.items).toEqual([{ ...mockItem, quantity: 1 }]); // Expect item to be in cart
    expect(cartState.total).toBe(mockItem.price);
  });

  it('adding multiple MenuItems updates cart total correctly', () => {
    render(
      <>
        <MenuItemCard {...mockItem} onAddToCart={() => useCartStore.getState().addItem(mockItem)} />
        <MenuItemCard {...{ ...mockItem, id: 'item2', name: 'Taco de Pollo', price: 3.00 }} onAddToCart={() => useCartStore.getState().addItem({ ...mockItem, itemId: 'item2', name: 'Taco de Pollo', price: 3.00 })} />
      </>
    );

    const addToCartButton1 = screen.getAllByRole('button', { name: /add to cart/i })[0]; // Get first "Add to Cart" button
    const addToCartButton2 = screen.getAllByRole('button', { name: /add to cart/i })[1]; // Get second "Add to Cart" button

    fireEvent.click(addToCartButton1);
    fireEvent.click(addToCartButton2);

    const cartState = useCartStore.getState();
    expect(cartState.items).toHaveLength(2);
    expect(cartState.total).toBe(mockItem.price + 3.00); // Check total is correct
  });
});