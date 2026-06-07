# ⚡ Quick Start - FocusHub Admin Panel

## 🌍 MongoDB Cloud - KOSTENLOS!

### MongoDB Atlas (Kostenlos, einfach, beste Option)

**Preis**: 100% KOSTENLOS (10GB Speicher, mehr als genug!)

#### Schritt 1: Konto erstellen
1. Gehe zu https://www.mongodb.com/cloud/atlas
2. Klicke "Try Free"
3. Registriere dich (Email + Passwort)
4. Verifiziere deine Email

#### Schritt 2: Cluster erstellen
1. Nach Login klicke "Create a Deployment"
2. Wähle "M0" (Kostenlos) ✅
3. Wähle Region: z.B. "Frankfurt" (Europe)
4. Klicke "Create Cluster"
5. Warte ~3-5 Minuten (bekommt grünen Haken)

#### Schritt 3: Connection String
1. Klicke "Connect" Button
2. Wähle "Connect your application"
3. Wähle "Node.js" und neueste Version
4. Kopiere den Connection String:
```
mongodb+srv://username:password@cluster.mongodb.net/luarmor-admin
```

5. Ersetze:
   - `username` → Dein Benutzername
   - `password` → Dein Passwort
   - `focushub-admin` → Lass so

#### Schritt 4: In .env eintragen
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/luarmor-admin
```

**Fertig!** Deine Cloud-DB läuft! ☁️

---

## 📋 Alternativen (auch kostenlos)

| Service | Preis | Speicher | Link |
|---------|-------|----------|------|
| **MongoDB Atlas** | KOSTENLOS | 10GB | https://mongodb.com/cloud/atlas |
| Firebase/Firestore | KOSTENLOS | 1GB | https://firebase.google.com |
| AWS DynamoDB | KOSTENLOS Tier | 25GB | https://aws.amazon.com |
| Heroku + Add-ons | KOSTENLOS | 5GB | https://heroku.com |

**Empfehlung**: MongoDB Atlas ist die beste für dieses Projekt!

---

## 🚀 Projekt starten (3 einfache Schritte)

### Schritt 1: Setup ausführen
```bash
cd d:\Datenbank\luarmor-clone

# Automatisches Setup
.\setup.bat

# Oder manuell:
npm install
cd frontend && npm install && cd ..
```

### Schritt 2: .env konfigurieren
```env
# Öffne: d:\Datenbank\luarmor-clone\.env

MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/focushub-admin
JWT_SECRET=super_geheim_32_zeichen_minimum
ENCRYPTION_KEY=genau32characterslangsicherkey
DISCORD_BOT_TOKEN=dein_discord_token
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Schritt 3: 3 Terminal öffnen und starten

**Terminal 1 - Backend:**
```bash
cd d:\Datenbank\luarmor-clone
npm run dev
```

**Terminal 2 - Discord Bot:**
```bash
cd d:\Datenbank\luarmor-clone
npm run discord
```

**Terminal 3 - Frontend:**
```bash
cd d:\Datenbank\luarmor-clone\frontend
npm start
```

---

## 🔐 Discord Bot schnell Setup

1. Gehe zu: https://discord.com/developers/applications
2. Klicke "New Application"
3. Name eingeben (z.B. "Luarmor Bot")
4. Gehe zu "Bot" Seite
5. Klicke "Add Bot"
6. Unter "TOKEN" → "Copy" → In .env eintragen als `DISCORD_BOT_TOKEN`

**Fertig!** 🎯

---

## ✅ URLs nach Start

- **Admin Panel**: http://localhost:3000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 🎮 Erstes Testen

### 1. Admin Account erstellen
- Gehe zu http://localhost:3000
- Klicke "Registrieren"
- Email: `admin@example.com`
- Username: `admin`
- Passwort: min. 8 Zeichen
- Registrieren klicken

### 2. Admin machen
```bash
# Neues Terminal:
node
```

Dann einfach kopieren und einfügen:
```javascript
const mongoose = require('mongoose');
const User = require('./backend/models/User').default;

mongoose.connect('mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/luarmor-admin');

User.updateOne(
  { email: 'admin@example.com' },
  { isAdmin: true }
).then(() => {
  console.log('✓ Admin erstellt!');
  process.exit();
});
```

### 3. Admin Panel testen
- Melden Sie sich an
- Sie sollten Dashboard sehen
- Gehen Sie zu "Key Management"
- Erstellen Sie 5 Test Keys
- Kopieren Sie einen Key

### 4. Discord Bot testen
- Im Discord: `!info`
- Bot sollte Befehle anzeigen
- `!redeem COPIED_KEY` versuchen
- Bot sollte Erfolg zeigen

---

## 🆘 Häufige Fehler

### ❌ "Cannot find module 'express'"
```bash
npm install
```

### ❌ "MongoDB connection failed"
**Ursache**: Falsche Connection String
**Lösung**: 
1. Gehe zu MongoDB Atlas
2. Kopiere Connection String neu
3. Ersetze username/password
4. In .env eintragen

### ❌ "Discord Bot token invalid"
1. Gehe zu https://discord.com/developers
2. Wähle App
3. Gehe zu "Bot"
4. Klick "Reset Token"
5. Kopiere neuen Token

### ❌ "Frontend verbindet nicht"
1. Öffne Chrome DevTools (F12)
2. Gehe zu "Console"
3. Suche nach Fehlern
4. Stelle sicher, dass Backend läuft: `curl http://localhost:5000/api/health`

---

## 💡 Pro-Tipps

### Alle Terminal Befehle in einem:
```bash
npm run dev-all  # Backend + Bot zusammen
```

Dann nur noch Frontend Terminal:
```bash
cd frontend && npm start
```

### Keys schnell erstellen
Im Admin Panel:
- Anzahl: 100
- Typ: PREMIUM
- Dauer: 30 Tage
- "Keys generieren" klicken

### Benutzer sehen
Admin Panel → Benutzerverwaltung:
- Alle eingelösten Keys
- Discord Info
- Lizenz-Status
- Bannen/Freigeben

---

## 📞 Support

Bei Fehlern:
1. Lese SETUP_GUIDE.md
2. Schaue API.md
3. Check HWID_GUIDE.md

Viel Spaß! 🎉
