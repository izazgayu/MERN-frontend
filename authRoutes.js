import express from 'express';
import { login, signupuser, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signupuser);
router.post('/login', login);
router.get('/me', requireAuth, getMe);

export default router;
