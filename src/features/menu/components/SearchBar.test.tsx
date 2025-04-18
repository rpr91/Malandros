import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('calls onSearch after debounce time', () => {
    render(
      <SearchBar
        placeholder="Search..."
        onSearch={mockOnSearch}
        debounceTime={500}
      />
    );

    userEvent.type(screen.getByPlaceholderText('Search...'), 'pizza');
    expect(mockOnSearch).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(mockOnSearch).toHaveBeenCalledWith('pizza');
  });

  it('uses default debounce time when not specified', () => {
    render(
      <SearchBar
        placeholder="Search..."
        onSearch={mockOnSearch}
      />
    );

    userEvent.type(screen.getByPlaceholderText('Search...'), 'burger');
    jest.advanceTimersByTime(300);
    expect(mockOnSearch).toHaveBeenCalledWith('burger');
  });
});