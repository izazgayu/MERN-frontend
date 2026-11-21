import express from 'express';
import { getUsers, createUser, updateUser, toggleActive } from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public route — booking form needs the doctors list without requiring login
router.get('/doctors-public', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const doctors = await User.find({ role: 'Doctor', active: true }, 'name specialization availability workingHours');
    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch doctors.' });
  }
});

// All routes below require authentication
router.use(requireAuth);

router.get('/', requireRole('Admin', 'Doctor', 'Staff'), getUsers);
router.post('/', requireRole('Admin'), createUser);
router.patch('/:id', requireRole('Admin'), updateUser);
router.patch('/:id/toggle-active', requireRole('Admin'), toggleActive);

export default router;
