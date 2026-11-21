import Owner from '../models/Owner.js';
import Pet from '../models/Pet.js';

export async function getOwners(req, res) {
  try {
    const owners = await Owner.find().sort({ createdAt: -1 });
    // Attach pet names
    const pets = await Pet.find({}, 'name ownerId');
    const result = owners.map((owner) => {
      const ownerPets = pets.filter((p) => String(p.ownerId) === String(owner._id));
      return { ...owner.toObject(), pets: ownerPets.map((p) => p.name) };
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch owners.' });
  }
}

export async function createOwner(req, res) {
  try {
    const { name, phone, email, city } = req.body;
    if (!name) return res.status(400).json({ message: 'Owner name is required.' });
    const owner = await Owner.create({ name, phone, email, city });
    return res.status(201).json(owner);
  } catch (error) {
    return res.status(500).json({ message: 'Could not create owner.' });
  }
}
