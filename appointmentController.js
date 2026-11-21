import Appointment from '../models/Appointment.js';
import Owner from '../models/Owner.js';
import Pet from '../models/Pet.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── GET all appointments (Admin / Staff see all; Doctor sees own; Customer sees own) ──
export async function getAppointments(req, res) {
  try {
    let filter = {};
    if (req.user.role === 'Doctor') filter.doctorId = req.user._id;
    if (req.user.role === 'Customer') {
      const owner = await Owner.findOne({ customerId: req.user._id });
      if (!owner) return res.json([]);
      filter.ownerId = owner._id;
    }

    const appointments = await Appointment.find(filter)
      .populate('petId', 'name species breed')
      .populate('ownerId', 'name phone email')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 });

    return res.json(appointments);
  } catch (error) {
    console.error('getAppointments error:', error.message);
    return res.status(500).json({ message: 'Could not fetch appointments.' });
  }
}

// ─── POST create appointment (Customer books; Admin/Staff create directly) ──
export async function createAppointment(req, res) {
  try {
    const { ownerName, ownerPhone, ownerCity, petName, species, doctorId, date, time, reason, payment, city } = req.body;

    if (!petName || !date || !time) {
      return res.status(400).json({ message: 'Pet name, date, and time are required.' });
    }

    // Resolve or create owner
    let owner;
    if (req.user.role === 'Customer') {
      owner = await Owner.findOne({ customerId: req.user._id });
      if (!owner) {
        owner = await Owner.create({
          name: req.user.name,
          phone: req.user.phone || ownerPhone || '',
          email: req.user.email,
          city: city || ownerCity || 'Coimbatore',
          customerId: req.user._id,
        });
      }
    } else {
      // Admin / Staff creating on behalf of a client
      if (!ownerName) return res.status(400).json({ message: 'Owner name is required.' });
      owner = await Owner.findOne({ name: ownerName.trim() }) ||
        await Owner.create({
          name: ownerName.trim(),
          phone: ownerPhone || '',
          city: ownerCity || city || 'Coimbatore',
        });
    }

    // Resolve doctor — reject fake prop IDs, fall back to any active doctor
    let resolvedDoctorId = null;
    if (doctorId) {
      // Validate it looks like a MongoDB ObjectId (24 hex chars)
      const isValidObjectId = /^[a-f\d]{24}$/i.test(String(doctorId));
      if (isValidObjectId) {
        resolvedDoctorId = doctorId;
      }
    }
    if (!resolvedDoctorId) {
      const anyDoctor = await User.findOne({ role: 'Doctor', active: true });
      if (!anyDoctor) return res.status(400).json({ message: 'No doctors are available.' });
      resolvedDoctorId = anyDoctor._id;
    }

    // Create pet
    const pet = await Pet.create({
      name: petName.trim(),
      species: species || 'Dog',
      ownerId: owner._id,
      assignedDoctorId: resolvedDoctorId,
    });

    const appointment = await Appointment.create({
      petId: pet._id,
      ownerId: owner._id,
      doctorId: resolvedDoctorId,
      date,
      time,
      reason: reason?.trim() || 'Appointment request',
      status: 'Pending',
      payment: payment || 'UPI',
      city: city || ownerCity || 'Coimbatore',
    });

    // Notify assigned doctor
    await Notification.create({
      title: 'New appointment assigned',
      message: `${pet.name} has a new appointment on ${date} at ${time}.`,
      audience: String(resolvedDoctorId),
      type: 'Appointment',
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('petId', 'name species')
      .populate('ownerId', 'name phone')
      .populate('doctorId', 'name specialization');

    return res.status(201).json(populated);
  } catch (error) {
    console.error('createAppointment error:', error.message);
    return res.status(500).json({ message: 'Could not create appointment.' });
  }
}

// ─── PATCH update appointment ──────────────────────────────────────────────
export async function updateAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    const allowedFields = ['status', 'date', 'time', 'doctorId', 'reason'];
    const changes = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined && String(req.body[field]) !== String(appointment[field])) {
        changes.push(`${field} changed`);
        appointment[field] = req.body[field];
      }
    }

    await appointment.save();

    // Create notification for doctor if something changed
    if (changes.length) {
      const pet = await Pet.findById(appointment.petId);
      await Notification.create({
        title: 'Appointment updated',
        message: `${pet?.name || 'Patient'}: ${changes.join(', ')}.`,
        audience: String(appointment.doctorId),
        type: 'Appointment change',
      });
    }

    const populated = await Appointment.findById(appointment._id)
      .populate('petId', 'name species')
      .populate('ownerId', 'name phone')
      .populate('doctorId', 'name specialization');

    return res.json(populated);
  } catch (error) {
    console.error('updateAppointment error:', error.message);
    return res.status(500).json({ message: 'Could not update appointment.' });
  }
}

// ─── DELETE appointment (Admin only) ──────────────────────────────────────
export async function deleteAppointment(req, res) {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Appointment deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete appointment.' });
  }
}
