import express from 'express';
import {
  getTreatments,
  createTreatment,
  updateTreatmentStatus,
} from '../controllers/treatmentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', requireRole('Admin', 'Doctor', 'Staff'), getTreatments);
router.post('/', requireRole('Doctor', 'Admin'), createTreatment);
router.patch('/:id', requireRole('Doctor', 'Admin'), updateTreatmentStatus);

export default router;
