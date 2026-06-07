const express = require('express');
const router = express.Router();

/**
 * Admin Routes
 * GET /api/admin/users - Alle User auflisten
 * GET /api/admin/users/:id - User Details
 * PUT /api/admin/users/:id - User bearbeiten
 * DELETE /api/admin/users/:id - User löschen
 * GET /api/admin/logs - Audit Logs
 * GET /api/admin/stats - Statistiken
 */

function createAdminRoutes(db) {
  /**
   * Alle Benutzer auflisten
   */
  router.get('/users', async (req, res, next) => {
    try {
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Admin privileges required' });
      }

      const users = await db.all(
        `SELECT id, username, email, discord_id, is_admin, is_active, created_at
         FROM users ORDER BY created_at DESC`
      );

      res.json({
        success: true,
        users
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * User Details
   */
  router.get('/users/:id', async (req, res, next) => {
    try {
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Admin privileges required' });
      }

      const { id } = req.params;

      const user = await db.get(
        'SELECT id, username, email, discord_id, is_admin, is_active, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Hole HWIDs
      const hwids = await db.all(
        'SELECT id, hwid, verified, first_seen, last_seen FROM hwid_registrations WHERE user_id = ?',
        [id]
      );

      // Hole Lizenzen
      const licenses = await db.all(
        'SELECT id, key, product_name, created_at, expires_at FROM license_keys WHERE user_id = ?',
        [id]
      );

      res.json({
        success: true,
        user,
        hwids,
        licenses
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * User bearbeiten
   */
  router.put('/users/:id', async (req, res, next) => {
    try {
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Admin privileges required' });
      }

      const { id } = req.params;
      const { is_admin, is_active, discord_id } = req.body;

      const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Logge Änderung
      const oldValue = JSON.stringify({
        is_admin: user.is_admin,
        is_active: user.is_active
      });

      const newValue = JSON.stringify({
        is_admin: is_admin !== undefined ? is_admin : user.is_admin,
        is_active: is_active !== undefined ? is_active : user.is_active
      });

      await db.run(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_value, new_value)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, 'UPDATE_USER', 'users', id, oldValue, newValue]
      );

      // Update User
      const updates = [];
      const params = [];

      if (is_admin !== undefined) {
        updates.push('is_admin = ?');
        params.push(is_admin ? 1 : 0);
      }

      if (is_active !== undefined) {
        updates.push('is_active = ?');
        params.push(is_active ? 1 : 0);
      }

      if (discord_id !== undefined) {
        updates.push('discord_id = ?');
        params.push(discord_id);
      }

      if (updates.length > 0) {
        params.push(id);
        await db.run(
          `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          params
        );
      }

      res.json({
        success: true,
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * User löschen
   */
  router.delete('/users/:id', async (req, res, next) => {
    try {
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Admin privileges required' });
      }

      const { id } = req.params;

      // Vermeide Selbstlöschung
      if (id == req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Logge Löschung
      await db.run(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
         VALUES (?, ?, ?, ?)`,
        [req.user.id, 'DELETE_USER', 'users', id]
      );

      // Setze is_active = 0 statt zu löschen (soft delete)
      await db.run(
        'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Audit Logs
   */
  router.get('/logs', async (req, res, next) => {
    try {
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Admin privileges required' });
      }

      const { limit = 100, offset = 0 } = req.query;

      const logs = await db.all(
        `SELECT id, user_id, action, resource_type, resource_id, old_value, new_value, status, created_at
         FROM audit_logs
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [parseInt(limit), parseInt(offset)]
      );

      const total = await db.get('SELECT COUNT(*) as count FROM audit_logs');

      res.json({
        success: true,
        logs,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: total.count
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Statistiken
   */
  router.get('/stats', async (req, res, next) => {
    try {
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Admin privileges required' });
      }

      const totalUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
      const totalKeys = await db.get('SELECT COUNT(*) as count FROM license_keys WHERE is_active = 1');
      const activatedKeys = await db.get('SELECT COUNT(*) as count FROM license_keys WHERE user_id IS NOT NULL AND is_active = 1');
      const totalHWIDs = await db.get('SELECT COUNT(*) as count FROM hwid_registrations');
      const verifiedHWIDs = await db.get('SELECT COUNT(*) as count FROM hwid_registrations WHERE verified = 1');

      const activationsLast24h = await db.get(
        `SELECT COUNT(*) as count FROM activation_logs
         WHERE created_at > datetime('now', '-24 hours')`
      );

      res.json({
        success: true,
        stats: {
          total_users: totalUsers.count,
          total_license_keys: totalKeys.count,
          activated_keys: activatedKeys.count,
          pending_keys: totalKeys.count - activatedKeys.count,
          total_hwids: totalHWIDs.count,
          verified_hwids: verifiedHWIDs.count,
          activations_last_24h: activationsLast24h.count
        }
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createAdminRoutes;
