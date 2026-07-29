require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({}).select('fullName email role district ward farmName farmSize isActive createdAt');
    console.log(`Found ${users.length} users:\n`);
    users.forEach((u) => {
      console.log(`- ${u.fullName} | ${u.email} | role=${u.role} | ${u.district || '-'} ${u.ward || ''} | farm=${u.farmName || '-'} | active=${u.isActive}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error listing users:', err.message);
    process.exit(1);
  }
}

listUsers();
