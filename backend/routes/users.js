import express from 'express';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('licenseKey')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/discord/:discordId', async (req, res) => {
  try {
    const user = await User.findOne({ discordId: req.params.discordId })
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;

    // Importiere LicenseKey
    const LicenseKey = (await import('../models/LicenseKey.js')).default;

    // Finde alle Keys des Users und revoke sie
    const userKeys = await LicenseKey.find({ redeemedBy: userId });
    
    for (let key of userKeys) {
      key.isRedeemed = false;
      key.redeemedBy = null;
      key.redeemedAt = null;
      await key.save();
    }

    // Lösche den User
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    res.json({ 
      message: `Benutzer ${user.username} wurde entfernt und ${userKeys.length} Keys wurden revoked`,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;