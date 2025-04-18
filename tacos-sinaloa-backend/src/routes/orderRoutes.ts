import express, { RequestHandler } from 'express';
import {
  createOrder,
  getOrderHistory,
  getOrderById,
  getAllOrders, // This will be used by admin routes
  updateOrderStatus // This will be used by admin routes
} from '../controllers/orderController';

const router = express.Router();

// Create a new order
router.post('/', createOrder as RequestHandler);

// Get user's order history
router.get('/', getOrderHistory as RequestHandler);

// Get a specific order by ID
router.get('/:orderId', getOrderById as RequestHandler);

export default router;