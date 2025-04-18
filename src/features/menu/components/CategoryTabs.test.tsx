import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryTabs from './CategoryTabs';

describe('CategoryTabs', () => {
  const mockCategories = ['all', 'appetizers', 'main', 'desserts'];
  const mockOnCategoryChange = jest.fn();

  it('renders all category tabs', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory="all"
        onCategoryChange={mockOnCategoryChange}
      />
    );
    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.getByText('appetizers')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('desserts')).toBeInTheDocument();
  });

  it('calls onCategoryChange when a tab is clicked', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory="all"
        onCategoryChange={mockOnCategoryChange}
      />
    );
    userEvent.click(screen.getByText('main'));
    expect(mockOnCategoryChange).toHaveBeenCalledWith('main');
  });

  it('applies active style to the current category', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory="main"
        onCategoryChange={mockOnCategoryChange}
      />
    );
    const activeTab = screen.getByText('main').closest('button');
    expect(activeTab).toHaveClass('active');
  });
});