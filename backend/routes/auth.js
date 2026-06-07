import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Alle Felder erforderlich' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwörter stimmen nicht überein' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Passwort mindestens 8 Zeichen' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Benutzer existiert bereits' });
    }

    const user = await User.create({ username, email, password });
    const token = user.generateAuthToken();

    res.status(201).json({
      message: 'Registrierung erfolgreich',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email und Passwort erforderlich' });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deaktiviert' });
    }

    const token = user.generateAuthToken();

    res.json({
      message: 'Login erfolgreich',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;