require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const NEW_FARMERS = [
  {
    fullName: 'Alice Chirwa',
    email: 'farmer2@test.zw',
    phone: '0772233445',
    password: 'Farmer2@1234',
    district: 'Mashonaland',
    ward: 'Ward 2',
    farmName: 'Chirwa Farm',
    farmSize: '1.5 hectares',
    role: 'farmer',
  },
  {
    fullName: 'Tendai Ncube',
    email: 'farmer3@test.zw',
    phone: '0773344556',
    password: 'Farmer3@1234',
    district: 'Manicaland',
    ward: 'Ward 8',
    farmName: 'Ncube Farm',
    farmSize: '3 hectares',
    role: 'farmer',
  },
];

async function addFarmers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const f of NEW_FARMERS) {
      const exists = await User.findOne({ email: f.email });
      if (exists) {
        console.log(`ℹ️  ${f.email} already exists, skipping`);
        continue;
      }
      await User.create(f);
      console.log(`➕ Created ${f.email} | password: ${f.password}`);
    }

    console.log('\n✅ Done adding farmers');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add farmers:', err.message);
    process.exit(1);
  }
}

addFarmers();
