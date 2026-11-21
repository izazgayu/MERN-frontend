import Treatment from '../models/Treatment.js';
import Pet from '../models/Pet.js';
import Owner from '../models/Owner.js';
import User from '../models/User.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function getTreatments(req, res) {
  try {
    let filter = {};
    if (req.user.role === 'Doctor') filter.doctorId = req.user._id;

    const treatments = await Treatment.find(filter)
      .populate('petId', 'name species')
      .populate('ownerId', 'name phone')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });

    return res.json(treatments);
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch treatments.' });
  }
}

export async function createTreatment(req, res) {
  try {
    const { petId, symptoms, diagnosis, treatment, prescription, followUpDate, appointmentId } = req.body;
    if (!petId || !symptoms || !diagnosis || !treatment || !prescription || !followUpDate) {
      return res.status(400).json({ message: 'All treatment fields are required.' });
    }

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found.' });

    // Doctor can only add records for their assigned patients
    if (req.user.role === 'Doctor') {
      const isAssigned = String(pet.assignedDoctorId) === String(req.user._id);
      if (!isAssigned) return res.status(403).json({ message: 'You can only add records for your assigned patients.' });
    }

    const record = await Treatment.create({
      petId,
      ownerId: pet.ownerId,
      doctorId: req.user._id,
      appointmentId: appointmentId || null,
      date: today(),
      symptoms,
      diagnosis,
      treatment,
      prescription,
      followUpDate,
      status: 'In progress',
    });

    const populated = await Treatment.findById(record._id)
      .populate('petId', 'name species')
      .populate('ownerId', 'name')
      .populate('doctorId', 'name');

    return res.status(201).json(populated);
  } catch (error) {
    console.error('createTreatment error:', error.message);
    return res.status(500).json({ message: 'Could not create treatment record.' });
  }
}

export async function updateTreatmentStatus(req, res) {
  try {
    const record = await Treatment.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Treatment record not found.' });

    if (req.user.role === 'Doctor' && String(record.doctorId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only update your own treatment records.' });
    }

    if (req.body.status) record.status = req.body.status;
    await record.save();
    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: 'Could not update treatment.' });
  }
}
