require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const Database = require('./database');
const EncryptionManager = require('./encryption');
const AuthenticationManager = require('./authentication');
const {
  verifyToken,
  requireAdmin,
  logRequest,
  errorHandler,
  rateLimit,
  corsMiddleware
} = require('./middleware');

const createAuthRoutes = require('./routes-auth');
const createLicenseRoutes = require('./routes-license');
const createAdminRoutes = require('./routes-admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ============= KONFIGURATION =============
const encryptionKey = process.env.ENCRYPTION_KEY || 'default-insecure-key-please-change-this-in-production';
const jwtSecret = process.env.JWT_SECRET || 'default-insecure-jwt-secret-please-change-this-in-production';
const dbPath = process.env.DATABASE_PATH || './data/database.db';

// ============= DATENBANK & AUTHENTIFIZIERUNG =============
const db = new Database(dbPath);
const encryption = new EncryptionManager(encryptionKey);
const authManager = new AuthenticationManager(db, jwtSecret, encryptionKey);

// ============= MIDDLEWARE =============
app.use(corsMiddleware(['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000']));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(logRequest);
app.use(rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// ============= ROUTES =============

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication Routes (Public)
app.use('/auth', createAuthRoutes(authManager));

// Protected Routes - License & HWID
app.use('/api', verifyToken(authManager), createLicenseRoutes(db, encryption));

// Protected Routes - Admin
app.use('/api/admin', verifyToken(authManager), requireAdmin, createAdminRoutes(db));

// ============= STATISCHE DATEIEN =============
// Frontend servieren (nach Build)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback für SPA Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Page not found' });
    }
  });
});

// ============= ERROR HANDLING =============
app.use(errorHandler);

// ============= SERVER START =============
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          Luarmor Admin Panel Server Started                  ║
╠═══════════════════════════════════════════════════════════════╣
║ 🚀 Server: http://localhost:${PORT}                            
║ 🔐 Encryption: AES-256-CBC                                    
║ 🗄️  Database: ${dbPath}                                
║ 🌍 Environment: ${process.env.NODE_ENV || 'development'}                                   
║ ⚠️  Note: Change JWT_SECRET and ENCRYPTION_KEY in .env       
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

module.exports = app;
