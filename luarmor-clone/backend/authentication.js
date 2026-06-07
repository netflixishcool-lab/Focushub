const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const EncryptionManager = require('./encryption');
const crypto = require('crypto');

class AuthenticationManager {
  constructor(db, jwtSecret, encryptionKey) {
    this.db = db;
    this.jwtSecret = jwtSecret;
    this.encryption = new EncryptionManager(encryptionKey);
  }

  /**
   * Hasht ein Passwort mit Bcrypt
   * @param {string} password - Zu hashhendes Passwort
   * @returns {string} Gehashtes Passwort
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verifiziert ein Passwort gegen seinen Hash
   * @param {string} password - Eingegebenes Passwort
   * @param {string} hash - Gehashtes Passwort
   * @returns {boolean} Passwort ist gültig
   */
  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Erstellt einen JWT Token
   * @param {object} user - Benutzerobject
   * @param {string} expiresIn - Token Ablaufdauer
   * @returns {string} JWT Token
   */
  createJWT(user, expiresIn = '24h') {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      discord_id: user.discord_id,
      is_admin: user.is_admin
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn });
  }

  /**
   * Verifiziert einen JWT Token
   * @param {string} token - JWT Token
   * @returns {object} Dekodierter Token
   */
  verifyJWT(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Registriert einen neuen Benutzer
   * @param {object} userData - Benutzerdaten (username, email, password)
   * @returns {object} Erstellter Benutzer
   */
  async registerUser(userData) {
    const { username, email, password, discord_id } = userData;

    // Validiere Eingaben
    if (!username || !email || !password) {
      throw new Error('Username, email and password are required');
    }

    if (username.length < 3 || username.length > 20) {
      throw new Error('Username must be between 3 and 20 characters');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Prüfe ob Benutzer bereits existiert
    const existing = await this.db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing) {
      throw new Error('Username or email already exists');
    }

    // Hashe Passwort
    const passwordHash = await this.hashPassword(password);

    // Erstelle Benutzer
    const result = await this.db.run(
      `INSERT INTO users (username, email, password_hash, discord_id, is_admin, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, passwordHash, discord_id || null, 0, 1]
    );

    return {
      id: result.id,
      username,
      email,
      discord_id,
      is_admin: false,
      is_active: true,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Authentifiziert einen Benutzer
   * @param {string} username - Benutzername oder Email
   * @param {string} password - Passwort
   * @param {string} ipAddress - IP Addresse für Logging
   * @returns {object} Token und Benutzerinformationen
   */
  async authenticateUser(username, password, ipAddress = null) {
    // Finde Benutzer
    const user = await this.db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    // Verifiziere Passwort
    const passwordValid = await this.verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    // Erstelle JWT Token
    const token = this.createJWT(user);

    // Speichere Token in Datenbank für zusätzliche Sicherheit
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    await this.db.run(
      `INSERT INTO auth_tokens (user_id, token, token_hash, ip_address, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user.id,
        token,
        tokenHash,
        ipAddress,
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      ]
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        discord_id: user.discord_id,
        is_admin: user.is_admin
      }
    };
  }

  /**
   * Verifiziert einen Token und holt Benutzerinformationen
   * @param {string} token - JWT Token
   * @returns {object} Benutzerinformationen
   */
  async verifyToken(token) {
    try {
      const decoded = this.verifyJWT(token);

      // Prüfe ob Token in Datenbank existiert
      const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const dbToken = await this.db.get(
        'SELECT * FROM auth_tokens WHERE token_hash = ? AND is_revoked = 0',
        [tokenHash]
      );

      if (!dbToken) {
        throw new Error('Token not found or revoked');
      }

      // Prüfe Ablaufzeit
      if (new Date(dbToken.expires_at) < new Date()) {
        throw new Error('Token expired');
      }

      // Hole Benutzerdaten
      const user = await this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [decoded.id]
      );

      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }

      return user;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Widerruft einen Token (Logout)
   * @param {string} token - JWT Token zum Widerrufen
   */
  async revokeToken(token) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    await this.db.run(
      'UPDATE auth_tokens SET is_revoked = 1 WHERE token_hash = ?',
      [tokenHash]
    );
  }

  /**
   * Ändert das Passwort eines Benutzers
   * @param {number} userId - Benutzer ID
   * @param {string} oldPassword - Altes Passwort
   * @param {string} newPassword - Neues Passwort
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.db.get('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) {
      throw new Error('User not found');
    }

    // Verifiziere altes Passwort
    const passwordValid = await this.verifyPassword(oldPassword, user.password_hash);

    if (!passwordValid) {
      throw new Error('Old password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    // Hashe neues Passwort
    const newPasswordHash = await this.hashPassword(newPassword);

    // Update Passwort
    await this.db.run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );
  }
}

module.exports = AuthenticationManager;
