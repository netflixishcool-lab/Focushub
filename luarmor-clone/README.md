# FocusHub - Secure License Management System

Ein vollständiges Developer Admin Panel mit HWID-Speicherung, Verschlüsselung, Discord Bot Support und Authentifizierung.

## 🎯 Features

- ✅ **Sichere Authentifizierung** - JWT Token mit Bcrypt Passwort-Hashing
- 🔐 **AES-256 Verschlüsselung** - Alle sensiblen Daten werden verschlüsselt
- 🖥️ **HWID Management** - Hardware-basierte Lizenzverifizierung
- 📋 **Lizenz-Verwaltung** - Erstelle, aktiviere und überwache Lizenzkeys
- 🤖 **Discord Bot** - Verwalte Lizenzen über Discord Slash Commands
- 👨‍💼 **Admin Panel** - Vollständiges Management Dashboard
- 📊 **Audit Logging** - Alle Aktionen werden geloggt
- 🔒 **Rate Limiting** - Brute-Force Protection

## 📁 Projektstruktur

```
luarmor-clone/
├── backend/               # Express Backend Server
│   ├── server.js         # Main Server Entry Point
│   ├── database.js       # SQLite Database Manager
│   ├── encryption.js     # AES-256 Encryption Manager
│   ├── hwid-generator.js # HWID Generation & Validation
│   ├── authentication.js # JWT & Bcrypt Auth Manager
│   ├── middleware.js     # Express Middleware
│   ├── routes-auth.js    # Authentication Routes
│   ├── routes-license.js # License & HWID Routes
│   ├── routes-admin.js   # Admin Routes
│   └── package.json
├── frontend/             # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx       # Main App Component
│   │   ├── store.js      # Zustand State Management
│   │   ├── api.js        # Axios API Client
│   │   ├── index.css     # Tailwind Styles
│   │   ├── main.jsx      # React Entry Point
│   │   └── components/
│   │       ├── Navigation.jsx
│   │       └── pages/
│   │           ├── Login.jsx
│   │           ├── Register.jsx
│   │           ├── Dashboard.jsx
│   │           ├── Admin.jsx
│   │           └── Profile.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── discord-bot/          # Discord.js Bot
    ├── bot.js           # Discord Bot Entry Point
    └── package.json
```

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 16+
- npm oder yarn
- SQLite3

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Bearbeite .env mit deinen Secrets
npm start
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Öffne http://localhost:5173
```

### 3. Discord Bot Setup

```bash
cd discord-bot
npm install
cp .env.example .env
# Bearbeite .env mit deinem Discord Bot Token
npm start
```

## 🔐 Sicherheitsfeatures

### Verschlüsselung
- **AES-256-CBC** für Datenverschlüsselung
- **SHA-256 HMAC** für Datenverfizierung
- **Bcrypt 12 Rounds** für Passwort-Hashing
- **JWT** für Session Management

### HWID Generierung
- Kombiniert CPU, RAM, Disk Serial, MAC Address, OS
- SHA-256 Hash aus Hardware-Daten
- Deterministische Generierung für Konsistenz
- Multi-HWID Support

### Datenbank
- SQLite mit Foreign Keys enabled
- Soft Deletes (is_active flag)
- Audit Logging aller Änderungen
- Token Revocation

## 🔑 API Endpoints

### Authentication (Public)
```
POST /auth/register          # Benutzer registrieren
POST /auth/login             # Login
POST /auth/logout            # Logout
POST /auth/verify            # Token verifizieren
POST /auth/change-password   # Passwort ändern
```

### License & HWID (Protected)
```
POST /api/hwid/register      # HWID registrieren
POST /api/hwid/verify        # HWID verifizieren
GET  /api/hwid/list          # User HWIDs auflisten
POST /api/license/activate   # License aktivieren
GET  /api/license/keys       # Alle Keys (Admin)
POST /api/license/create     # Key erstellen (Admin)
```

### Admin Panel (Protected + Admin)
```
GET  /api/admin/users        # Alle User auflisten
GET  /api/admin/users/:id    # User Details
PUT  /api/admin/users/:id    # User bearbeiten
DELETE /api/admin/users/:id  # User löschen
GET  /api/admin/logs         # Audit Logs
GET  /api/admin/stats        # Statistiken
```

## 🤖 Discord Bot Commands

```
/license create <product> [expires_in_days]  # License erstellen (Admin)
/license activate <key> <hwid>               # License aktivieren
/license list                                # Alle Keys (Admin)
/admin stats                                 # System Stats (Admin)
/admin users                                 # Alle User (Admin)
/ping                                        # Bot Status
```

## 🗄️ Datenbankstruktur

### users
- id, username, email, password_hash, discord_id
- is_admin, is_active, created_at, updated_at

### license_keys
- id, key, product_name, user_id, created_by
- created_at, expires_at, is_active, activation_count

### hwid_registrations
- id, user_id, hwid, hwid_hash, verified
- verification_seed, first_seen, last_seen
- ip_address, user_agent

### activation_logs
- id, license_key_id, user_id, hwid, hwid_hash
- ip_address, user_agent, success, error_message, created_at

### auth_tokens
- id, user_id, token, token_hash
- ip_address, user_agent, expires_at, is_revoked

### audit_logs
- id, user_id, action, resource_type, resource_id
- old_value, new_value, ip_address, status, created_at

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=your-super-secret-key
ENCRYPTION_KEY=your-32-character-key
DATABASE_PATH=./data/database.db
DISCORD_BOT_TOKEN=your-discord-token
DISCORD_GUILD_ID=your-guild-id
ADMIN_DISCORD_ID=your-admin-id
NODE_ENV=production
```

