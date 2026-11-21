import mongoose from 'mongoose';

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    species: { type: String, trim: true, default: 'Dog' },
    breed: { type: String, trim: true, default: 'Not specified' },
    age: { type: String, trim: true, default: 'Not provided' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    assignedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true },
);

export default mongoose.models.Pet || mongoose.model('Pet', petSchema);
