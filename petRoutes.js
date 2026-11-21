import express from 'express';
import { getPets, createPet, updatePet } from '../controllers/petController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', requireRole('Admin', 'Doctor', 'Staff'), getPets);
router.post('/', requireRole('Admin', 'Staff'), createPet);
router.patch('/:id', requireRole('Admin', 'Staff'), updatePet);

export default router;
