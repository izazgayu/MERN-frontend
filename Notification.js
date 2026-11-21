import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    // 'all' means every doctor, otherwise an ObjectId string of a specific doctor
    audience: { type: String, required: true, default: 'all' },
    type: {
      type: String,
      enum: ['Announcement', 'Appointment', 'Schedule', 'System', 'Appointment change', 'Direct message'],
      default: 'Announcement',
    },
    createdAt: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  },
  { timestamps: true },
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
