import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Auth slice
interface AuthState {
  user: null | {
    id: string;
    email: string;
    name: string;
  };
  isAuthenticated: boolean;
  login: (user: { id: string; email: string; name: string }, accessToken: string) => void;
  logout: () => void;
  refreshToken: (accessToken: string) => void;
  accessToken: string | null;
}

// Cart slice
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  removeItemFromCart: (itemId: string) => void;
  clearCart: () => void;
}

export const appStore = create<AuthState & CartState>()(
  persist(
    (set) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      login: (user, accessToken) => set({
        user,
        isAuthenticated: true,
        accessToken
      }),
      logout: () => {
        set({ user: null, isAuthenticated: false, accessToken: null });
      },
      refreshToken: (accessToken) => set({ accessToken }),
      accessToken: sessionStorage.getItem('access_token') || null,

      // Cart state
      items: [],
      addToCart: (item) => 
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              )
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      increaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        })),
      decreaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item
          )
        })),
      removeItemFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ items: state.items }), // Only persist cart
      storage: createJSONStorage(() => localStorage),
    }
  )
);