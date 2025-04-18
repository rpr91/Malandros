import express, { RequestHandler } from 'express';
import { isAdmin } from '../controllers/adminAuthController';

const router = express.Router();

// Example route to test admin access
router.get('/check', isAdmin as RequestHandler, (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted'
  });
});

export default router;