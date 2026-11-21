import express from 'express';
import { getInvoices, createInvoice, updateInvoice } from '../controllers/billingController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('Admin', 'Staff'));

router.get('/', getInvoices);
router.post('/', createInvoice);
router.patch('/:id', updateInvoice);

export default router;
