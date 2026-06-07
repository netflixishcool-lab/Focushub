import express from 'express';
import HWID from '../models/HWID.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { hashHWID } from '../middleware/encryption.js';

const router = express.Router();

router.post('/register', protect, async (req, res) => {
  try {
    const { hwid, userAgent } = req.body;

    if (!hwid) {
      return res.status(400).json({ message: 'HWID erforderlich' });
    }

    const hashedHWID = hashHWID(hwid);
    let hwidRecord = await HWID.findOne({ hwid: hashedHWID });

    if (hwidRecord && hwidRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'HWID bereits registriert' });
    }

    if (!hwidRecord) {
      hwidRecord = await HWID.create({
        hwid: hashedHWID,
        user: req.user._id,
        ipAddress: req.ip,
        userAgent,
        lastUsed: new Date()
      });
    } else {
      hwidRecord.lastUsed = new Date();
      await hwidRecord.save();
    }

    req.user.hwid = hashedHWID;
    await req.user.save();

    res.json({
      message: 'HWID registriert',
      hwid: hwidRecord.hwid
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { hwid } = req.body;

    if (!hwid) {
      return res.status(400).json({ message: 'HWID erforderlich' });
    }

    const hashedHWID = hashHWID(hwid);
    const hwidRecord = await HWID.findOne({ hwid: hashedHWID, user: req.user._id });

    if (!hwidRecord) {
      return res.status(403).json({ message: 'HWID stimmt nicht' });
    }

    if (!hwidRecord.isActive) {
      return res.status(403).json({ message: 'HWID deaktiviert' });
    }

    hwidRecord.lastUsed = new Date();
    await hwidRecord.save();

    res.json({
      message: 'HWID verifiziert',
      verified: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/info', protect, async (req, res) => {
  try {
    const hwids = await HWID.find({ user: req.user._id });

    res.json({
      count: hwids.length,
      hwids: hwids.map(h => ({
        id: h._id,
        lastUsed: h.lastUsed,
        isActive: h.isActive,
        createdAt: h.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;