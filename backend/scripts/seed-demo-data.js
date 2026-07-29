require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Record = require('../models/Record');
const Notification = require('../models/Notification');

const DEMO_RECORDS = [
  {
    category: 'Planting',
    crop: 'Maize',
    date: new Date('2025-01-10'),
    notes: 'Planted hybrid seed on the first rain.',
    variety: 'SC403',
    area: '0.8 hectares',
  },
  {
    category: 'Fertilizer',
    crop: 'Maize',
    date: new Date('2025-01-25'),
    notes: 'Top-dressed with ammonium nitrate at V6.',
    productName: 'Ammonium Nitrate',
    quantity: '200 kg',
  },
  {
    category: 'Harvest',
    crop: 'Maize',
    date: new Date('2025-04-02'),
    notes: 'Harvested when grain moisture was low.',
    quantityHarvested: '1.8 tonnes',
  },
  {
    category: 'Expense',
    crop: 'Tomato',
    date: new Date('2025-02-05'),
    notes: 'Bought tomato seedlings and stakes.',
    item: 'Tomato seedlings',
    cost: 120,
  },
  {
    category: 'Pesticide',
    crop: 'Maize',
    date: new Date('2025-02-10'),
    notes: 'Applied insecticide for fall armyworm scouting.',
    productName: 'Emamectin benzoate',
    quantity: '2 litres',
  },
];

const DEMO_NOTIFICATIONS = [
  {
    title: 'New Season Advisory Available',
    message: 'A new advisory for maize planting has been published. Check the advisories page.',
    type: 'Announcement',
    targetAll: true,
  },
  {
    title: 'Reminder: First Weeding',
    message: 'First weeding should be done now to reduce weed pressure and conserve moisture.',
    type: 'Reminder',
    targetAll: true,
  },
  {
    title: 'Disease Alert: Maize Streak Awareness',
    message: 'Yellow streaks may indicate Maize Streak Virus. Use resistant varieties and monitor closely.',
    type: 'Disease Alert',
    targetAll: true,
  },
];

async function seedDemo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    const farmer = await User.findOne({ email: 'farmer@test.zw' });
    if (!admin || !farmer) {
      throw new Error('Admin or farmer user not found. Run seed.js first.');
    }

    const records = DEMO_RECORDS.map((record) => ({ ...record, userId: farmer._id }));
    await Record.insertMany(records);
    console.log(`📋 Seeded ${records.length} demo farm records for ${farmer.email}`);

    const notifications = DEMO_NOTIFICATIONS.map((note) => ({ ...note, sentBy: admin._id }));
    await Notification.insertMany(notifications);
    console.log(`🔔 Seeded ${notifications.length} demo notifications`);

    console.log('\n🌱 Demo data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Demo seeding failed:', err.message);
    process.exit(1);
  }
}

seedDemo();
