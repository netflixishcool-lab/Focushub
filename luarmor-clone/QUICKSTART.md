# FocusHub - Schnellstart Guide

## 🚀 Installation (Windows)

### Schritt 1: Projekt klonen
```bash
cd d:\Datenbank\luarmor-clone
```

### Schritt 2: Dependencies installieren
Doppelklick auf `install.bat` oder:
```bash
install.bat
```

### Schritt 3: Environment Variablen konfigurieren

#### Backend (.env)
Öffne `backend/.env` und setze (wichtige Felder):

```env
PORT=5000
JWT_SECRET=mein-super-geheimes-jwt-secret-min-32-zeichen
ENCRYPTION_KEY=mein-32-zeichen-verschluesselungsschluessel
DATABASE_PATH=./data/database.db
DISCORD_BOT_TOKEN=dein-discord-bot-token
DISCORD_GUILD_ID=deine-discord-server-id
ADMIN_DISCORD_ID=deine-discord-benutzer-id
NODE_ENV=development
```

#### Discord Bot (.env)
Öffne `discord-bot/.env`:

```env
DISCORD_BOT_TOKEN=dein-discord-bot-token
DISCORD_GUILD_ID=deine-discord-server-id
ADMIN_DISCORD_ID=deine-discord-benutzer-id
API_URL=http://localhost:5000
API_JWT_SECRET=mein-super-geheimes-jwt-secret
```

### Schritt 4: Server starten

Öffne 3 separate PowerShell/CMD Terminal:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Output sollte sein:
```
🚀 Server: http://localhost:5000
🔐 Encryption: AES-256-CBC
🗄️  Database: ./data/database.db
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Öffne dann: http://localhost:5173

**Terminal 3 - Discord Bot:**
```bash
cd discord-bot
npm start
```

## 📝 Erste Schritte

### 1. Admin-Account erstellen

Im Frontend (http://localhost:5173):
- Klick auf "Register"
- Gib ein: `admin` / `admin@example.com` / `admin123456`

### 2. Admin-Rechte geben

In der Backend-Datenbank (SQLite):
```sql
UPDATE users SET is_admin = 1 WHERE username = 'admin';
```

Oder per SQL Client:
```
sqlite3 ./data/database.db
sqlite> UPDATE users SET is_admin = 1 WHERE username = 'admin';
sqlite> .quit
```

### 3. Test-Lizenz erstellen

Nach Login im Frontend:
- Gehe zu "Admin Panel"
- Klick "Create License"
- Gib `TestProduct` ein
- Klick Create

### 4. License aktivieren

Für lokales Testen benötigst du eine HWID. Generiere eine Test-HWID:

```node
// Node.js REPL
const crypto = require('crypto');
const hwid = crypto.randomBytes(32).toString('hex').toUpperCase();
console.log(hwid); // 64-character hex string
```

## 🤖 Discord Bot Commands

Sobald der Bot läuft, nutze diese Commands in Discord:

```
/license create <product> [expires_in_days]
/license activate <key> <hwid>
/license list
/admin stats
/admin users
/ping
```

**Beispiel:**
```
/license create MyScript 30
/admin stats
```

## 🔐 Sicherheit für Produktion

**WICHTIG:** Vor dem Live-Gang:

1. **Neue Schlüssel generieren:**
```bash
# JWT Secret (32+ Zeichen)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key (32 Zeichen)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **HTTPS aktivieren:** Nutze Reverse Proxy (nginx, Cloudflare)

3. **Datenbank sichern:** Regular Backups von `./data/database.db`

4. **Rate Limiting:** Erhöhe Limits in `middleware.js`

5. **Discord Permissions:** Begrenzte Berechtigungen für Bot

## 📊 Admin Panel Features

Nach dem Login mit Admin-Account:

- **Dashboard:** System-Übersicht
- **Admin Panel:** 
  - 📊 Statistiken (User, Keys, HWIDs)
  - 👥 User Management
  - 🔑 License Key Management
  - ➕ Neue Keys erstellen
- **Profile:** Account-Einstellungen

## 🐛 Debugging

### Backend Error: "database.db not found"
```bash
# Manuell erstellen
mkdir backend\data
cd backend
npm start  # Erstellt DB automatisch
```

### Discord Bot: "Token invalid"
- Überprüfe Discord Bot Token in `.env`
- Token muss gültig und nicht abgelaufen sein
- Bot muss auf dem Server sein

### Frontend: "Cannot connect to API"
- Überprüfe ob Backend läuft (http://localhost:5000/health)
- Überprüfe CORS Settings in `backend/server.js`
- Check Browser Console (F12)

## 📚 Wichtige Dateien

- **Backend API:** `backend/server.js`
- **Datenbank Schema:** `backend/database.js`
- **Verschlüsselung:** `backend/encryption.js`
- **HWID Logic:** `backend/hwid-generator.js`
- **Discord Bot:** `discord-bot/bot.js`
- **Frontend:** `frontend/src/App.jsx`

## 🎓 Beispiel-Workflow

1. **User registriert sich** → Frontend Register Form
2. **Admin erstellt License** → Admin Panel
3. **User aktiviert License** → Dashboard mit HWID
4. **Lizenz wird linked** → An User + HWID
5. **System speichert HWID** → Verschlüsselt in DB
6. **Audit Log erstellt** → Alle Aktionen geloggt

## 🔗 Wichtige Links

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **Backend Health:** http://localhost:5000/health
- **Datenbank:** `./backend/data/database.db`

## 💡 Tipps & Tricks

- Nutze Browser DevTools (F12) zur Debugging
- Check `backend/data/database.db` mit SQLite Browser
- Discord Bot Token finde unter Discord Developer Portal
- HWID ist 64 Zeichen Hexadezimal

## ⚠️ Häufige Fehler

| Fehler | Lösung |
|--------|--------|
| Port 5000 bereits in Nutzung | Nutze anderen Port in `.env` |
| Datenbank locked | Starte Backend neu |
| Discord Bot antwortet nicht | Token überprüfen + Bot auf Server einladen |
| CORS Fehler | Überprüfe Frontend URL in `corsMiddleware` |

## 📞 Support

Bei Problemen:
1. Check `backend/server.js` Logs
2. Browser Console (Frontend)
3. Discord Bot Status
4. SQLite Datenbank Status

---

**Genießen Sie FocusHub!** 🚀
