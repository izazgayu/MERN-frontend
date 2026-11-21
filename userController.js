import bcrypt from 'bcrypt';
import User from '../models/User.js';

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    active: user.active,
    qualification: user.qualification,
    specialization: user.specialization,
    availability: user.availability,
    workingHours: user.workingHours,
    jobTitle: user.jobTitle,
  };
}

// GET /api/users?role=Doctor  — list staff (Admin only)
export async function getUsers(req, res) {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).sort({ name: 1 });
    return res.json(users.map(publicUser));
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch users.' });
  }
}

// POST /api/users  — create Doctor or Staff account (Admin only)
export async function createUser(req, res) {
  try {
    const { name, email, phone, password, role, qualification, specialization, availability, workingHours, jobTitle } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }
    if (!['Doctor', 'Staff'].includes(role)) {
      return res.status(400).json({ message: 'Only Doctor and Staff accounts can be created here.' });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
      role,
      qualification: qualification || '',
      specialization: specialization || '',
      availability: availability || 'Mon–Sat',
      workingHours: workingHours || '9 AM–5 PM',
      jobTitle: jobTitle || '',
    });

    return res.status(201).json({ message: 'Account created.', user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Email already in use.' });
    console.error('createUser error:', error.message);
    return res.status(500).json({ message: 'Could not create account.' });
  }
}

// PATCH /api/users/:id  — update Doctor or Staff account (Admin only)
export async function updateUser(req, res) {
  try {
    const { password, role, ...updates } = req.body; // prevent role escalation

    if (password) {
      updates.password = await bcrypt.hash(password, 12);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json({ user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update account.' });
  }
}

// PATCH /api/users/:id/toggle-active  — activate or deactivate (Admin only)
export async function toggleActive(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'Admin') return res.status(403).json({ message: 'Cannot deactivate an Admin account.' });
    user.active = !user.active;
    await user.save();
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update account status.' });
  }
}
