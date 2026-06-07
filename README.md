# 🛡️ FocusHub - Developer Admin Panel

Ein professionelles, sicheres Admin Panel System ähnlich wie FocusHub mit HWID-Speicherung, Key-System, Discord Bot Support und AES-256 Verschlüsselung.

## ✨ Features

- **JWT Authentifizierung**: Sichere Token-basierte Authentifizierung
- **AES-256 Verschlüsselung**: Alle sensitiven Daten sind verschlüsselt
- **HWID Verifizierung**: Hardware ID Hashing mit SHA-256
- **Key Management**: Generierung, Einlösung und Verwaltung
- **Discord Bot Integration**: Mit Befehlen für Key-Einlösung
- **Admin Panel**: Modernes React UI
- **Rate Limiting**: Schutz vor Attacken
- **MongoDB Database**: Persistente Speicherung
- **Ban/Unban System**: Benutzerverwaltung

## 🚀 Quick Start

```bash
cd d:\Datenbank

# Dependencies installieren
npm install

# .env konfigurieren
copy .env.example .env
# Bearbeite .env mit deinen Werten

# Backend starten
npm run dev

# In neuem Terminal: Discord Bot
npm run discord

# In neuem Terminal: Frontend
cd frontend && npm install && npm start
```

Zugriff auf: http://localhost:3000

## 🔐 Sicherheit

- AES-256 Verschlüsselung für Benutzerdaten
- SHA-256 HWID Hashing (One-Way)
- Bcrypt für Passwörter (10 Salt-Runden)
- JWT Token mit Verfallszeit
- Rate Limiting: 100 Anfragen/15min
- CORS und Helmet Security Headers

## 📚 Dokumentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailliertes Setup
- [API.md](./API.md) - API Referenz
- [HWID_GUIDE.md](./HWID_GUIDE.md) - HWID Integration

## 🎮 Discord Bot Befehle

- `!redeem <key>` - Key einlösen
- `!status` - System Status
- `!myinfo` - Account Informationen
- `!info` - Hilfe

## 📊 Admin Panel

- Dashboard mit Statistiken
- Key Management & Generierung
- Benutzerverwaltung
- Ban/Unban Funktionen
- Real-time Analytics

## 💾 Datenbank

- MongoDB Local oder Atlas
- User Model
- LicenseKey Model
- HWID Model

## 🛠️ Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Tailwind CSS
- **Bot**: Discord.js
- **Database**: MongoDB
- **Security**: Bcrypt, JWT, CryptoJS

## 📝 Lizenz

MIT License