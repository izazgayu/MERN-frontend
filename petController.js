import Pet from '../models/Pet.js';
import Owner from '../models/Owner.js';

export async function getPets(req, res) {
  try {
    const pets = await Pet.find()
      .populate('ownerId', 'name phone email city')
      .populate('assignedDoctorId', 'name specialization')
      .sort({ createdAt: -1 });
    return res.json(pets);
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch pets.' });
  }
}

export async function createPet(req, res) {
  try {
    const { name, species, breed, age, ownerId, assignedDoctorId } = req.body;
    if (!name || !ownerId) return res.status(400).json({ message: 'Name and ownerId are required.' });
    const pet = await Pet.create({ name, species, breed, age, ownerId, assignedDoctorId });
    return res.status(201).json(pet);
  } catch (error) {
    return res.status(500).json({ message: 'Could not create pet.' });
  }
}

export async function updatePet(req, res) {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pet) return res.status(404).json({ message: 'Pet not found.' });
    return res.json(pet);
  } catch (error) {
    return res.status(500).json({ message: 'Could not update pet.' });
  }
}
