import express from 'express';
import User from '../models/User.js';
import LicenseKey from '../models/LicenseKey.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalKeys = await LicenseKey.countDocuments({});
    const redeemedKeys = await LicenseKey.countDocuments({ isRedeemed: true });
    const availableKeys = await LicenseKey.countDocuments({ isRedeemed: false });

    res.json({
      totalUsers,
      activeUsers,
      totalKeys,
      redeemedKeys,
      availableKeys
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const newUsersLast7 = await User.countDocuments({ createdAt: { $gte: last7Days } });
    const newUsersLast30 = await User.countDocuments({ createdAt: { $gte: last30Days } });

    const keysRedeemedLast7 = await LicenseKey.countDocuments({
      redeemedAt: { $gte: last7Days }
    });

    res.json({
      newUsersLast7,
      newUsersLast30,
      keysRedeemedLast7
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;