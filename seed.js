/**
 * Seed script – run once to create default Admin, Doctors and Staff accounts.
 *   node server/seed.js
 *
 * Safe to run multiple times; it skips accounts that already exist.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'gayathri_veterinary_hospital';

const defaultAccounts = [
  // Admin
  {
    name: 'Hospital Administrator',
    email: 'admin@gayathrivets.com',
    phone: '+91 99407 49535',
    password: 'Admin@123',
    role: 'Admin',
  },
  // Doctors
  {
    name: 'Dr. Ananya Kumar',
    email: 'doctor@gayathrivets.com',
    phone: '+91 98400 10001',
    password: 'Doctor@123',
    role: 'Doctor',
    qualification: 'BVSc & AH, MVSc',
    specialization: 'Small Animal Medicine',
    availability: 'Mon–Sat',
    workingHours: '9 AM–5 PM',
  },
  {
    name: 'Dr. Rahul Menon',
    email: 'rahul@gayathrivets.com',
    phone: '+91 98400 10002',
    password: 'Doctor@123',
    role: 'Doctor',
    qualification: 'BVSc & AH, MS',
    specialization: 'Surgery',
    availability: 'Mon–Fri',
    workingHours: '10 AM–6 PM',
  },
  {
    name: 'Dr. Meera Nair',
    email: 'meera@gayathrivets.com',
    phone: '+91 98400 10003',
    password: 'Doctor@123',
    role: 'Doctor',
    qualification: 'BVSc & AH',
    specialization: 'Preventive Care',
    availability: 'Tue–Sun',
    workingHours: '9:30 AM–4:30 PM',
  },
  {
    name: 'Dr. Karthik Iyer',
    email: 'karthik@gayathrivets.com',
    phone: '+91 98400 10004',
    password: 'Doctor@123',
    role: 'Doctor',
    qualification: 'BVSc & AH, MVSc',
    specialization: 'Dermatology',
    availability: 'Mon–Sat',
    workingHours: '11 AM–7 PM',
  },
  {
    name: 'Dr. Priya Raman',
    email: 'priya@gayathrivets.com',
    phone: '+91 98400 10005',
    password: 'Doctor@123',
    role: 'Doctor',
    qualification: 'BVSc & AH, PGDVM',
    specialization: 'Exotic Animals',
    availability: 'Mon–Fri',
    workingHours: '9 AM–5 PM',
  },
  // Staff
  {
    name: 'Lakshmi Devi',
    email: 'staff@gayathrivets.com',
    phone: '+91 98400 10006',
    password: 'Staff@123',
    role: 'Staff',
    jobTitle: 'Receptionist',
  },
  {
    name: 'Arun Prakash',
    email: 'nurse@gayathrivets.com',
    phone: '+91 98400 10007',
    password: 'Staff@123',
    role: 'Staff',
    jobTitle: 'Veterinary Nurse',
  },
  {
    name: 'Nisha Joseph',
    email: 'care@gayathrivets.com',
    phone: '+91 98400 10008',
    password: 'Staff@123',
    role: 'Staff',
    jobTitle: 'Care Assistant',
  },
];

async function seed() {
  if (!mongoUri) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { dbName });
  console.log('Connected to MongoDB:', mongoose.connection.name);

  let created = 0;
  let skipped = 0;

  for (const account of defaultAccounts) {
    const existing = await User.findOne({ email: account.email });
    if (existing) {
      console.log(`  SKIP  ${account.role.padEnd(8)} ${account.email}`);
      skipped++;
      continue;
    }
    const hashed = await bcrypt.hash(account.password, 12);
    await User.create({ ...account, password: hashed });
    console.log(`  CREATE ${account.role.padEnd(8)} ${account.email}  (password: ${account.password})`);
    created++;
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
