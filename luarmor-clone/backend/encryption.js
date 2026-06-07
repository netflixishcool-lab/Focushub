const crypto = require('crypto');

class EncryptionManager {
  constructor(encryptionKey) {
    // Stelle sicher, dass der Schlüssel 32 Bytes (256 Bits) ist
    if (!encryptionKey || encryptionKey.length < 32) {
      throw new Error('Encryption key must be at least 32 characters long');
    }
    this.encryptionKey = crypto.createHash('sha256').update(String(encryptionKey)).digest();
  }

  /**
   * Verschlüsselt Daten mit AES-256-CBC
   * @param {string} data - Zu verschlüsselnde Daten
   * @returns {string} Verschlüsselte Daten (Base64 kodiert)
   */
  encrypt(data) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // IV + encrypted data (beide in hex, dann base64 kodiert)
      const result = iv.toString('hex') + ':' + encrypted;
      return Buffer.from(result).toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Entschlüsselt Daten mit AES-256-CBC
   * @param {string} encryptedData - Verschlüsselte Daten (Base64 kodiert)
   * @returns {object} Entschlüsselte Daten
   */
  decrypt(encryptedData) {
    try {
      const decodedData = Buffer.from(encryptedData, 'base64').toString('utf8');
      const parts = decodedData.split(':');
      
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generiert eine HMAC-256 Hash für Datenverfizierung
   * @param {string} data - Zu hashende Daten
   * @returns {string} HMAC-Hash
   */
  generateHash(data) {
    return crypto
      .createHmac('sha256', this.encryptionKey)
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Verifiziert einen HMAC-Hash
   * @param {string} data - Originaldaten
   * @param {string} hash - Zu verifizierender Hash
   * @returns {boolean} Hash ist gültig
   */
  verifyHash(data, hash) {
    const computed = this.generateHash(data);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  }

  /**
   * Generiert einen zufälligen Token
   * @param {number} length - Länge des Tokens
   * @returns {string} Zufälliger Token
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

module.exports = EncryptionManager;
