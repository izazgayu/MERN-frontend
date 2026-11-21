import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: 'Medicine' },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, trim: true, default: 'units' },
    expiry: { type: String, default: '' }, // YYYY-MM-DD
    reorderLevel: { type: Number, default: 10, min: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);
