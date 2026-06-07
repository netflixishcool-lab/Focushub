const Database = require('./backend/database');
const AuthenticationManager = require('./backend/authentication');

const setup = async () => {
  try {
    console.log('🚀 Initializing Luarmor System...\n');
    
    const db = new Database('./data/database.db');
    const auth = new AuthenticationManager(db, 'test-jwt-secret', 'test-encryption-key-32char!');

    // Warte kurz, damit die DB vollständig initialisiert ist
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Erstelle Admin-Account
    console.log('📝 Creating admin account...');
    const adminUser = await db.run(
      `INSERT OR REPLACE INTO users 
       (id, username, email, password_hash, is_admin, is_active) 
       VALUES (1, ?, ?, ?, 1, 1)`,
      ['admin', 'admin@luarmor.local', await auth.hashPassword('Admin@123')]
    );

    console.log('✅ Admin account created!');
    console.log('   Username: admin');
    console.log('   Password: Admin@123\n');

    // Erstelle Test License Keys
    console.log('🔑 Creating license keys...');
    const keys = [];
    for (let i = 0; i < 5; i++) {
      const key = generateRandomKey();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      await db.run(
        `INSERT INTO license_keys 
         (key, product_name, created_by, expires_at, is_active) 
         VALUES (?, ?, 1, ?, 1)`,
        [key, 'Test Product', expiresAt]
      );
      keys.push(key);
      console.log(`   ✓ Key ${i + 1}: ${key}`);
    }

    console.log('\n✅ Setup complete!');
    console.log('\n📌 Test Keys (kopieren Sie diese zum Testen):');
    keys.forEach((key, idx) => {
      console.log(`   ${idx + 1}. ${key}`);
    });

    console.log('\n🌐 Frontend: http://localhost:5173');
    console.log('🔌 API: http://localhost:5000');
    
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    process.exit(1);
  }
};

function generateRandomKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

setup();
