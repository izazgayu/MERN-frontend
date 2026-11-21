import Notification from '../models/Notification.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function getNotifications(req, res) {
  try {
    let filter = {};
    if (req.user.role === 'Doctor') {
      filter = { $or: [{ audience: 'all' }, { audience: String(req.user._id) }] };
    }
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch notifications.' });
  }
}

export async function createNotification(req, res) {
  try {
    const { title, message, audience, type } = req.body;
    if (!title || !message || !audience) {
      return res.status(400).json({ message: 'Title, message, and audience are required.' });
    }
    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      audience,
      type: type || 'Announcement',
      createdAt: today(),
    });
    return res.status(201).json(notification);
  } catch (error) {
    return res.status(500).json({ message: 'Could not create notification.' });
  }
}
