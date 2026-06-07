const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.init();
  }

  init() {
    // Stelle sicher, dass das Verzeichnis existiert
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Database initialization error:', err);
      } else {
        console.log('Database connected:', this.dbPath);
        this.createTables();
      }
    });

    // Aktiviere Foreign Keys
    this.db.run('PRAGMA foreign_keys = ON');
  }

  createTables() {
    const tables = [
      // Benutzer-Tabelle
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        discord_id TEXT UNIQUE,
        is_admin BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Lizenz-Keys Tabelle
      `CREATE TABLE IF NOT EXISTS license_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        product_name TEXT NOT NULL,
        user_id INTEGER,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        is_active BOOLEAN DEFAULT 1,
        activation_count INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(created_by) REFERENCES users(id)
      )`,

      // HWID Zuordnungen
      `CREATE TABLE IF NOT EXISTS hwid_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        hwid TEXT NOT NULL,
        hwid_hash TEXT UNIQUE NOT NULL,
        verified BOOLEAN DEFAULT 0,
        verification_seed TEXT,
        first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        UNIQUE(user_id, hwid_hash)
      )`,

      // Aktivierungs-Log
      `CREATE TABLE IF NOT EXISTS activation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_key_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        hwid TEXT NOT NULL,
        hwid_hash TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        success BOOLEAN DEFAULT 1,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(license_key_id) REFERENCES license_keys(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`,

      // Authentifizierungs-Tokens
      `CREATE TABLE IF NOT EXISTS auth_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        token_hash TEXT UNIQUE NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_revoked BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`,

      // Audit-Log
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id INTEGER,
        old_value TEXT,
        new_value TEXT,
        ip_address TEXT,
        status TEXT DEFAULT 'success',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`,

      // Discord Bot Commands Log
      `CREATE TABLE IF NOT EXISTS discord_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_user_id TEXT NOT NULL,
        command TEXT NOT NULL,
        status TEXT DEFAULT 'success',
        response TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    tables.forEach(table => {
      this.db.run(table, (err) => {
        if (err) {
          console.error('Table creation error:', err);
        }
      });
    });
  }

  /**
   * Führt eine Query aus (Promise-basiert)
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  /**
   * Holt eine Zeile (Promise-basiert)
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Holt alle Zeilen (Promise-basiert)
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else {
          console.log('Database closed');
          resolve();
        }
      });
    });
  }
}

module.exports = Database;
