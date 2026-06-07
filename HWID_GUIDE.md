# HWID Integration Guide

## Was ist HWID?

Hardware ID (HWID) ist eine eindeutige Kennung für ein Computer-System. Sie wird verwendet um:
- Lizenzschlüssel an bestimmte Geräte zu binden
- Mehrfachverschlüsselung zu verhindern
- Benutzer zu verifizieren

## Sicherheit

### Wie es funktioniert

1. **Client**: Generiert HWID basierend auf Hardware
2. **SHA-256 Hashing**: HWID wird gehasht (One-Way)
3. **Speicherung**: Nur der Hash wird in der Datenbank gespeichert
4. **Verifizierung**: Beim nächsten Login wird der neue HWID gehasht und verglichen

```
Original HWID: "ABC123XYZ789DEF"
           |
           v
     SHA-256 Hash
           |
           v
Hash: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

### Sichere Hardware-Komponenten kombinieren

**WICHTIG**: Verwenden Sie nicht nur eine Hardware-Komponente!

Gute Kombinationen:
- CPU Serial + Motherboard Serial + HDD Serial
- MAC Address + CPU Hash + BIOS Serial
- Motherboard ID + Disk Serial + System UUID

**Nicht verwenden**:
- Nur MAC Address (zu einfach zu ändern)
- Nur Festplatten-Seriennummer (kann ausgetauscht werden)
- Nur CPU (CPU-Wechsel = neuer Hash)

## Client-Implementierung

### JavaScript/Node.js

```javascript
const crypto = require('crypto');
const os = require('os');

function generateHWID() {
  // Sammle mehrere Hardware-Informationen
  const cpuInfo = os.cpus()[0].model;
  const networkInterfaces = os.networkInterfaces();
  const macAddress = networkInterfaces.eth0?.[0]?.mac || 'unknown';
  const totalMemory = os.totalmem();
  const platformInfo = os.platform();
  
  // Kombiniere alle Informationen
  const hardwareData = `${cpuInfo}-${macAddress}-${totalMemory}-${platformInfo}`;
  
  // Generiere SHA-256 Hash
  const hwid = crypto.createHash('sha256').update(hardwareData).digest('hex');
  
  return hwid;
}

const myHWID = generateHWID();
console.log('Meine HWID:', myHWID);
```

### Python

```python
import hashlib
import platform
import uuid
import socket

def generate_hwid():
    # Sammle Hardware-Informationen
    machine_id = str(uuid.getnode())  # MAC Address
    processor = platform.processor()
    node = platform.node()  # Computer name
    system = platform.system()
    
    # Kombiniere
    hardware_data = f"{machine_id}-{processor}-{node}-{system}"
    
    # Generiere SHA-256 Hash
    hwid = hashlib.sha256(hardware_data.encode()).hexdigest()
    
    return hwid

my_hwid = generate_hwid()
print(f"Meine HWID: {my_hwid}")
```

### C# / .NET

```csharp
using System;
using System.Management;
using System.Security.Cryptography;
using System.Text;

public class HWIDGenerator
{
    public static string GenerateHWID()
    {
        // CPU Info
        string cpuInfo = GetCPUSerialNumber();
        
        // Motherboard Info
        string motherboardInfo = GetMotherboardSerialNumber();
        
        // Disk Info
        string diskInfo = GetDiskSerialNumber();
        
        // Kombiniere
        string hardwareData = $"{cpuInfo}-{motherboardInfo}-{diskInfo}";
        
        // SHA-256 Hash
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(hardwareData));
            return Convert.ToHexString(hashedBytes);
        }
    }
    
    private static string GetCPUSerialNumber()
    {
        ManagementClass mc = new ManagementClass("Win32_Processor");
        ManagementObjectCollection moc = mc.GetInstances();
        
        foreach (ManagementObject mo in moc)
        {
            return mo.Properties["ProcessorId"].Value.ToString();
        }
        return "unknown";
    }
    
    private static string GetMotherboardSerialNumber()
    {
        ManagementClass mc = new ManagementClass("Win32_BaseBoard");
        ManagementObjectCollection moc = mc.GetInstances();
        
        foreach (ManagementObject mo in moc)
        {
            return mo.Properties["SerialNumber"].Value.ToString();
        }
        return "unknown";
    }
    
    private static string GetDiskSerialNumber()
    {
        ManagementClass mc = new ManagementClass("Win32_PhysicalMedia");
        ManagementObjectCollection moc = mc.GetInstances();
        
        foreach (ManagementObject mo in moc)
        {
            return mo.Properties["SerialNumber"].Value.ToString();
        }
        return "unknown";
    }
}
```

## API Nutzung

### 1. HWID registrieren

```javascript
// Nach erfolgreichem Login
const token = localStorage.getItem('token');
const hwid = generateHWID(); // Aus obigen Beispielen

