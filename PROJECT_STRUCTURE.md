# Projekt Struktur - FocusHub Admin Panel

## 📁 Ordnerübersicht

```
d:\Datenbank\
├── backend/                 # Node.js Backend
│  ├── models/               # Datenbank Schemas
│  │  ├── User.js
│  │  ├── LicenseKey.js
│  │  └── HWID.js
│  ├── routes/               # API Routes
│  │  ├── auth.js
│  │  ├── keys.js
│  │  ├── hwid.js
│  │  ├── users.js
│  │  └── dashboard.js
│  ├── middleware/           # Express Middleware
│  │  ├── auth.js             # JWT Authentifizierung
│  │  └── encryption.js       # AES-256 & Hashing
│  ├── server.js            # Express App
└── discord-bot.js         # Discord.js Bot
├── frontend/               # React Admin Panel
│  ├── src/
│  │  ├── App.js
│  │  ├── index.js
│  │  ├── index.css
│  │  ├── components/
│  │  │  └── Sidebar.js
│  │  └── pages/
│  │     ├── Login.js
│  │     ├── Dashboard.js
│  │     ├── KeyManagement.js
│  │     └── UserManagement.js
│  ├── public/
│  │  └── index.html
│  └── package.json
├── .env                    # Konfiguration (nicht versioniert)
├── .env.example            # Beispiel Konfiguration
├── .gitignore              # Git Ignore Regeln
├── package.json            # Root Dependencies
├── package-lock.json
├── README.md               # Projektübersicht
├── SETUP_GUIDE.md          # Installationsanleitung
├── API.md                  # API Dokumentation
├── HWID_GUIDE.md           # HWID Integration Guide
├── DISCORD_BOT_COMMANDS.md # Bot Befehle
└── PROJECT_STRUCTURE.md   # Diese Datei
```

---

## 📋 DateiÜbersicht

### Backend

#### `backend/server.js`
- Express App Initialisierung
- MongoDB Connection
- Route Registration
- Error Handling

#### `backend/discord-bot.js`
- Discord.js Bot Setup
- Message Handler
- Command Processing
- API Requests

#### `backend/models/`

**User.js**
- Benutzerdaten Schema
- Password Hashing (Bcrypt)
- Token Generation
- Authentifizierung

**LicenseKey.js**
- Key Management
- Redemption Tracking
- Expiry Management

**HWID.js**
- Hardware ID Storage
- User Association
- Activity Logging

#### `backend/routes/`

**auth.js**
- `/register` - Registrierung
- `/login` - Login
- `/me` - Aktuelle Benutzer

**keys.js**
- `/generate` - Keys erstellen (Admin)
- `/redeem` - Key einlösen
- `/list` - Keys auflisten (Admin)

**hwid.js**
- `/register` - HWID registrieren
- `/verify` - HWID verifizieren
- `/info` - HWID Info

**users.js**
- `/all` - Alle Benutzer (Admin)
- `/discord/:id` - Nach Discord ID suchen
- `/:id/license` - Lizenz updaten (Admin)
- `/:id/ban` - Ban/Unban (Admin)

**dashboard.js**
- `/stats` - Statistiken
- `/analytics` - Analytics (Admin)

#### `backend/middleware/`

**auth.js**
- `protect` - JWT Verification
- `adminOnly` - Admin Check

**encryption.js**
- `encryptData()` - AES-256 Encryption
- `decryptData()` - AES-256 Decryption
- `hashHWID()` - SHA-256 Hashing
- `generateApiKey()` - API Key Generator

### Frontend

#### `frontend/src/App.js`
- React Router Setup
- Token Management
- Admin Check
- Authentication

#### `frontend/src/components/`

**Sidebar.js**
- Navigation
- User Info
- Logout Button

#### `frontend/src/pages/`

**Login.js**
- Email/Password Input
- Token Storage
- Error Handling

