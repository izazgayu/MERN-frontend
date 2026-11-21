import InventoryItem from '../models/InventoryItem.js';

export async function getInventory(req, res) {
  try {
    const items = await InventoryItem.find().sort({ name: 1 });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch inventory.' });
  }
}

export async function createInventoryItem(req, res) {
  try {
    const { name, category, quantity, unit, expiry, reorderLevel } = req.body;
    if (!name) return res.status(400).json({ message: 'Medicine name is required.' });
    const item = await InventoryItem.create({
      name: name.trim(),
      category: category || 'Medicine',
      quantity: Number(quantity) || 0,
      unit: unit || 'units',
      expiry: expiry || '',
      reorderLevel: Number(reorderLevel) || 10,
    });
    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Could not add inventory item.' });
  }
}

export async function updateInventoryItem(req, res) {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Inventory item not found.' });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Could not update inventory item.' });
  }
}
