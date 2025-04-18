import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import useAuthStore from '../store/useAuthStore';

// Mock child component
const MockProtectedPage = () => <div>Protected Content</div>;
const MockLoginPage = () => <div>Login Page</div>;

// Mock the auth store
jest.mock('../store/useAuthStore');
const mockedUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockedUseAuthStore.mockImplementation((selector) => {
      return selector({
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn()
      });
    });
  });

  it('redirects unauthenticated users to login', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <ProtectedRoute>
              <MockProtectedPage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<MockLoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows authenticated users to access protected content', () => {
    mockedUseAuthStore.mockImplementation((selector) => {
      return selector({
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn()
      });
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <ProtectedRoute>
              <MockProtectedPage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<MockLoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeDefined();
  });
});