**Dashboard.js**
- Statistics Display
- Real-time Data
- Charts/Cards

**KeyManagement.js**
- Key Generation Form
- Key List
- Copy Function

**UserManagement.js**
- User Search
- License Updates
- Ban/Unban

---

## 🔁 Datenbankmodelle

### User Schema
```javascript
{
  _id: ObjectId,
  username: String,              // Eindeutig
  email: String,                 // Eindeutig
  password: String,              // Bcrypt gehashed
  discordId: String,             // Optional, eindeutig
  discordTag: String,            // z.B. "user#1234"
  hwid: String,                  // SHA-256 Hash
  licenseKey: ObjectId,          // Referenz zu LicenseKey
  isActive: Boolean,             // Ban status
  isAdmin: Boolean,              // Admin flag
  expiresAt: Date,               // Lizenz Ablauf
  createdAt: Date,               // Erstellungsdatum
  updatedAt: Date                // Letztes Update
}
```

### LicenseKey Schema
```javascript
{
  _id: ObjectId,
  key: String,                   // UUID, eindeutig
  duration: Number,              // Tage
  isRedeemed: Boolean,           // Verwendet?
  redeemedBy: ObjectId,          // User referenz
  redeemedAt: Date,              // Wann eingelöst
  createdBy: ObjectId,           // Admin der erstellt
  createdAt: Date,
  expiresAt: Date,               // Ablaufdatum
  notes: String                  // Admin Notizen
}
```

### HWID Schema
```javascript
{
  _id: ObjectId,
  hwid: String,                  // SHA-256 Hash
  user: ObjectId,                // User referenz
  ipAddress: String,             // Registrierungs IP
  userAgent: String,             // Browser Info
  lastUsed: Date,                // Letzter Login
  isActive: Boolean,             // Aktiv/Deaktiv
  createdAt: Date
}
```

---

## 🔠 Sicherheits-Flow

```
1. USER REGISTRATION
   Email + Password
   |
   v
   Validate Input
   |
   v
   Bcrypt Hash(Password, 10 rounds)
   |
   v
   Save to Database
   |
   v
   Generate JWT Token

2. LOGIN
   Email + Password
   |
   v
   Find User
   |
   v
   Compare Passwords (Bcrypt)
   |
   v
   Check isActive
   |
   v
   Generate JWT Token

3. HWID REGISTRATION
   Client generates HWID from Hardware
   |
   v
   SHA-256 Hash(HWID + ENCRYPTION_KEY)
   |
   v
   Store Hash in Database
   |
   v
   Update User.hwid

4. HWID VERIFICATION
   On Login:
   Client HWID
   |
   v
   SHA-256 Hash(HWID + ENCRYPTION_KEY)
   |
   v
   Compare with Database Hash
   |
   v
   Allow/Deny Access

5. KEY REDEMPTION
   Client: !redeem KEY
   |
   v
   Find Key in Database
   |
   v
   Check if already redeemed
   |
   v
   Check if expired
   |
   v
   Create/Update User
   |
   v
   Mark Key as redeemed
   |
   v
   Send Confirmation
```

---

## 🔄 API Flow

```
CLIENT (Frontend/Discord Bot)
   |
   | HTTP Request
   v
EXPRESS SERVER (port 5000)
   |
   | Rate Limiting Check
   | Helmet Security Headers
   v
ROUTES
   |
   | Authentication Check (protect middleware)
   | Admin Check (adminOnly middleware)
   v
CONTROLLER LOGIC
   |
   | Encryption/Decryption
   | Validation
   v
MONGODB
   |
   | CRUD Operations
   v
RESPONSE
   |
   v
CLIENT
```

---

## 🔗 Komponenten Integration

