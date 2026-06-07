import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default32characterencryptionkey1';

export const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      ENCRYPTION_KEY
    ).toString();
  } catch (error) {
    console.error('Verschlüsselungsfehler:', error);
    throw new Error('Verschlüsselung fehlgeschlagen');
  }
};

export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Entschlüsselungsfehler:', error);
    throw new Error('Entschlüsselung fehlgeschlagen');
  }
};

export const hashHWID = (hwid) => {
  return CryptoJS.SHA256(hwid + ENCRYPTION_KEY).toString();
};

export const generateApiKey = () => {
  return CryptoJS.SHA256(Math.random().toString() + Date.now()).toString();
};