import express, { RequestHandler } from 'express';
import { register, login } from '../controllers/authController';

const router = express.Router();

// User registration
router.post('/register', register as RequestHandler);

// User login
router.post('/login', login as RequestHandler);

export default router;