const express = require('express');
const router = express.Router();
const HWIDGenerator = require('./hwid-generator');
const EncryptionManager = require('./encryption');

/**
 * HWID & Lizenz Routes
 * POST /api/hwid/register - HWID registrieren
 * POST /api/hwid/verify - HWID verifizieren
 * GET /api/hwid/list - Benutzer HWIDs auflisten (nur für eigene)
 * POST /api/license/activate - Lizenzkey aktivieren
 * GET /api/license/keys - Alle Keys auflisten (Admin)
 * POST /api/license/create - Key erstellen (Admin)
 */

function createLicenseRoutes(db, encryption) {
  /**
   * HWID registrieren
   */
  router.post('/hwid/register', async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { hwid, systemInfo } = req.body;

      if (!hwid || !HWIDGenerator.validateHWIDFormat(hwid)) {
        return res.status(400).json({ error: 'Invalid HWID format' });
      }

      // Generiere HWID Hash
      const hwidHash = encryption.generateHash(hwid);
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Prüfe ob HWID bereits existiert
      const existing = await db.get(
        'SELECT * FROM hwid_registrations WHERE hwid_hash = ?',
        [hwidHash]
      );

      let registration;

      if (existing) {
        // Update last_seen
        await db.run(
          `UPDATE hwid_registrations 
           SET last_seen = CURRENT_TIMESTAMP, ip_address = ?, user_agent = ?
           WHERE id = ?`,
          [ipAddress, userAgent, existing.id]
        );

        registration = existing;
      } else {
        // Erstelle neue Registrierung
        const verificationSeed = HWIDGenerator.generateVerificationSeed(hwid, req.user.id.toString());

        const result = await db.run(
          `INSERT INTO hwid_registrations 
           (user_id, hwid, hwid_hash, verification_seed, ip_address, user_agent)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [req.user.id, hwid, hwidHash, verificationSeed, ipAddress, userAgent]
        );

        registration = {
          id: result.id,
          user_id: req.user.id,
          hwid,
          hwid_hash: hwidHash,
          verified: 0,
          verification_seed: verificationSeed,
          first_seen: new Date().toISOString(),
          last_seen: new Date().toISOString()
        };
      }

      res.json({
        success: true,
        message: 'HWID registered successfully',
        registration: {
          id: registration.id,
          hwid: registration.hwid.substring(0, 16) + '...', // Nur teilweise anzeigen
          verified: registration.verified,
          first_seen: registration.first_seen
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * HWID verifizieren
   */
  router.post('/hwid/verify', async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { hwid } = req.body;

      if (!hwid) {
        return res.status(400).json({ error: 'HWID required' });
      }

      const hwidHash = encryption.generateHash(hwid);

      const registration = await db.get(
        'SELECT * FROM hwid_registrations WHERE hwid_hash = ? AND user_id = ?',
        [hwidHash, req.user.id]
      );

      if (!registration) {
        return res.status(404).json({ error: 'HWID not found' });
      }

      // Update verified status
      if (!registration.verified) {
        await db.run(
          'UPDATE hwid_registrations SET verified = 1 WHERE id = ?',
          [registration.id]
        );
      }

      res.json({
        success: true,
        verified: true,
        hwid: registration.hwid.substring(0, 16) + '...',
        first_seen: registration.first_seen,
        last_seen: registration.last_seen
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Benutzer HWIDs auflisten
   */
  router.get('/hwid/list', async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const hwids = await db.all(
        'SELECT id, hwid, verified, first_seen, last_seen FROM hwid_registrations WHERE user_id = ? ORDER BY last_seen DESC',
        [req.user.id]
      );

      res.json({
        success: true,
        hwids: hwids.map(h => ({
          id: h.id,
          hwid: h.hwid.substring(0, 16) + '...',
          verified: !!h.verified,
          first_seen: h.first_seen,
          last_seen: h.last_seen
        }))
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Lizenzkey aktivieren
   */
  router.post('/license/activate', async (req, res, next) => {
    try {
      const { license_key, hwid } = req.body;

      if (!license_key || !hwid) {
        return res.status(400).json({ error: 'License key and HWID required' });
      }

      // Finde License Key
      const licenseKey = await db.get(
        'SELECT * FROM license_keys WHERE key = ? AND is_active = 1',
        [license_key]
      );

      if (!licenseKey) {
        return res.status(404).json({ error: 'License key not found or expired' });
      }

      // Prüfe Ablaufdatum
      if (licenseKey.expires_at && new Date(licenseKey.expires_at) < new Date()) {
        return res.status(400).json({ error: 'License key expired' });
      }

      // Validiere HWID Format
      if (!HWIDGenerator.validateHWIDFormat(hwid)) {
        return res.status(400).json({ error: 'Invalid HWID format' });
      }

      const hwidHash = encryption.generateHash(hwid);
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Prüfe ob Lizenz bereits aktiviert wurde
      const existingActivation = await db.get(
        'SELECT * FROM activation_logs WHERE license_key_id = ? AND hwid_hash = ?',
        [licenseKey.id, hwidHash]
      );

      if (existingActivation) {
        return res.status(400).json({ error: 'License already activated with this HWID' });
      }

      // Wenn bereits ein User zugeordnet ist, kann es nicht nochmal aktiviert werden
      if (licenseKey.user_id && licenseKey.user_id !== null) {
        return res.status(400).json({ error: 'License key already activated by another user' });
      }

      // Erstelle neuen User oder nutze den aktuellen
      let userId = null;

      if (req.user) {
        userId = req.user.id;
      } else {
        // Für anonyme Aktivierung: Generiere temporären User (optional)
        return res.status(401).json({ error: 'User authentication required to activate license' });
      }

      // Registriere HWID falls nicht existiert
      await db.run(
        `INSERT OR IGNORE INTO hwid_registrations 
         (user_id, hwid, hwid_hash, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, hwid, hwidHash, ipAddress, userAgent]
      );

      // Update License Key mit User
      await db.run(
        'UPDATE license_keys SET user_id = ?, activation_count = activation_count + 1 WHERE id = ?',
        [userId, licenseKey.id]
      );

      // Logge Aktivierung
      await db.run(
        `INSERT INTO activation_logs 
         (license_key_id, user_id, hwid, hwid_hash, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [licenseKey.id, userId, hwid, hwidHash, ipAddress, userAgent]
      );

      res.json({
        success: true,
        message: 'License activated successfully',
        license: {
          product: licenseKey.product_name,
          activated_at: new Date().toISOString(),
          expires_at: licenseKey.expires_at
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Alle Lizenzkeys auflisten (Admin)
   */
  router.get('/license/keys', async (req, res, next) => {
    try {
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Admin privileges required' });
      }

      const keys = await db.all(
        `SELECT lk.id, lk.key, lk.product_name, lk.created_at, lk.expires_at, 
                lk.is_active, lk.activation_count, u.username
         FROM license_keys lk
         LEFT JOIN users u ON lk.user_id = u.id
         ORDER BY lk.created_at DESC`
      );

      res.json({
        success: true,
        keys: keys.map(k => ({
          id: k.id,
          key: k.key.substring(0, 10) + '...', // Nur teilweise anzeigen
          product: k.product_name,
          activated_by: k.username || 'Not activated',
          created_at: k.created_at,
          expires_at: k.expires_at,
          is_active: !!k.is_active,
          activation_count: k.activation_count
        }))
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Neuen Lizenzkey erstellen (Admin)
   */
  router.post('/license/create', async (req, res, next) => {
    try {
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Admin privileges required' });
      }

      const { product_name, expires_in_days, quantity } = req.body;

      if (!product_name) {
        return res.status(400).json({ error: 'Product name required' });
      }

      const keys = [];

      for (let i = 0; i < (quantity || 1); i++) {
        // Generiere eindeutigen Key
        const licenseKey = encryption.generateToken(32);

        // Berechne Ablaufdatum
        let expiresAt = null;
        if (expires_in_days) {
          expiresAt = new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString();
        }

        const result = await db.run(
          `INSERT INTO license_keys 
           (key, product_name, created_by, expires_at, is_active)
           VALUES (?, ?, ?, ?, ?)`,
          [licenseKey, product_name, req.user.id, expiresAt, 1]
        );

        keys.push({
          id: result.id,
          key: licenseKey,
          product_name,
          expires_at: expiresAt
        });
      }

      res.status(201).json({
        success: true,
        message: `${keys.length} license key(s) created successfully`,
        keys
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createLicenseRoutes;
