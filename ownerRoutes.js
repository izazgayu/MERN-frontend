import express from 'express';
import { getOwners, createOwner } from '../controllers/ownerController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', requireRole('Admin', 'Doctor', 'Staff'), getOwners);
router.post('/', requireRole('Admin', 'Staff'), createOwner);

export default router;
