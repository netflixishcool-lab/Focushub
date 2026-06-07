const crypto = require('crypto');
const os = require('os');

/**
 * HWID (Hardware ID) Generator
 * Generiert eine eindeutige Hardware-ID basierend auf Systeminformationen
 */
class HWIDGenerator {
  /**
   * Generiert HWID aus Systemdaten
   * Diese Funktion sollte auf dem Client ausgeführt werden
   * @param {object} systemInfo - Systeminformationen vom Client
   * @returns {string} Generierte HWID
   */
  static generateHWID(systemInfo) {
    const {
      cpuModel,
      cpuCores,
      totalMemory,
      diskSerialNumber,
      macAddress,
      osType,
      osRelease
    } = systemInfo;

    // Kombiniere alle Hardware-Informationen
    const hwData = `${cpuModel}-${cpuCores}-${totalMemory}-${diskSerialNumber}-${macAddress}-${osType}-${osRelease}`;

    // Erstelle einen SHA-256 Hash aus den Daten
    return crypto
      .createHash('sha256')
      .update(hwData)
      .digest('hex')
      .toUpperCase();
  }

  /**
   * Generiert einen Seed für erweiterte Verifizierung
   * @param {string} hwid - Die HWID
   * @param {string} userId - Die User ID
   * @returns {string} Verifizierungs-Seed
   */
  static generateVerificationSeed(hwid, userId) {
    const combined = `${hwid}-${userId}`;
    return crypto
      .createHash('sha512')
      .update(combined)
      .digest('hex');
  }

  /**
   * Verifiziert dass die HWID gültig ist (Format-Check)
   * @param {string} hwid - HWID zum Verifizieren
   * @returns {boolean} HWID ist gültig
   */
  static validateHWIDFormat(hwid) {
    // HWID sollte ein 64-Zeichen langer hexadezimaler String sein (SHA-256)
    return /^[A-F0-9]{64}$/.test(hwid.toUpperCase());
  }

  /**
   * Erstellt einen deterministischen Hash aus mehreren HWIDs
   * Nützlich für Multi-HWID-Unterstützung
   * @param {array} hwids - Array von HWIDs
   * @returns {string} Kombinierter Hash
   */
  static combineHWIDs(hwids) {
    const sorted = hwids.sort().join('-');
    return crypto
      .createHash('sha256')
      .update(sorted)
      .digest('hex')
      .toUpperCase();
  }
}

module.exports = HWIDGenerator;