```
┌─────────────────────────────────────────────────────────┐
│                   ADMIN PANEL (React)                   │
│         http://localhost:3000                           │
└─────────────────────────────────────────────────────────┘
                          |
                          | HTTP/REST
                          v
┌─────────────────────────────────────────────────────────┐
│               EXPRESS BACKEND (Node.js)                │
│               http://localhost:5000                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Auth Route  │  │  Key Route   │  │  HWID Route  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Encryption/Decryption Middleware        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          |
                          | TCP
                          v
┌─────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                     │
│             mongodb://localhost:27017                   │
│                                                          │
│  Collections: Users | LicenseKeys | HWIDs              │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│              DISCORD BOT (Discord.js)                  │
│                                                          │
│  Befehle: !redeem !status !myinfo !info               │
└─────────────────────────────────────────────────────────┘
                          |
                          | HTTP/REST
                          v
               EXPRESS BACKEND (Port 5000)
```

---

## 🔓 Verschlüsselungs-Implementierung

### AES-256 (CryptoJS)
```javascript
Encrypt: CryptoJS.AES.encrypt(data, KEY)
Decrypt: CryptoJS.AES.decrypt(encrypted, KEY)
```

### SHA-256 (CryptoJS)
```javascript
Hash: CryptoJS.SHA256(data)
// One-Way: Kann nicht entschlüsselt werden
```

### Bcrypt (Node.js)
```javascript
Hash: bcrypt.hash(password, 10)
Compare: bcrypt.compare(enteredPassword, hash)
```

### JWT (JsonWebToken)
```javascript
Sign: jwt.sign({ id, username }, SECRET, { expiresIn })
Verify: jwt.verify(token, SECRET)
```

---

## 🚀 Deployment Architektur

```
PRODUKTION:

┌──────────────────────────────────────┐
│         Nginx (Reverse Proxy)        │
│         :80 / :443 (HTTPS)           │
└──────────────────────────────────────┘
                  |
     ┌────────────┴────────────┐
     v                         v
┌──────────────┐        ┌──────────────┐
│  Frontend    │        │  API Server  │
│  (React)     │        │  (Node.js)   │
│  Port: 3000  │        │  Port: 5000  │
└──────────────┘        └──────────────┘
                              |
                              v
                    ┌──────────────────┐
                    │  MongoDB Atlas   │
                    │  (Cloud DB)      │
                    └──────────────────┘
```

---

## 🛀 Development vs Production

| Aspekt | Development | Production |
|--------|-------------|------------|
| Node Env | development | production |
| Database | mongodb://localhost | mongodb+srv://... (Atlas) |
| HTTPS | Nein | Ja (SSL/TLS) |
| Rate Limit | 100/15min | 50/15min |
| Error Details | Vollständig | Generisch |
| Logging | Console | File + Sentry |
| JWT Secret | Demo Value | Stark zufällig |

---

## 📁 Wichtige Umgebungsvariablen

```
MONGODB_URI          Database Connection
JWT_SECRET           Token Signing Key
JWT_EXPIRE           Token Expires in (z.B. 7d)
ENCRYPTION_KEY       AES-256 Key (32 Zeichen)
DISCORD_BOT_TOKEN    Discord Bot Token
PORT                 Server Port (default 5000)
NODE_ENV             Environment (development/production)
FRONTEND_URL         React App URL (für CORS)
```

---

## 🚀 Getting Started Schnell-Referenz

```bash
# 1. Installation
cd d:\Datenbank
npm install
cd frontend && npm install && cd ..

# 2. Environment
copy .env.example .env
# Editiere .env mit Deinen Werten

# 3. Starte alles
# Terminal 1:
npm run dev

# Terminal 2:
npm run discord

# Terminal 3:
cd frontend && npm start
```

---

## 📄 Weitere Dokumentation

- [README.md](./README.md) - Übersicht
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailliertes Setup
- [API.md](./API.md) - API Endpoints
- [HWID_GUIDE.md](./HWID_GUIDE.md) - HWID Integration
- [DISCORD_BOT_COMMANDS.md](./DISCORD_BOT_COMMANDS.md) - Bot Befehle
