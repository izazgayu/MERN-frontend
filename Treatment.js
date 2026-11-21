import mongoose from 'mongoose';

const treatmentSchema = new mongoose.Schema(
  {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    date: { type: String, required: true }, // YYYY-MM-DD
    symptoms: { type: String, trim: true, default: '' },
    diagnosis: { type: String, trim: true, default: '' },
    treatment: { type: String, trim: true, default: '' },
    prescription: { type: String, trim: true, default: '' },
    followUpDate: { type: String, default: '' },
    status: {
      type: String,
      enum: ['In progress', 'Follow-up due', 'Completed'],
      default: 'In progress',
    },
  },
  { timestamps: true },
);

export default mongoose.models.Treatment || mongoose.model('Treatment', treatmentSchema);
