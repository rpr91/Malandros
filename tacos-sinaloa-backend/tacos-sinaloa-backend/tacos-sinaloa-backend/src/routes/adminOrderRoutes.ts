import express, { RequestHandler } from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/adminOrderController';

const router = express.Router();

// Admin get all orders
router.get('/', getAllOrders as RequestHandler);

// Admin get order by ID
router.get('/:orderId', getOrderById as RequestHandler);

// Admin update order status
router.put('/:orderId/status', updateOrderStatus as RequestHandler);

export default router;