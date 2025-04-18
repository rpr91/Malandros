import { Request, Response } from 'express';

// In-memory cart storage for MVP
interface CartItem {
  itemId: number;
  quantity: number;
}

interface Cart {
  [userId: string]: CartItem[];
}

const carts: Cart = {};

export const getCart = (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest'; // Simulate user ID
    const userCart = carts[userId] || [];
    res.json({
      success: true,
      data: userCart,
      message: 'Cart retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addItemToCart = (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest'; // Simulate user ID
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body: itemId and quantity (greater than 0) are required'
      });
    }

    if (!carts[userId]) {
      carts[userId] = [];
    }

    const existingItemIndex = carts[userId].findIndex(item => item.itemId === itemId);

    if (existingItemIndex > -1) {
      carts[userId][existingItemIndex].quantity += quantity;
    } else {
      carts[userId].push({ itemId, quantity });
    }

    res.status(200).json({
      success: true,
      data: carts[userId],
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateCartItem = (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest'; // Simulate user ID
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body: quantity (greater than 0) is required'
      });
    }

    if (!carts[userId]) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found for user'
      });
    }

    const itemIndex = carts[userId].findIndex(item => item.itemId === parseInt(itemId, 10));

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Item not found in cart with id: ${itemId}`
      });
    }

    carts[userId][itemIndex].quantity = quantity;

    res.status(200).json({
      success: true,
      data: carts[userId],
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const removeCartItem = (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest'; // Simulate user ID
    const { itemId } = req.params;

    if (!carts[userId]) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found for user'
      });
    }

    const initialLength = carts[userId].length;
    carts[userId] = carts[userId].filter(item => item.itemId !== parseInt(itemId, 10));

    if (carts[userId].length === initialLength) {
      return res.status(404).json({
        success: false,
        message: `Item not found in cart with id: ${itemId}`
      });
    }

    res.status(200).json({
      success: true,
      data: carts[userId],
      message: 'Cart item removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const clearCart = (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest'; // Simulate user ID
    carts[userId] = [];
    res.status(200).json({
      success: true,
      data: [],
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};