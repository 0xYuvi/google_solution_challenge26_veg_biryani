import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let firebaseInitialized = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isValidServiceAccount = (value) => {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.project_id === 'string' &&
    typeof value.client_email === 'string' &&
    typeof value.private_key === 'string'
  );
};

const parseServiceAccountJson = (raw) => {
  if (!raw || typeof raw !== 'string') return null;

  try {
    const parsed = JSON.parse(raw);
    return isValidServiceAccount(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const readLocalServiceAccount = () => {
  // Check the root of api-server
  const rootPath = path.resolve(__dirname, '../../firebase-service-account.json');
  // Check the current config directory (where I told the user to put it)
  const configPath = path.resolve(__dirname, './firebase-service-account.json');
  
  const targetPath = fs.existsSync(configPath) ? configPath : rootPath;
  
  if (!fs.existsSync(targetPath)) return null;

  try {
    const parsed = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    return isValidServiceAccount(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const initFirebase = () => {
  if (firebaseInitialized) return;

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    const serviceAccount =
      parseServiceAccountJson(serviceAccountJson) || readLocalServiceAccount();

    if (!serviceAccount) {
      console.warn(
        'FIREBASE_SERVICE_ACCOUNT is missing/invalid JSON and local firebase-service-account.json was not found or invalid.'
      );
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    firebaseInitialized = true;
    console.log('Firebase initialized');

  } catch (error) {
    console.error('Firebase init failed:', error.message);
    // DO NOT throw
  }
};

export const firebaseAuth = () => {
  if (!firebaseInitialized) {
    initFirebase();
  }

  if (!firebaseInitialized) {
    return null;
  }

  return admin.auth();
};