'use strict';

// Single source of truth for Firebase on the server.
// - Admin SDK  : privileged Firestore/Auth access (service account required).
// - Client SDK : used only for the email/password auth flows (register, login,
//                password reset) that send Firebase emails on the user's behalf.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const admin = require('firebase-admin');

// ---- Admin SDK ---------------------------------------------------------------
// Credentials are read from GOOGLE_APPLICATION_CREDENTIALS (a path to the
// service-account JSON) via applicationDefault(). Keep that file out of git.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } catch (err) {
    console.error(
      'Failed to initialize firebase-admin. Set GOOGLE_APPLICATION_CREDENTIALS ' +
        'to your service-account JSON path (see .env.example).',
      err.message
    );
    throw err;
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

// ---- Client SDK --------------------------------------------------------------
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

const clientApp = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
});
const clientAuth = getAuth(clientApp);

module.exports = { admin, adminDb, adminAuth, clientAuth };
