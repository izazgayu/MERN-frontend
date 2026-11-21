import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import petRoutes from './routes/petRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import treatmentRoutes from './routes/treatmentRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = Number(process.env.PORT) || 5001;
const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB_NAME || 'gayathri_veterinary_hospital';

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dbName: mongoose.connection.name,
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

// ─── Global error handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) => {
  console.error('Unhandled error:', error.message);
  res.status(500).json({ message: error.message || 'Internal server error.' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
async function startServer() {
  if (!mongoUri) {
    console.error('❌  MONGODB_URI is not set in .env');
    console.error('    Local:  mongodb://127.0.0.1:27017/gayathri_veterinary_hospital');
    console.error('    Atlas:  mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/gayathri_veterinary_hospital');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { dbName: databaseName });
    console.log(`✅  MongoDB connected → ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌  MongoDB connection failed:', error.message);
    console.error('    Make sure MongoDB is running or use a MongoDB Atlas URI in .env');
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`🚀  API server running at http://localhost:${port}`);
    console.log(`    Health: http://localhost:${port}/api/health`);
  });
}

startServer();
