import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MenuPage from './MenuPage';
import { mockMenuItems } from './mockMenuData';

describe('MenuPage Responsiveness', () => {
  beforeEach(() => {
    window.innerWidth = 1200; // Desktop size
  });

  it('renders properly on desktop', () => {
    render(<MenuPage />);
    expect(screen.getByText('Our Menu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search menu items...')).toBeInTheDocument();
  });

  it('adapts to mobile view', () => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
    
    render(<MenuPage />);
    // Should adjust layout for mobile
    expect(screen.getByText('Our Menu')).toBeInTheDocument();
  });
});