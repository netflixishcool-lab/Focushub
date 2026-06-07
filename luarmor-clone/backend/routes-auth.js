const express = require('express');
const router = express.Router();

/**
 * Auth Routes
 * POST /auth/register - Registrierung
 * POST /auth/login - Login
 * POST /auth/logout - Logout
 * POST /auth/change-password - Passwort ändern
 */

function createAuthRoutes(authManager) {
  /**
   * Registrierung
   */
  router.post('/register', async (req, res, next) => {
    try {
      const { username, email, password, discord_id } = req.body;

      const user = await authManager.registerUser({
        username,
        email,
        password,
        discord_id
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Login
   */
  router.post('/login', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const result = await authManager.authenticateUser(username, password, ipAddress);

      res.json({
        success: true,
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  });

  /**
   * Logout
   */
  router.post('/logout', async (req, res, next) => {
    try {
      const token = req.headers.authorization?.substring(7);

      if (token) {
        await authManager.revokeToken(token);
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Passwort ändern
   */
  router.post('/change-password', async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new password required' });
      }

      await authManager.changePassword(req.user.id, oldPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * Token verifizieren
   */
  router.get('/verify', async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createAuthRoutes;
