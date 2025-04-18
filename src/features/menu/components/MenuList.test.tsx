import React from 'react';
import { render, screen } from '@testing-library/react';
import MenuList from './MenuList';

describe('MenuList', () => {
  const mockItems = [
    {
      id: '1',
      name: 'Item 1',
      description: 'Description 1',
      price: 9.99,
      image: 'image1.jpg'
    },
    {
      id: '2',
      name: 'Item 2',
      description: 'Description 2',
      price: 12.99,
      image: 'image2.jpg',
      isSpicy: true
    }
  ];

  it('renders all menu items', () => {
    render(<MenuList menuItems={mockItems} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('passes correct props to MenuItemCard', () => {
    render(<MenuList menuItems={mockItems} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
  });
});