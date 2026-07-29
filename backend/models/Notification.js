const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true },
    message:   { type: String, required: true },
    type:      { type: String, enum: ['Advisory', 'Disease Alert', 'Announcement', 'Reminder'], default: 'Announcement' },
    targetAll: { type: Boolean, default: true },
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sentBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRead:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
