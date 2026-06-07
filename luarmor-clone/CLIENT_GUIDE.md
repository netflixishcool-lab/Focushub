# Luarmor Client Library

Client-seitiger Code zum Generieren von HWID und Aktivieren von Lizenzen.

## Installation

```javascript
const HWIDGenerator = require('../backend/hwid-generator');
const os = require('os');
const crypto = require('crypto');
```

## Verwendung

### HWID generieren

```javascript
// Sammle Systeminformationen
const systemInfo = {
  cpuModel: os.cpus()[0].model,
  cpuCores: os.cpus().length,
  totalMemory: os.totalmem(),
  diskSerialNumber: 'SSD123456',  // Muss durch echte Serial Number ersetzt werden
  macAddress: 'AA:BB:CC:DD:EE:FF', // Muss durch echte MAC Address ersetzt werden
  osType: os.type(),
  osRelease: os.release()
};

// Generiere HWID
const hwid = HWIDGenerator.generateHWID(systemInfo);
console.log('Your HWID:', hwid);
```

### License aktivieren

```javascript
const axios = require('axios');

async function activateLicense(licenseKey, hwid) {
  try {
    const response = await axios.post('http://localhost:5000/api/license/activate', {
      license_key: licenseKey,
      hwid: hwid
    }, {
      headers: {
        'Authorization': `Bearer YOUR_JWT_TOKEN`
      }
    });

    console.log('License activated:', response.data);
  } catch (error) {
    console.error('Activation failed:', error.response.data);
  }
}
```

## Windows HWID Gathering

Für Windows können diese PowerShell Befehle verwendet werden:

```powershell
# CPU Model
Get-WmiObject -Class Win32_Processor | Select-Object -ExpandProperty Name

# Disk Serial Number
Get-WmiObject -Class Win32_PhysicalMedia | Select-Object -ExpandProperty SerialNumber

# MAC Address
Get-NetAdapter | Select-Object -ExpandProperty MacAddress
```

## Linux HWID Gathering

```bash
# CPU Model
cat /proc/cpuinfo | grep "model name" | head -1

# Disk Serial
sudo hdparm -I /dev/sda | grep "Serial"

# MAC Address
cat /sys/class/net/eth0/address
```

## macOS HWID Gathering

```bash
# CPU Model
sysctl -a | grep machdep.cpu.brand_string

# Disk Serial
diskutil info / | grep "Device / Media Name"

# MAC Address
ifconfig en0 | grep "lladdr"
```
