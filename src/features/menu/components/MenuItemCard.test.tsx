import React from 'react';
import { render, screen } from '@testing-library/react';
import MenuItemCard from './MenuItemCard';

describe('MenuItemCard', () => {
  const mockItem = {
    id: '1',
    name: 'Test Item',
    description: 'Test Description',
    price: 9.99,
    image: 'test-image.jpg',
    isSpicy: true,
    isVegetarian: false
  };

  it('renders item details correctly', () => {
    render(<MenuItemCard {...mockItem} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('Spicy')).toBeInTheDocument();
    expect(screen.queryByText('Vegetarian')).not.toBeInTheDocument();
  });

  it('displays vegetarian tag when isVegetarian is true', () => {
    render(<MenuItemCard {...mockItem} isVegetarian={true} />);
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
  });
});