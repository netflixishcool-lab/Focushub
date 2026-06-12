import express from 'express';
import LicenseKey from '../models/LicenseKey.js';
import User from '../models/User.js';
import RobloxScript from '../models/RobloxScript.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/generate', protect, adminOnly, async (req, res) => {
  try {
    const { count = 1, duration = 30, notes } = req.body;

    if (count > 1000) {
      return res.status(400).json({ message: 'Max 1000 Keys' });
    }

    const keys = [];
    for (let i = 0; i < count; i++) {
      const key = await LicenseKey.create({
        duration,
        createdBy: req.user._id,
        notes,
        expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      });
      keys.push(key);
    }

    res.status(201).json({
      message: `${count} Keys erstellt`,
      keys
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/redeem', async (req, res) => {
  try {
    const { key, discordId, discordTag } = req.body;

    if (!key || !discordId) {
      return res.status(400).json({ message: 'Key und Discord ID erforderlich' });
    }

    const licenseKey = await LicenseKey.findOne({ key });

    if (!licenseKey) {
      return res.status(404).json({ message: 'Key nicht gefunden' });
    }

    if (licenseKey.isRedeemed) {
      return res.status(400).json({ message: 'Key bereits verwendet' });
    }

    if (new Date() > licenseKey.expiresAt) {
      return res.status(400).json({ message: 'Key abgelaufen' });
    }

    // Nur Key redeemen, KEINE User erstellen
    licenseKey.isRedeemed = true;
    licenseKey.redeemedAt = new Date();
    await licenseKey.save();

    // Generiere Roblox Script als vorbefüllten Loader (FocusHub)
    const scriptKey = key;

    // Direktes Inline-Script (zuverlässiger als HttpGet auf localhost)
    const scriptContent = `-- FocusHub Script Loader
print("\\n=== FocusHub Script Geladen ===")
print("Script Key: ${scriptKey}")
print("Hallo hier ist FocusHub")
print("================================\\n")

-- Zeige GUI Notification in Roblox
local success, err = pcall(function()
  game:GetService("StarterGui"):SetCore("SendNotification", {
    Title = "✓ FocusHub",
    Text = "Hallo hier ist FocusHub - Script erfolgreich geladen!",
    Duration = 5
  })
end)

if not success then
  print("Notification Error: " .. tostring(err))
end

print("Script erfolgreich ausgeführt!")`;

    const robloxScript = await RobloxScript.create({
      scriptKey,
      licenseKey: licenseKey._id,
      user: null,
      hwid: null,
      discordId,
      discordTag,
      scriptContent,
      expiresAt: licenseKey.expiresAt
    });

    res.json({
      message: 'Key erfolgreich eingelöst. Kopiere den Script in Roblox!',
      discordId,
      discordTag,
      script: {
        scriptKey,
        scriptContent
      },
      expiresAt: licenseKey.expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/list', protect, adminOnly, async (req, res) => {
  try {
    const keys = await LicenseKey.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    // Für jeden Key, wenn er redeemed ist, die Discord Info vom RobloxScript holen
    const enrichedKeys = await Promise.all(
      keys.map(async (key) => {
        const keyObj = key.toObject();
        if (keyObj.isRedeemed) {
          const script = await RobloxScript.findOne({ scriptKey: keyObj.key });
          if (script) {
            keyObj.discordId = script.discordId;
            keyObj.discordTag = script.discordTag;
            keyObj.hwid = script.hwid || null;
            keyObj.hwidSet = !!script.hwid;
            keyObj.usageCount = script.usageCount;
            keyObj.lastUsed = script.lastUsed;
          }
        }
        return keyObj;
      })
    );

    res.json({ keys: enrichedKeys });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lösche einen Key (Admin) - revoked auch Discord User
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const key = await LicenseKey.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ message: 'Key nicht gefunden' });
    }

    // Wenn Key redeemed ist, lösche RobloxScript und Discord User
    if (key.isRedeemed) {
      const script = await RobloxScript.findOne({ scriptKey: key.key });
      if (script) {
        const discordId = script.discordId;
        
        // Lösche RobloxScript
        await RobloxScript.deleteOne({ _id: script._id });
        
        // Lösche Discord User wenn vorhanden
        if (discordId) {
          await User.deleteOne({ discordId });
        }
      }
    }

    // Lösche den Key
    await LicenseKey.findByIdAndDelete(req.params.id);

    res.json({ message: 'Key und Discord User gelöscht' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HWID registrieren / verifizieren wenn Script ausgeführt wird
router.post('/script/register-hwid', async (req, res) => {
  try {
    const { scriptKey, hwid } = req.body;

    if (!scriptKey || !hwid) {
      return res.status(400).json({ message: 'scriptKey und hwid erforderlich' });
    }

    const robloxScript = await RobloxScript.findOne({ scriptKey });

    if (!robloxScript) {
      return res.status(404).json({ message: 'Script nicht gefunden' });
    }

    if (!robloxScript.isActive) {
      return res.status(403).json({ message: 'Script deaktiviert' });
    }

    if (robloxScript.expiresAt && new Date() > robloxScript.expiresAt) {
      return res.status(410).json({ message: 'Script abgelaufen' });
    }

    // HWID-Locking: Wenn bereits eine HWID gesetzt ist, nur gleiche erlauben
    if (robloxScript.hwid && robloxScript.hwid !== hwid) {
      return res.status(403).json({ message: 'HWID gesperrt - anderes Gerät' });
    }

    robloxScript.hwid = hwid;
    robloxScript.lastUsed = new Date();
    robloxScript.usageCount += 1;
    await robloxScript.save();

    res.json({ success: true, message: 'HWID verifiziert' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: HWID eines Scripts zurücksetzen
router.post('/script/reset-hwid', protect, adminOnly, async (req, res) => {
  try {
    const { scriptKey } = req.body;

    if (!scriptKey) {
      return res.status(400).json({ message: 'scriptKey erforderlich' });
    }

    const robloxScript = await RobloxScript.findOne({ scriptKey });

    if (!robloxScript) {
      return res.status(404).json({ message: 'Script nicht gefunden' });
    }

    robloxScript.hwid = null;
    await robloxScript.save();

    res.json({ message: 'HWID zurückgesetzt' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Alle aktiven Lizenzen (RobloxScripts) abrufen
router.get('/active-licenses', protect, adminOnly, async (req, res) => {
  try {
    const licenses = await RobloxScript.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.json({
      licenses: licenses.map(s => ({
        _id: s._id,
        scriptKey: s.scriptKey,
        discordId: s.discordId,
        discordTag: s.discordTag,
        hwid: s.hwid ? s.hwid.substring(0, 12) + '...' : null,
        hwidFull: s.hwid,
        isActive: s.isActive,
        expiresAt: s.expiresAt,
        usageCount: s.usageCount,
        lastUsed: s.lastUsed,
        createdAt: s.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Roblox Script abrufen
router.get('/script/:scriptKey', async (req, res) => {
  try {
    const { scriptKey } = req.params;

    const robloxScript = await RobloxScript.findOne({ scriptKey, isActive: true });

    if (!robloxScript) {
      return res.status(404).json({ message: 'Script nicht gefunden' });
    }

    // Prüfe ob Script abgelaufen ist
    if (robloxScript.expiresAt && new Date() > robloxScript.expiresAt) {
      return res.status(403).json({ message: 'Script abgelaufen' });
    }

    // Update last used
    robloxScript.lastUsed = new Date();
    robloxScript.usageCount += 1;
    await robloxScript.save();

    res.json({
      success: true,
      script: robloxScript.scriptContent,
      expiresAt: robloxScript.expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Meine Scripts abrufen (für Roblox User)
router.get('/my-scripts', protect, async (req, res) => {
  try {
    const scripts = await RobloxScript.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      scripts: scripts.map(s => ({
        scriptKey: s.scriptKey,
        hwid: s.hwid,
        discordId: s.discordId,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        isActive: s.isActive,
        usageCount: s.usageCount,
        lastUsed: s.lastUsed
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;