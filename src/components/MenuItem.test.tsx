import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuItem from '../features/menu/components/MenuItemCard'; // Adjust path if needed

describe('MenuItem Component', () => {
  const mockItem = {
    id: 'item1',
    name: 'Taco de Asada',
    description: 'Delicious grilled beef taco',
    price: 3.50,
    image: 'url-to-asada-taco.jpg',
    optimizedImage: {
      src: 'url-to-optimized-asada-taco.jpg',
      srcSet: 'url-to-optimized-asada-taco.jpg 1x',
      sizes: '100vw',
    },
  };

  it('renders menu item details correctly', () => {
    render(<MenuItem {...mockItem} onAddToCart={() => {}} />); // Mock onAddToCart for unit test
    expect(screen.getByText(mockItem.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mockItem.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByAltText(mockItem.name)).toBeInTheDocument(); // Assuming image alt text is item name
    expect(screen.getByText(mockItem.description)).toBeInTheDocument();
  });

  it('calls onAddToCart handler when "Add to Cart" button is clicked', () => {
    const handleAddToCart = jest.fn(); // Mock function for onAddToCart
    render(<MenuItem {...mockItem} onAddToCart={handleAddToCart} />);
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i }); // Find "Add to Cart" button
    fireEvent.click(addToCartButton);
    expect(handleAddToCart).toHaveBeenCalledTimes(1);
    expect(handleAddToCart).toHaveBeenCalledWith(mockItem); // Verify it's called with the correct item
  });

  it('renders item image if imageUrl is provided', () => {
    render(<MenuItem {...mockItem} onAddToCart={() => {}} />);
    const imageElement = screen.getByRole('img', { name: mockItem.name });
    expect(imageElement).toHaveAttribute('src', mockItem.optimizedImage?.src || mockItem.image);
  });

  it('does not render image if imageUrl is not provided', () => {
    const itemWithoutImage = { ...mockItem, imageUrl: undefined };
    render(<MenuItem {...itemWithoutImage} onAddToCart={() => {}} />);
    const imageElement = screen.queryByRole('img', { name: itemWithoutImage.name }); // Use queryByRole to check for absence
    expect(imageElement).not.toBeInTheDocument();
  });
});