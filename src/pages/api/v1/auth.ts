import type { NextApiRequest, NextApiResponse } from 'next';
import { setAccessToken, clearTokens } from '../../../utils/auth';

interface AuthApiRequest extends NextApiRequest {
  url?: string;
  method: 'POST';
  body: {
    email?: string;
    password?: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
}

// Mock user database
const mockUsers: Record<string, User> = {
  'user1@example.com': {
    id: 'user1',
    email: 'user1@example.com',
    name: 'Test User 1'
  },
  'user2@example.com': {
    id: 'user2',
    email: 'user2@example.com',
    name: 'Test User 2'
  }
};

export default async function handler(req: AuthApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const { email, password } = req.body;

    // Handle /auth/logout
    if (req.url?.endsWith('/logout')) {
      clearTokens();
      res.status(200).json({ success: true });
      return;
    }

    // Handle /auth/register
    if (req.url?.endsWith('/register')) {
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      if (mockUsers[email]) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      // In a real implementation, we'd hash the password
      const newUser: User = {
        id: `user${Object.keys(mockUsers).length + 1}`,
        email,
        name: email.split('@')[0]
      };
      mockUsers[email] = newUser;

      // Generate mock token
      const mockToken = `mock-jwt-token-${Date.now()}`;
      setAccessToken(mockToken);

      res.status(201).json({ user: newUser, token: mockToken });
      return;
    }

    // Handle /auth/login
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = mockUsers[email];
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate mock token
    const mockToken = `mock-jwt-token-${Date.now()}`;
    setAccessToken(mockToken);

    res.status(200).json({ user, token: mockToken });
  } catch (err) {
    console.error('Auth API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}