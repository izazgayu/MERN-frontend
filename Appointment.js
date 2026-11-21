import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true },
    reason: { type: String, trim: true, default: 'Appointment request' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    payment: { type: String, enum: ['UPI', 'Cash', 'Card'], default: 'UPI' },
    city: { type: String, trim: true, default: 'Coimbatore' },
  },
  { timestamps: true },
);

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