### Discord Bot (.env)
```
DISCORD_BOT_TOKEN=your-token
DISCORD_GUILD_ID=your-guild-id
ADMIN_DISCORD_ID=your-admin-id
API_URL=http://localhost:5000
API_JWT_SECRET=your-jwt-secret
```

## 🔐 Passwortanforderungen
- Mindestens 8 Zeichen
- Bcrypt Hashing mit 12 Rounds
- Password Change Support

## 🎨 UI Features
- Dark Mode Design (Tailwind CSS)
- Responsive Mobile Design
- Real-time State Management (Zustand)
- Loading States & Error Handling
- Modal Dialogs
- Copy to Clipboard

## 📦 Dependencies

### Backend
- express, cors, dotenv
- jsonwebtoken, bcryptjs, crypto
- sqlite3, body-parser, validator, axios

### Frontend
- react, react-dom, axios
- zustand, lucide-react, tailwindcss

### Discord Bot
- discord.js, dotenv, axios, crypto

## 🐛 Debugging

### Backend Logs
```bash
npm run dev  # Nodemon mit Auto-Restart
```

### Frontend Console
```bash
npm run dev  # Vite Dev Server mit HMR
```

### Discord Bot
```bash
npm run dev  # Mit Nodemon
```

## 📈 Performance Tips

1. Nutze Index auf häufig abgerufenen Spalten (user_id, hwid_hash)
2. Implementiere Caching für Admin Stats
3. Nutze Connection Pooling bei Produktionsumgebung
4. Regulare Datenbankbereinigung für alte Logs

## 🚨 Sicherheitsnotes

⚠️ **WICHTIG: VOR PRODUKTIONSFREIGABE**
1. Generiere neue JWT_SECRET und ENCRYPTION_KEY
2. Nutze HTTPS in Produktion
3. Aktiviere CORS nur für vertrauenswürdige Origins
4. Implementiere Rate Limiting auf Produktionsebene
5. Nutze Environment Variables richtig
6. Regelmäßige Sicherheits-Updates
7. Database Backups aktivieren
8. Monitor Audit Logs

## 📄 Lizenz
MIT License

## 👥 Support
Für Fragen oder Probleme, erstelle ein Issue im Repository.
