/**
 * Client HWID Generator & License Activator
 * 
 * Dieser Code sollte auf dem Client-System laufen
 * um HWID zu generieren und Lizenzen zu aktivieren
 */

const os = require('os');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class FocusHubClient {
  constructor(apiUrl = 'http://localhost:5000') {
    this.apiUrl = apiUrl;
    this.configPath = path.join(os.homedir(), '.focushub', 'config.json');
    this.hwid = null;
    this.token = null;
    this.loadConfig();
  }

  /**
   * Lädt gespeicherte Konfiguration
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        this.hwid = config.hwid;
        this.token = config.token;
      }
    } catch (error) {
      console.warn('Config file not found, will create new');
    }
  }

  /**
   * Speichert Konfiguration
   */
  saveConfig() {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.configPath, JSON.stringify({
      hwid: this.hwid,
      token: this.token,
      lastUpdate: new Date().toISOString()
    }, null, 2));
  }

  /**
   * Sammelt Systeminformationen für HWID Generierung
   */
  gatherSystemInfo() {
    const info = {
      cpuModel: os.cpus()[0].model,
      cpuCores: os.cpus().length,
      totalMemory: os.totalmem(),
      platform: os.platform(),
      osRelease: os.release(),
      arch: os.arch(),
      hostname: os.hostname()
    };

    // Disk Serial Number (platform-specific)
    info.diskSerial = this.getDiskSerial();

    // MAC Address
    info.macAddress = this.getMacAddress();

    return info;
  }

  /**
   * Holt MAC Address
   */
  getMacAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.mac;
        }
      }
    }
    return 'unknown';
  }

  /**
   * Holt Disk Serial Number (simplified)
   */
  getDiskSerial() {
    // In einer echten Implementierung würde man
    // Platform-spezifische Commands verwenden
    return 'SSD-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * Generiert HWID aus Systemdaten
   */
  generateHWID() {
    const systemInfo = this.gatherSystemInfo();

    // Kombiniere alle Hardware-Informationen
    const hwData = `${systemInfo.cpuModel}-${systemInfo.cpuCores}-${systemInfo.totalMemory}-${systemInfo.diskSerial}-${systemInfo.macAddress}-${systemInfo.platform}-${systemInfo.osRelease}`;

    // Erstelle SHA-256 Hash
    this.hwid = crypto
      .createHash('sha256')
      .update(hwData)
      .digest('hex')
      .toUpperCase();

    this.saveConfig();
    return this.hwid;
  }

  /**
   * Login zum System
   */
  async login(username, password) {
    try {
      const response = await axios.post(`${this.apiUrl}/auth/login`, {
        username,
        password
      });

      this.token = response.data.token;
      this.saveConfig();

      return {
        success: true,
        user: response.data.user,
        token: this.token
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Aktiviert eine Lizenz
   */
  async activateLicense(licenseKey) {
    if (!this.hwid) {
      this.generateHWID();
    }

    if (!this.token) {
      return {
        success: false,
        error: 'Not logged in. Please login first.'
      };
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/api/license/activate`,
        {
          license_key: licenseKey,
          hwid: this.hwid
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }
      );

      return {
        success: true,
        license: response.data.license
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Verifiziert HWID
   */
  async verifyHWID() {
    if (!this.hwid) {
      this.generateHWID();
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/api/hwid/verify`,
        { hwid: this.hwid },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }
      );

      return {
        success: true,
        verified: response.data.verified
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Holt alle registrierten HWIDs
   */
  async getMyHWIDs() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/hwid/list`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }
      );

      return {
        success: true,
        hwids: response.data.hwids
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Zeigt HWID Information
   */
  showHWIDInfo() {
    const info = this.gatherSystemInfo();

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║          System Hardware Information                  ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log(`║ CPU Model:         ${info.cpuModel.padEnd(35)} ║`);
    console.log(`║ CPU Cores:         ${info.cpuCores.toString().padEnd(35)} ║`);
    console.log(`║ Total Memory:      ${(info.totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB${' '.repeat(30)} ║`);
    console.log(`║ Platform:          ${info.platform.padEnd(35)} ║`);
    console.log(`║ OS Release:        ${info.osRelease.padEnd(35)} ║`);
    console.log(`║ Architecture:      ${info.arch.padEnd(35)} ║`);
    console.log(`║ Hostname:          ${info.hostname.padEnd(35)} ║`);
    console.log(`║ MAC Address:       ${info.macAddress.padEnd(35)} ║`);
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log(`║ HWID: ${this.hwid || 'Not generated yet'}${' '.repeat(50 - (this.hwid?.length || 18))} ║`);
    console.log('╚═══════════════════════════════════════════════════════╝\n');
  }
}

// Interactive CLI
async function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const client = new FocusHubClient();

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║     FocusHub Client - License Manager                 ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const prompt = (question) => new Promise(resolve => rl.question(question, resolve));

  let running = true;

  while (running) {
    console.log('\nOptions:');
    console.log('1. Generate HWID');
    console.log('2. Show System Info');
    console.log('3. Login');
    console.log('4. Activate License');
    console.log('5. Verify HWID');
    console.log('6. Show My HWIDs');
    console.log('7. Exit\n');

    const choice = await prompt('Select option (1-7): ');

    switch (choice) {
      case '1': {
        const hwid = client.generateHWID();
        console.log('\n✅ HWID Generated:');
        console.log(`   ${hwid}\n`);
        break;
      }

      case '2': {
        client.showHWIDInfo();
        break;
      }

      case '3': {
        const username = await prompt('Username: ');
        const password = await prompt('Password: ');
        const result = await client.login(username, password);

        if (result.success) {
          console.log(`\n✅ Logged in as ${result.user.username}`);
        } else {
          console.log(`\n❌ Login failed: ${result.error}`);
        }
        break;
      }

      case '4': {
        if (!client.token) {
          console.log('\n❌ Please login first');
          break;
        }

        const key = await prompt('License Key: ');
        const result = await client.activateLicense(key);

        if (result.success) {
          console.log('\n✅ License Activated!');
          console.log(`   Product: ${result.license.product}`);
          console.log(`   Expires: ${result.license.expires_at || 'Never'}`);
        } else {
          console.log(`\n❌ Activation failed: ${result.error}`);
        }
        break;
      }

      case '5': {
        if (!client.token) {
          console.log('\n❌ Please login first');
          break;
        }

        const result = await client.verifyHWID();
        if (result.success) {
          console.log('\n✅ HWID Verified!');
        } else {
          console.log(`\n❌ Verification failed: ${result.error}`);
        }
        break;
      }

      case '6': {
        if (!client.token) {
          console.log('\n❌ Please login first');
          break;
        }

        const result = await client.getMyHWIDs();
        if (result.success) {
          console.log('\n📋 Your HWIDs:');
          result.hwids.forEach((h, i) => {
            console.log(`   ${i + 1}. ${h.hwid} (${h.verified ? '✓ Verified' : '⚠ Pending'})`);
          });
        } else {
          console.log(`\n❌ Failed: ${result.error}`);
        }
        break;
      }

      case '7': {
        running = false;
        break;
      }

      default:
        console.log('Invalid option');
    }
  }

  rl.close();
  console.log('\nGoodbye! 👋\n');
}

// Export für externe Nutzung
module.exports = FocusHubClient;

// Starte CLI wenn direkt aufgerufen
if (require.main === module) {
  main().catch(console.error);
}
