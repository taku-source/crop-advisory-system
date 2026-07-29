const Notification = require('../models/Notification');
const User = require('../models/User');
const Advisory = require('../models/Advisory');

// Lazy-load Firebase admin (only if credentials are configured)
const getFirebaseAdmin = () => {
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId:   process.env.FIREBASE_PROJECT_ID,
          privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    return admin;
  } catch {
    return null;
  }
};

// Send FCM push to a list of tokens
const pushToTokens = async (tokens, title, body) => {
  const admin = getFirebaseAdmin();
  if (!admin || tokens.length === 0) return;

  const message = {
    notification: { title, body },
    tokens: tokens.filter(Boolean),
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`📲 FCM: ${response.successCount} sent, ${response.failureCount} failed`);
  } catch (err) {
    console.error('FCM error:', err.message);
  }
};

// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ targetAll: true }, { targetUsers: req.user._id }],
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ success: true, count: notifications.length, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/notifications  [Admin]
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, targetAll, targetUsers } = req.body;

    const notification = await Notification.create({
      title, message, type, targetAll,
      targetUsers: targetAll ? [] : targetUsers,
      sentBy: req.user._id,
    });

    // Push to relevant FCM tokens
    let tokens = [];
    if (targetAll) {
      const users = await User.find({ isActive: true, fcmToken: { $ne: null } }).select('fcmToken');
      tokens = users.map((u) => u.fcmToken);
    } else if (targetUsers?.length) {
      const users = await User.find({ _id: { $in: targetUsers }, fcmToken: { $ne: null } }).select('fcmToken');
      tokens = users.map((u) => u.fcmToken);
    }

    await pushToTokens(tokens, title, message);

    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/notifications/:id  [Admin]
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Called by cron job — send reminders for advisories due in the next 3 days
exports.sendAdvisoryReminders = async () => {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcoming = await Advisory.find({
    recommendedDate: { $gte: now, $lte: in3Days },
    isActive: true,
  });

  for (const advisory of upcoming) {
    const daysLeft = Math.ceil((advisory.recommendedDate - now) / (1000 * 60 * 60 * 24));
    const title = `Upcoming: ${advisory.activity}`;
    const message = `Reminder: "${advisory.activity}" for ${advisory.crop} is due in ${daysLeft} day(s). ${advisory.description}`;

    const notification = new Notification({ title, message, type: 'Reminder', targetAll: true });
    await notification.save();

    const users = await User.find({ isActive: true, fcmToken: { $ne: null } }).select('fcmToken');
    await pushToTokens(users.map((u) => u.fcmToken), title, message);
  }

  console.log(`✅ Advisory reminders sent for ${upcoming.length} advisories`);
};
