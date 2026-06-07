import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const createAdminAccount = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'Admin',
      email: 'admin@focushub.com',
      password: 'B6A4A7Admin123',
      confirmPassword: 'B6A4A7Admin123'
    });
    console.log('✅ Admin-Account erstellt!');
    console.log('📧 Email: admin@focushub.com');
    console.log('🔐 Passwort: B6A4A7Admin123');
    console.log(response.data);
  } catch (error) {
    console.error('❌ Fehler:', error.response?.data || error.message);
  }
};

createAdminAccount();
