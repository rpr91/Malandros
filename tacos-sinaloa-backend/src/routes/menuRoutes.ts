import express, { RequestHandler } from 'express';
import {
  getAllMenuItems,
  getCategories,
  getItemsByCategory
} from '../controllers/menuController';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController';

const router = express.Router();

// Get all menu items
router.get('/', getAllMenuItems as RequestHandler);

// Get all categories
router.get('/categories', getCategories as RequestHandler);

// Get items by category
router.get('/categories/:categoryName', getItemsByCategory as RequestHandler);

// Admin menu management routes
router.post('/admin/items', createMenuItem as RequestHandler);
router.put('/admin/items/:itemId', updateMenuItem as RequestHandler);
router.delete('/admin/items/:itemId', deleteMenuItem as RequestHandler);

export default router;