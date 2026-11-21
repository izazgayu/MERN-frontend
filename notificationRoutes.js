import express from 'express';
import { getNotifications, createNotification } from '../controllers/notificationController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', requireRole('Admin', 'Doctor'), getNotifications);
router.post('/', requireRole('Admin'), createNotification);

export default router;
