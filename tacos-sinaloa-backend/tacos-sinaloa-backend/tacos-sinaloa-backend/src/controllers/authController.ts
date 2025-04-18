import { Request, Response } from 'express';

// In-memory user storage for simulated authentication (MVP)
const users: { [key: string]: any } = {};

export const register = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required for registration'
      });
    }

    if (users[username]) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // In a real application, you would hash the password and save the user to a database
    users[username] = { username, password }; // Storing password in plaintext for MVP simulation ONLY

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      // In a real app, you would return a token or session identifier
      data: { userId: username } // Simulate user ID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const login = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required for login'
      });
    }

    const user = users[username];

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // In a real application, you would generate and return a token or session identifier
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { userId: username } // Simulate user ID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};