const response = await fetch('http://localhost:5000/api/hwid/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    hwid: hwid,
    userAgent: navigator.userAgent
  })
});

const data = await response.json();
console.log('HWID registriert:', data);
```

### 2. HWID verifizieren

```javascript
const token = localStorage.getItem('token');
const currentHWID = generateHWID();

const response = await fetch('http://localhost:5000/api/hwid/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ hwid: currentHWID })
});

if (response.ok) {
  console.log('HWID verifiziert - Account legitim');
} else {
  console.log('HWID nicht korrekt - Zugriff verweigert');
}
```

### 3. HWID Info abrufen

```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/hwid/info', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log('Registrierte HWIDs:', data.hwids);
console.log('Anzahl:', data.count);
```

## Szenarios

### Szenario 1: Erstes Login

```
1. Benutzer registriert sich
2. Benutzer meldet sich an
3. Client generiert HWID
4. HWID wird zum Server gesendet und registriert
5. Login erfolgreich
```

### Szenario 2: Zweites Login (gleicher PC)

```
1. Benutzer meldet sich an
2. Client generiert HWID (gleich wie vorher)
3. HWID wird verifiziert
4. Login erfolgreich
5. lastUsed wird aktualisiert
```

### Szenario 3: Login von anderem PC

```
1. Benutzer meldet sich an
2. Client generiert HWID (ANDERS!)
3. HWID-Verifizierung schlägt fehl
4. 403 Forbidden - Zugriff verweigert
5. Alternative: Admin muss neue HWID freigeben
```

## Best Practices

### ✅ DO

- Kombinieren Sie mehrere Hardware-Komponenten
- Verwenden Sie SHA-256 hashing
- Implementieren Sie Client-seitiges Hashing
- Speichern Sie nur den Hash, nie das Original
- Validieren Sie HWID bei jedem Login
- Protokollieren Sie HWID-Änderungen
- Geben Sie Admins die Möglichkeit, HWIDs freizugeben

### ❌ DON'T

- Verwenden Sie nicht einfach MAC Address allein
- Speichern Sie nicht den Original-HWID
- Verwenden Sie nicht MD5 (SHA-256 verwenden)
- Implementieren Sie keine HWID-Sperre ohne Admin Override
- Vergessen Sie nicht auf Client-seitige Generierung

## Troubleshooting

### "HWID stimmt nicht überein"

**Ursachen**:
- Hardware wurde geändert (neue CPU, Motherboard, etc.)
- Hashing-Algorithmus ist unterschiedlich
- Netzwerk-Adapter geändert

**Lösung**:
- Admin kann neue HWID freigeben
- Implement flexible HWID (z.B. 2 von 3 Hardware-Komponenten)

### "HWID unterschiedlich bei jedem Start"

**Ursache**:
- MAC Address oder andere Hardware-Info ist dynamisch

**Lösung**:
- Verwenden Sie nur stabile Hardware-IDs
- CPU-ID, Motherboard-Serial, Disk-Serial verwenden
- Testen Sie HWID mehrfach

## Advanced: HWID mit 2FA

```javascript
// Kombination aus HWID + Code

function generateHWIDWith2FA() {
  const hwid = generateHWID();
  const timestamp = Math.floor(Date.now() / 30000); // 30 second window
  
  // 2FA Code (z.B. TOTP)
  const secret = '...'; // Aus 2FA Setup
  const code = generateTOTP(secret, timestamp);
  
  return {
    hwid: hwid,
    code: code
  };
}
```

## Weitere Ressourcen

- [Wikipedia: Hardware Identifier](https://en.wikipedia.org/wiki/Hardware_identification)
- [OWASP: Device Fingerprinting](https://owasp.org/www-community/attacks/Device_Fingerprint)
- [SHA-256 Specification](https://en.wikipedia.org/wiki/SHA-2)
