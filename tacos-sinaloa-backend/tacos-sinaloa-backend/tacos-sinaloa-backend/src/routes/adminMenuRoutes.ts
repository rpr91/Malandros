import express, { RequestHandler } from 'express';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/adminMenuController';

const router = express.Router();

// Admin create menu item
router.post('/items', createMenuItem as RequestHandler);

// Admin update menu item
router.put('/items/:itemId', updateMenuItem as RequestHandler);

// Admin delete menu item
router.delete('/items/:itemId', deleteMenuItem as RequestHandler);

export default router;