import express, { RequestHandler } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cartController';

const router = express.Router();

// Get user's cart
router.get('/', getCart as RequestHandler);

// Add item to cart
router.post('/', addItemToCart as RequestHandler);

// Update item in cart
router.put('/:itemId', updateCartItem as RequestHandler);

// Remove item from cart
router.delete('/:itemId', removeCartItem as RequestHandler);

// Clear cart
router.delete('/clear', clearCart as RequestHandler);

export default router;