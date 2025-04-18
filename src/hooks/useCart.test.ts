import { act, renderHook } from '@testing-library/react-hooks'; // react-hooks-testing-library (install if needed)
import { useCartStore } from '../store/useCartStore'; // Adjust path and import name

describe('useCart Hook', () => {
  beforeEach(() => {
    localStorage.clear(); // Clear localStorage before each test to avoid state persistence issues
  });

  it('initial cart state is empty', () => {
    const { result } = renderHook(() => useCartStore());
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('adds an item to the cart', () => {
    const { result } = renderHook(() => useCartStore());
    const itemToAdd = { itemId: 'item1', quantity: 1, price: 3.50 };

    act(() => { // Use act to wrap state updates in hooks
      result.current.addItem(itemToAdd);
    });

    expect(result.current.items).toEqual([itemToAdd]);
    expect(result.current.total).toBe(3.50);
  });

  it('increments quantity of existing item', () => {
    const { result } = renderHook(() => useCartStore());
    const initialItem = { itemId: 'item1', quantity: 1, price: 3.50 };
    const itemToAddAgain = { itemId: 'item1', quantity: 2, price: 3.50 };

    act(() => {
      result.current.addItem(initialItem);
    });
    act(() => {
      result.current.addItem(itemToAddAgain);
    });

    expect(result.current.items).toEqual([{ itemId: 'item1', quantity: 3, price: 3.50 }]);
    expect(result.current.total).toBe(3.50 * 3);
  });

  it('removes an item from the cart', () => {
    const { result } = renderHook(() => useCartStore());
    const itemToRemove = { itemId: 'item1', quantity: 1, price: 3.50 };
    act(() => {
      result.current.addItem(itemToRemove);
    });

    act(() => {
      result.current.removeItem('item1');
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCartStore());
    const initialItem = { itemId: 'item1', quantity: 1, price: 3.50 };
    act(() => {
      result.current.addItem(initialItem);
    });

    act(() => {
      result.current.updateQuantity('item1', 5);
    });

    expect(result.current.items).toEqual([{ itemId: 'item1', quantity: 5, price: 3.50 }]);
    expect(result.current.total).toBe(3.50 * 5);
  });

  it('clears the cart', () => {
    const { result } = renderHook(() => useCartStore());
    const initialItem = { itemId: 'item1', quantity: 1, price: 3.50 };
    act(() => {
      result.current.addItem(initialItem);
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('cart state persists in localStorage', () => {
    const { result: result1 } = renderHook(() => useCartStore());
    const item1 = { itemId: 'item1', quantity: 1, price: 3.50 };
    act(() => {
      result1.current.addItem(item1);
    });

    const { result: result2 } = renderHook(() => useCartStore()); // Render hook again - simulate page reload

    expect(result2.current.items).toEqual([item1]); // Cart should be restored from localStorage
    expect(result2.current.total).toBe(3.50);
  });
});