import { create } from 'zustand';
import { getAccessToken, setAccessToken, clearTokens } from '../utils/auth';

interface AuthState {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: Boolean(getAccessToken()), // Initialize based on existing token
  login: (token: string) => {
    setAccessToken(token);
    set({ isAuthenticated: true });
  },
  logout: () => {
    clearTokens();
    set({ isAuthenticated: false });
  },
}));

export default useAuthStore;