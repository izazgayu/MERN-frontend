import express from 'express';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.patch('/:id', requireRole('Admin', 'Staff', 'Doctor'), updateAppointment);
router.delete('/:id', requireRole('Admin'), deleteAppointment);

export default router;
