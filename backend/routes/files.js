import express from 'express';

const router = express.Router();

// GET: Roblox Loader Script - lädt das Script basierend auf Script Key
router.get('/loader.lua', (req, res) => {
  try {
    const scriptKey = req.query.key || '';
    
    // Einfacher Test-Script der "Hallo hier ist FocusHub" ausgibt
    const luaScript = `-- FocusHub Roblox Loader
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

print("Script erfolgreich ausgeführt!")
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="loader.lua"');
    res.send(luaScript);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
