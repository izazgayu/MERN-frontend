import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['UPI', 'Cash', 'Card'], default: 'Cash' },
    status: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },
    date: { type: String, required: true }, // YYYY-MM-DD
  },
  { timestamps: true },
);

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
