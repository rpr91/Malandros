import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from '../../types';
import { csrfMiddleware } from '../../middleware/csrfMiddleware';

// @ts-ignore - process.env is defined by Node.js
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
// @ts-ignore - process.env is defined by Node.js
const REFRESH_SECRET: string = process.env.REFRESH_SECRET || 'your-refresh-secret';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  sameSite: 'strict' as const,
};
const ACCESS_TOKEN_COOKIE = 'auth-token';
const REFRESH_TOKEN_COOKIE = 'refresh-token';
const ACCESS_TOKEN_EXPIRY = 60 * 15; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 1 week

interface User {
  id: string;
  email: string;
  name: string;
}

interface RefreshToken {
  token: string;
  userId: string;
  expiresAt: Date;
  replacedByToken: string | null;
}

// Mock database - replace with real database in production
const users: User[] = [];
const refreshTokens: RefreshToken[] = [];

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest extends LoginRequest {
  name: string;
}

export const login = csrfMiddleware(async (req, res) => {
  try {
    const { email, password }: LoginRequest = JSON.parse(req.body);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user - replace with real database query
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token
    refreshTokens.push({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000),
      replacedByToken: null
    });

    // Set HttpOnly cookies
    const accessCookie = serialize(ACCESS_TOKEN_COOKIE, accessToken, {
      maxAge: ACCESS_TOKEN_EXPIRY,
      expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRY * 1000),
      ...COOKIE_OPTIONS
    });

    const refreshCookie = serialize(REFRESH_TOKEN_COOKIE, refreshToken, {
      maxAge: REFRESH_TOKEN_EXPIRY,
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000),
      ...COOKIE_OPTIONS
    });

    res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      accessTokenExpiry: ACCESS_TOKEN_EXPIRY
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export const register = csrfMiddleware(async (req, res) => {
  try {
    const { email, password, name }: RegisterRequest = JSON.parse(req.body);

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name
    };

    users.push(newUser);

    // Create tokens
    const accessToken = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: newUser.id },
      REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token
    refreshTokens.push({
      token: refreshToken,
      userId: newUser.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000),
      replacedByToken: null
    });

    // Set HttpOnly cookies
    const accessCookie = serialize(ACCESS_TOKEN_COOKIE, accessToken, {
      maxAge: ACCESS_TOKEN_EXPIRY,
      expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRY * 1000),
      ...COOKIE_OPTIONS
    });

    const refreshCookie = serialize(REFRESH_TOKEN_COOKIE, refreshToken, {
      maxAge: REFRESH_TOKEN_EXPIRY,
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000),
      ...COOKIE_OPTIONS
    });

    res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return res.status(201).json({
      success: true,
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      accessToken,
      accessTokenExpiry: ACCESS_TOKEN_EXPIRY
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export const logout = csrfMiddleware(async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    
    // If refresh token exists, invalidate it
    if (refreshToken) {
      const tokenIndex = refreshTokens.findIndex(t => t.token === refreshToken);
      if (tokenIndex !== -1) {
        refreshTokens.splice(tokenIndex, 1);
      }
    }

    // Clear both cookies
    const accessCookie = serialize(ACCESS_TOKEN_COOKIE, '', {
      maxAge: -1,
      path: '/',
    });
    const refreshCookie = serialize(REFRESH_TOKEN_COOKIE, '', {
      maxAge: -1,
      path: '/',
    });

    res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export const refresh = csrfMiddleware(async (req, res) => {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if token exists in database
    const storedToken = refreshTokens.find(t => t.token === refreshToken);
    if (!storedToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    // Check if token was replaced (rotation)
    if (storedToken.replacedByToken) {
      return res.status(401).json({ error: 'Refresh token was already used' });
    }

    // Check if token expired
    if (new Date() > storedToken.expiresAt) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Find user
    const user = users.find(u => u.id === (payload as any).userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Mark old token as replaced
    storedToken.replacedByToken = newRefreshToken;

    // Store new refresh token
    refreshTokens.push({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000),
      replacedByToken: null
    });

    // Set HttpOnly cookies
    const accessCookie = serialize(ACCESS_TOKEN_COOKIE, newAccessToken, {
      maxAge: ACCESS_TOKEN_EXPIRY,
      expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRY * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
    });

    const refreshCookie = serialize(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      maxAge: REFRESH_TOKEN_EXPIRY,
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
    });

    res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      accessTokenExpiry: ACCESS_TOKEN_EXPIRY
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});