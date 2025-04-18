import { appStore } from './useStore';

export const useCartStore = () => {
  return appStore((state) => ({
    items: state.items,
    addToCart: state.addToCart,
    increaseQuantity: state.increaseQuantity,
    decreaseQuantity: state.decreaseQuantity,
    removeItemFromCart: state.removeItemFromCart
  }));
};

export { appStore };