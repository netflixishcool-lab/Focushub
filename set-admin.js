import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';

dotenv.config();

const setAdminFlag = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 MongoDB verbunden...');

    const admin = await User.findOneAndUpdate(
      { username: 'Admin' },
      { isAdmin: true },
      { new: true }
    );

    if (admin) {
      console.log('✅ Admin-Flag gesetzt!');
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   isAdmin: ${admin.isAdmin}`);
    } else {
      console.log('❌ Admin nicht gefunden');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Fehler:', error.message);
  }
};

setAdminFlag();
