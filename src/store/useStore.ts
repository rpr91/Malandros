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
  itemId: string;
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
}

export const useStore = create<AuthState & CartState>()(
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
          const existingItem = state.items.find((i) => i.itemId === item.itemId);
          if (existingItem) {
            return {
              items: state.items.map((i) => 
                i.itemId === item.itemId 
                  ? { ...i, quantity: i.quantity + 1 } 
                  : i
              )
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      increaseQuantity: (itemId) => 
        set((state) => ({
          items: state.items.map((item) => 
            item.itemId === itemId 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          )
        })),
      decreaseQuantity: (itemId) => 
        set((state) => ({
          items: state.items.map((item) => 
            item.itemId === itemId 
              ? { ...item, quantity: Math.max(1, item.quantity - 1) } 
              : item
          )
        })),
      removeItemFromCart: (itemId) => 
        set((state) => ({
          items: state.items.filter((item) => item.itemId !== itemId)
        }))
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ items: state.items }), // Only persist cart
      storage: createJSONStorage(() => localStorage),
    }
  )
);