import express from 'express';
import { getInventory, createInventoryItem, updateInventoryItem } from '../controllers/inventoryController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('Admin', 'Staff'));

router.get('/', getInventory);
router.post('/', createInventoryItem);
router.patch('/:id', updateInventoryItem);

export default router;
