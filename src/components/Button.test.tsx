import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  test('renders with text content', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByText(/Click Me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders with a specific class name', () => {
    render(<Button className="custom-button">Test</Button>);
    const buttonElement = screen.getByText(/Test/i);
    expect(buttonElement).toHaveClass('custom-button');
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    const buttonElement = screen.getByText(/Clickable/i);
    buttonElement.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});