import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['Customer', 'Admin', 'Doctor', 'Staff'],
      default: 'Customer',
    },
    // Doctor-specific fields
    qualification: { type: String, trim: true, default: '' },
    specialization: { type: String, trim: true, default: '' },
    availability: { type: String, trim: true, default: '' },
    workingHours: { type: String, trim: true, default: '' },
    // Staff-specific field
    jobTitle: { type: String, trim: true, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model('User', userSchema);
