# Setup Guide - FocusHub Admin Panel

## Schritt-für-Schritt Installation

### Voraussetzungen

- Node.js >= 16.0.0 (https://nodejs.org)
- npm (kommt mit Node.js)
- MongoDB lokal ODER MongoDB Atlas (kostenlos)
- Discord Bot Token
- VS Code oder Editor

### Schritt 1: Repository Setup

```bash
# Navigiere zum Projektverzeichnis
cd d:\Datenbank

# Erstelle .env Datei
copy .env.example .env
```

### Schritt 2: .env konfigurieren

Öffne `d:\Datenbank\.env` und füllefolgende Werte:

```env
# === MONGODB ===
# Für lokal:
MONGODB_URI=mongodb://localhost:27017/focushub-admin

# Für Atlas Cloud:
# 1. Gehe zu https://www.mongodb.com/cloud/atlas
# 2. Erstelle Cluster
# 3. Kopiere Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/focushub-admin

# === JWT & ENCRYPTION ===
# WICHTIG: Ändern Sie diese Werte!
# Generieren Sie: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_32_characters_minimum
ENCRYPTION_KEY=your32characterencryptionkey1234
JWT_EXPIRE=7d

# === SERVER ===
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# === DISCORD BOT ===
# 1. Gehe zu https://discord.com/developers/applications
# 2. Erstelle neue Application
# 3. Gehe zu "Bot" Seite
# 4. Klicke "Add Bot"
# 5. Kopiere Token unter "TOKEN"
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE

# 6. Bekommst du durch /getguildid im Discord
DISCORD_GUILD_ID=YOUR_GUILD_ID_HERE
```

### Schritt 3: Discord Bot Setup

1. Gehen Sie zu https://discord.com/developers/applications
2. Klicken Sie "New Application"
3. Namen eingeben z.B. "FocusHub Bot"
4. Gehen Sie zu "Bot" Seite
5. Klicken Sie "Add Bot"
6. Unter "TOKEN" klicken Sie "Copy"
7. Setzen Sie den Token in .env als `DISCORD_BOT_TOKEN`

#### Bot Permissions

1. Gehen Sie zu OAuth2 > URL Generator
2. Wählen Sie diese Scopes:
   - bot
   - applications.commands

3. Wählen Sie diese Permissions:
   - Send Messages
   - Read Message History
   - Attach Files

4. Kopieren Sie die generierte URL
5. Öffnen Sie sie im Browser
6. Wählen Sie Ihren Discord Server
7. Autorisieren Sie den Bot

#### Gateway Intents

1. Gehen Sie zum Bot
2. Scrolle down zu "GATEWAY INTENTS"
3. Aktivieren Sie:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent

### Schritt 4: MongoDB Setup

#### Option A: Lokal

**Windows:**
```bash
# Download: https://www.mongodb.com/try/download/community
# Führen Sie Installer aus
# Starten Sie MongoDB:
net start MongoDB
```

**Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Gehen Sie zu https://www.mongodb.com/cloud/atlas
2. Erstellen Sie kostenloses Konto
3. "Create Organization" > "Create Project"
4. "Create Cluster" (kostenlos M0)
5. Warten Sie auf Cluster Creation
6. "Connect" Button
7. Wählen Sie "Connect your application"
8. Wählen Sie "Node.js" und neueste Version
9. Kopieren Sie Connection String
10. Fügen Sie ihn in .env ein als MONGODB_URI

### Schritt 5: Dependencies installieren

```bash
cd d:\Datenbank

# Backend Dependencies
npm install

# Frontend Dependencies
cd frontend
npm install
cd ..
```

### Schritt 6: Backend starten

```bash
# Terminal 1
cd d:\Datenbank
npm run dev

# Sollte anzeigen:
# ✓ MongoDB verbunden
# 🚀 Server auf Port 5000
```

### Schritt 7: Discord Bot starten

```bash
# Terminal 2
cd d:\Datenbank
npm run discord

# Sollte anzeigen:
# ✓ Discord Bot eingeloggt als BotName#1234
```

### Schritt 8: Frontend starten

```bash
# Terminal 3
cd d:\Datenbank\frontend
npm start

# Öffnet automatisch http://localhost:3000
```

### Schritt 9: Admin Account erstellen

1. Öffnen Sie http://localhost:3000
2. Klicken Sie "Registrieren"
3. Füllen Sie aus:
   - Username: `admin`
   - Email: `admin@example.com`
   - Passwort: Mindestens 8 Zeichen
4. Registrieren

### Schritt 10: Account zu Admin machen

```bash
# Terminal 4 - Neues Terminal
node

# Dann:
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/focushub-admin');
const User = require('./backend/models/User').default;

User.updateOne(
  { email: 'admin@example.com' },
  { isAdmin: true }
).then(() => {
  console.log('Admin Account erstellt!');
  process.exit();
}).catch(err => {
  console.error('Fehler:', err);
  process.exit(1);
});
```

### Schritt 11: Alles testen

#### Test 1: Admin Panel
1. http://localhost:3000
2. Melden Sie sich an mit admin@example.com
3. Sie sollten Dashboard sehen

#### Test 2: Keys erstellen
1. Gehen Sie zu "Key Management"
2. Geben Sie ein: Anzahl: 5
3. Klicken Sie "Keys generieren"
4. 5 neue Keys sollten erscheinen

#### Test 3: Discord Bot
1. Öffnen Sie Ihren Discord Server
2. Schreiben Sie: `!info`
3. Bot sollte Befehle auflisten

#### Test 4: Key einlösen
1. Kopieren Sie einen Key von Admin Panel
2. Im Discord schreiben: `!redeem COPIED_KEY`
3. Bot sollte Erfolgs-Nachricht geben

## 🚦 Troubleshooting

### Error: "Cannot find module 'express'"
```bash
npm install
```

### Error: "MongoDB connection failed"
```bash
# Prüfen Sie ob MongoDB läuft
mongo
# oder für neuer:
mongosh
```

### Error: "Discord Bot token invalid"
- Gehen Sie zu https://discord.com/developers
- Wählen Sie Ihre Application
- Gehen Sie zu Bot
- Klicken Sie "Reset Token"
- Kopieren Sie den neuen Token
- Setzen Sie ihn in .env

### Error: "Frontend zeigt Fehler"
- Öffnen Sie Chrome DevTools (F12)
- Gehen Sie zu "Console"
- Suchen Sie nach Fehlermeldungen
- Überprüfen Sie dass Backend auf localhost:5000 läuft

## 🚳 Alle Terminal Befehle

```bash
# Terminal 1 - Backend
cd d:\Datenbank
npm run dev

# Terminal 2 - Discord Bot
cd d:\Datenbank
npm run discord

# Terminal 3 - Frontend
cd d:\Datenbank\frontend
npm start
```

## 🔗 URLs

- Admin Panel: http://localhost:3000
- API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## 🎧 Weitere Kommandobefehle

```bash
# Alle zusammen in einer Zeile starten (mit npm-run-all):
npm run dev-all

# Nur Backend Test
curl http://localhost:5000/api/health

# MongoDB direkt verbinden
mongosh "mongodb://localhost:27017/focushub-admin"

# Admin Passwort ändern
node
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('newpassword123', 10);
console.log(hash);
```

## ✅ Fertig!

Viel Spaß mit Ihrem FocusHub Admin Panel!
