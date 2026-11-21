import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

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

// ─── Customer Signup ──────────────────────────────────────────────────────
export async function signupuser(req, res) {
  try {
    const { name, phone, email, password, confirmPassword } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (typeof confirmPassword === 'string' && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      phone: phone?.trim() || '',
      email: normalizedEmail,
      password: hashedPassword,
      role: 'Customer',
    });

    return res.status(201).json({
      message: 'Account created successfully. Please sign in.',
      user: publicUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }
    console.error('Signup error:', error.message);
    return res.status(500).json({ message: 'Could not create your account. Please try again.' });
  }
}

// ─── Universal Login (all roles) ─────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password, role } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const query = { email: email.trim().toLowerCase(), active: true };
    if (role) query.role = role;

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const token = signToken(user);
    return res.status(200).json({
      message: 'Signed in successfully.',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Could not sign you in. Please try again.' });
  }
}

// ─── Get current user (from JWT) ─────────────────────────────────────────
export async function getMe(req, res) {
  return res.status(200).json({ user: publicUser(req.user) });
}
