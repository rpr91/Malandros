import { useStore } from './useStore';

export const useCartStore = () => {
  return useStore((state) => ({
    items: state.items,
    addToCart: state.addToCart,
    increaseQuantity: state.increaseQuantity,
    decreaseQuantity: state.decreaseQuantity,
    removeItemFromCart: state.removeItemFromCart
  }));
};