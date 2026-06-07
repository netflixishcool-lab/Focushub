# 🚀 FocusHub Roblox Script System - Quick Start Guide

## Schritt 1: System Starten (3 Terminals)

### Terminal 1: Backend
```bash
cd d:\Datenbank
npm start
```
✓ Wartet auf: "✓ MongoDB verbunden"

### Terminal 2: Discord Bot
```bash
cd d:\Datenbank
npm run discord
```
✓ Wartet auf: "✓ Discord Bot eingeloggt als Focus Hub#XXXX"

### Terminal 3: Frontend
```bash
cd d:\Datenbank\frontend
npm start
```
✓ Wartet auf: "Compiled successfully!"

**Fertig?** → Öffne http://localhost:3000

---

## Schritt 2: Admin-Login

Website: **http://localhost:3000**

- Email: `admin@focushub.com`
- Passwort: `B6A4A7Admin123`

Du solltest das **FocusHub Admin Panel** sehen.

---

## Schritt 3: Erstes Script hochladen

1. **Klick auf "Projects"** im Menü (🎮 Projekt Verwaltung)
2. **Klick "+ Neues Projekt"**
3. **Fülle das Formular aus:**
   - Name: `Mein erstes Script`
   - Kategorie: `Tool`
   - Beschreibung: `Test Script`
   - Script Code: Kopiere einen dieser Beispiele (siehe unten)
4. **Klick "✓ Projekt Speichern"**

Fertig! Das Script ist jetzt hochgeladen ✓

---

## Schritt 4: Keys generieren

1. **Klick "License Keys"** im Menü
2. **Klick "Keys generieren"**
3. **Settings:**
   - Count: `1`
   - Duration: `30` (Tage)
   - Notes: `Test Key`
4. **Klick "Generiere Keys"**

Du siehst jetzt einen **generiert**en Key z.B.: `XXXX-XXXX-XXXX-XXXX`

---

## Schritt 5: In Discord erlösen

1. **Gehe zu Discord** und schreib in den Bot-Channel:
   ```
   /redeem XXXX-XXXX-XXXX-XXXX
   ```

2. **Der Bot antwortet:**
   ```
   ✓ Key erfolgreich eingelöst!
   📝 Benutzer: [Dein Name]
   ⏰ Verfällsdatum: 7.7.2026
   🔗 Script Download: [Link]
   📋 Script Key: abc123...
   ```

3. **Klick den Link oder kopiere die Script-Key**

---

## Schritt 6: Script in Roblox ausführen

### Option A: Direct Link
1. **Klick den Discord-Link** → Script wird angezeigt
2. **Alles kopieren** (Ctrl+A, Ctrl+C)
3. **In Roblox Executor einfügen**
4. **Ausführen** (meist mit F5 oder Execute Button)

### Option B: Script-Key Method
1. **Öffne Roblox Executor**
2. **Füge diesen Code ein:**
   ```lua
   local scriptKey = "abc123xyz" -- Script Key aus Discord
   local scriptContent = game:HttpGet("http://localhost:5000/api/scripts/download/" .. scriptKey)
   loadstring(scriptContent)()
   ```
3. **Ausführen**

---

## 📝 Example Lua Scripts zum Testen

### Beispiel 1: Hello World
```lua
-- FocusHub Test Script
print("✓ FocusHub Script geladen!")
print("✓ Skript erfolgreich ausgeführt!")
```

### Beispiel 2: Player Finder
```lua
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer

print("✓ Spieler-Info:")
print("Name: " .. LocalPlayer.Name)
print("UserID: " .. LocalPlayer.UserId)
print("Aktive Spieler: " .. #Players:GetPlayers())
```

### Beispiel 3: Game Info
```lua
local game = game
print("✓ Game Info:")
print("Name: " .. game.PlaceVersion)
print("PlaceId: " .. game.PlaceId)
print("Universe: " .. game.UniverseId)
```

---

## 🎯 Häufige Fragen

### F: Script lädt nicht herunter?
A: Stelle sicher:
- Backend läuft auf Port 5000 ✓
- Script-Key ist korrekt ✓
- Script ist aktiv (nicht abgelaufen) ✓

### F: Discord Bot antwortet nicht auf /redeem?
A: Überprüfe:
- Discord Bot läuft? ✓
- Bot hat Token? ✓
- Key ist valid? ✓

### F: Projekt wird nicht angezeigt?
A: Überprüfe:
- Du bist Admin? ✓
- Projekt ist öffentlich? ✓
- Frontend lädt API? (F12 → Network)

### F: Executor führt Script nicht aus?
A: Es könnte sein:
- Executor nicht unterstützt
- Script hat Fehler
- Executor ist in der Game nicht aktiv

---

## 🔗 Wichtige URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/api/health |
| Script Download | http://localhost:5000/api/scripts/download/{key} |

---

## 📊 Test Checklist

- [ ] Backend läuft (Port 5000)
- [ ] Discord Bot ist online
- [ ] Frontend zeigt Login
- [ ] Admin-Login funktioniert
- [ ] Projects Seite lädt
- [ ] Script kann hochgeladen werden
- [ ] Key kann generiert werden
- [ ] Discord /redeem funktioniert
- [ ] Script-Download funktioniert
- [ ] Roblox Script führt aus

---

## 💡 Pro-Tipps

1. **Scripts testen bevor hochladen:**
   - Lokal in Executor testen
   - Fehler fixen
   - DANN hochladen

2. **Multiple Versionen:**
   - Pro Script ein Projekt
   - Version in Name: `Aimbot v1.1`

3. **Kategorisieren:**
   - Game: Spiel-Cheats
   - Tool: Utilities
   - Utility: Admin Tools

4. **Key-Management:**
   - Regelmäßig neue Keys generieren
   - Ablaufdaten beachten
   - Ungültige Keys löschen

---

## ⚠️ Wichtig für Production

Diese Anleitung ist für **lokale Tests**!

Für Production brauchst du:
- ✓ SSL/TLS Zertifikat
- ✓ Firewall Konfiguration
- ✓ MongoDB Atlas (Cloud)
- ✓ Discord Bot auf echtem Server
- ✓ Proper Error Logging

---

## 🆘 Support

Fehler? Überprüfe:

1. **Logs anschauen** (Terminal)
2. **Browser Console** (F12)
3. **Network Tab** (F12 → Network)
4. **Process läuft noch?** (Task Manager)

---

**Viel Erfolg! 🚀**

Wenn alles funktioniert → Du hast ein vollständiges Roblox Script Distribution System! 🎉
