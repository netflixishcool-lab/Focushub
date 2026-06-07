/**
 * Luarmor API Test Suite
 * 
 * Teste alle Endpoints des Systems
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';

let authToken = '';
let userId = 0;

const api = axios.create({
  baseURL: API_URL,
  validateStatus: () => true // Don't throw on any status
});

// Hilfsfunktion für formatierte Output
function logTest(name, status, data = null) {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`\n${icon} ${name}`);
  if (data) {
    console.log(`   ${JSON.stringify(data, null, 2).split('\n').join('\n   ')}`);
  }
}

// Test Suite
const tests = {
  // 1. Health Check
  async healthCheck() {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║             Luarmor API Test Suite                   ║');
    console.log('╚═══════════════════════════════════════════════════════╝');

    const res = await api.get('/health');
    logTest('Health Check', res.status === 200 ? 'PASS' : 'FAIL', res.data);
  },

  // 2. User Registration
  async registerUser() {
    const res = await api.post('/auth/register', {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123'
    });

    const status = res.status === 201 ? 'PASS' : 'FAIL';
    logTest('User Registration', status, res.data);

    if (res.data.user) {
      userId = res.data.user.id;
    }

    return res;
  },

  // 3. User Login
  async loginUser() {
    const res = await api.post('/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    const status = res.status === 200 ? 'PASS' : 'FAIL';
    logTest('User Login', status, { token: res.data.token?.substring(0, 20) + '...', user: res.data.user });

    if (res.data.token) {
      authToken = res.data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }

    return res;
  },

  // 4. Token Verification
  async verifyToken() {
    const res = await api.get('/auth/verify');
    const status = res.status === 200 ? 'PASS' : 'FAIL';
    logTest('Token Verification', status, res.data.user);
    return res;
  },

  // 5. HWID Registration
  async registerHWID() {
    const testHWID = 'A'.repeat(64); // 64 character hex string

    const res = await api.post('/api/hwid/register', {
      hwid: testHWID,
      systemInfo: {
        cpuModel: 'Intel Core i7',
        cpuCores: 8,
        totalMemory: 16000000000
      }
    });

    const status = res.status === 200 ? 'PASS' : 'FAIL';
    logTest('HWID Registration', status, { registered: res.data.success });

    return res;
  },

  // 6. HWID List
  async listHWIDs() {
    const res = await api.get('/api/hwid/list');
    const status = res.status === 200 ? 'PASS' : 'FAIL';
    logTest('HWID List', status, { count: res.data.hwids?.length || 0 });
    return res;
  },

  // 7. Create License Key (Admin)
  async createLicense() {
    const res = await api.post('/api/license/create', {
      product_name: 'TestScript',
      expires_in_days: 30,
      quantity: 1
    });

    const status = res.status === 201 ? 'PASS' : 'FAIL';
    logTest('Create License Key', status, {
      created: res.data.success,
      key: res.data.keys?.[0]?.key?.substring(0, 10) + '...'
    });

    return res;
  },

  // 8. List Licenses (Admin)
  async listLicenses() {
    const res = await api.get('/api/license/keys');
    const status = res.status === 200 ? 'PASS' : 'FAIL';
    logTest('List License Keys', status, { count: res.data.keys?.length || 0 });
    return res;
  },

  // 9. Admin Stats (Admin)
  async getAdminStats() {
    const res = await api.get('/api/admin/stats');
    const status = res.status === 200 ? 'PASS' : 'FAIL';
    logTest('Admin Statistics', status, res.data.stats);
    return res;
  },

  // 10. List Users (Admin)
  async listUsers() {
    const res = await api.get('/api/admin/users');
    const status = res.status === 200 ? 'PASS' : 'FAIL';
    logTest('List Users', status, { count: res.data.users?.length || 0 });
    return res;
  },

  // 11. Admin Logs (Admin)
  async getAuditLogs() {
    const res = await api.get('/api/admin/logs');
    const status = res.status === 200 ? 'PASS' : 'FAIL';
    logTest('Audit Logs', status, { count: res.data.logs?.length || 0 });
    return res;
  },

  // 12. Change Password
  async changePassword() {
    const res = await api.post('/auth/change-password', {
      oldPassword: 'admin123',
      newPassword: 'newAdmin123'
    });

    const status = res.status === 200 ? 'PASS' : 'FAIL';
    logTest('Change Password', status, res.data);

    // Change back for other tests
    if (res.status === 200) {
      await api.post('/auth/change-password', {
        oldPassword: 'newAdmin123',
        oldPassword: 'admin123'
      }).catch(() => {});
    }

    return res;
  },

  // 13. Logout
  async logout() {
    const res = await api.post('/auth/logout');
    const status = res.status === 200 ? 'PASS' : 'FAIL';
    logTest('Logout', status, res.data);
    authToken = '';
    delete api.defaults.headers.common['Authorization'];
    return res;
  }
};

// Run all tests
async function runTests() {
  try {
    console.log('Starting tests...\n');

    // Health Check
    await tests.healthCheck();

    // Auth Tests
    console.log('\n\n📝 === AUTHENTICATION TESTS ===');
    await tests.registerUser();
    await tests.loginUser();
    await tests.verifyToken();

    // HWID Tests
    console.log('\n\n🖥️  === HWID TESTS ===');
    await tests.registerHWID();
    await tests.listHWIDs();

    // License Tests
    console.log('\n\n🔑 === LICENSE TESTS ===');
    await tests.createLicense();
    await tests.listLicenses();

    // Admin Tests
    console.log('\n\n👨‍💼 === ADMIN TESTS ===');
    await tests.getAdminStats();
    await tests.listUsers();
    await tests.getAuditLogs();

    // Account Tests
    console.log('\n\n🔐 === ACCOUNT TESTS ===');
    await tests.changePassword();
    await tests.logout();

    console.log('\n\n╔═══════════════════════════════════════════════════════╗');
    console.log('║              Test Suite Complete!                    ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('Test suite error:', error.message);
  }
}

// Run if executed directly
if (require.main === module) {
  runTests();
}

module.exports = tests;
