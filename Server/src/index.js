'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { adminDb, clientAuth } = require('../config/firebase');
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} = require('firebase/auth');
const { Expo } = require('expo-server-sdk');

const verifyToken = require('../middleware/index');
const {
  getUser,
  listAllUsers,
  createUser,
  countUsers,
  getAcceptedRequests,
  getWorkers,
  deleteUser,
  getJobHistory,
  getComplaints,
  getUnapprovedWorkers,
  approveWorker,
  banUser,
  unBanUser,
  getClients,
  getWorkerDistribution,
  clearComplaint,
} = require('./manage_users');

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Admin routes are gated behind auth only when REQUIRE_AUTH=true, so the
// existing (tokenless) admin UI keeps working until it gains a login flow.
const adminGuard = process.env.REQUIRE_AUTH === 'true' ? verifyToken : (req, res, next) => next();

/* ------------------------------- Auth / app API ------------------------------ */

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ email: 'Email required', password: 'Password required' });
  }
  try {
    await createUserWithEmailAndPassword(clientAuth, email, password);
    await sendEmailVerification(clientAuth.currentUser);
    res.status(201).json({ message: 'Verification email sent! User created successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred while registering user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ email: 'Email is required', password: 'Password is required' });
  }
  try {
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const idToken = await userCredential.user.getIdToken();
    res.cookie('access_token', idToken, { httpOnly: true });
    res.status(200).json({ message: 'User logged in successfully', uid: userCredential.user.uid });
  } catch (error) {
    res.status(401).json({ error: error.message || 'An error occurred while logging in' });
  }
});

app.post('/api/resetpassword', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(422).json({ email: 'Email is required' });
  }
  try {
    await sendPasswordResetEmail(clientAuth, email);
    res.status(200).json({ message: 'Password reset email sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.post('/api/buildprofile', async (req, res) => {
  const { uid, ...profile } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'uid is required' });
  }
  try {
    await adminDb.collection('Users').doc(uid).set(profile, { merge: true });
    res.status(200).json({ message: 'Profile saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/getusers', async (req, res) => {
  try {
    const snapshot = await adminDb.collection('Users').get();
    const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stores an Expo push token against a user document.
app.post('/api/expoPushTokens', async (req, res) => {
  const { token, userId, uid } = req.body;
  const id = userId || uid;
  if (!token || !id) {
    return res.status(400).json({ error: 'Token and userId are required' });
  }
  try {
    await adminDb.collection('Users').doc(id).set({ expoPushToken: token }, { merge: true });
    res.status(200).json({ message: 'Expo push token saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sendNotification', async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return res.status(400).json({ error: 'UserId and message are required' });
  }
  try {
    const userSnap = await adminDb.collection('Users').doc(userId).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const expoPushToken = userSnap.data().expoPushToken;
    if (!expoPushToken || !Expo.isExpoPushToken(expoPushToken)) {
      return res.status(400).json({ error: 'Valid Expo push token not found for user' });
    }

    const expo = new Expo();
    const chunks = expo.chunkPushNotifications([
      { to: expoPushToken, sound: 'default', body: message },
    ]);
    const tickets = [];
    for (const chunk of chunks) {
      tickets.push(...(await expo.sendPushNotificationsAsync(chunk)));
    }
    res.status(200).json({ message: 'Notification sent successfully', tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* --------------------------------- Admin API --------------------------------- */

app.get('/admin/getworkerdistribution', adminGuard, async (req, res) => {
  try {
    res.json(await getWorkerDistribution());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/unbanuser/:id', adminGuard, async (req, res) => {
  try {
    await unBanUser(req.params.id);
    res.status(200).send('success');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/admin/banuser/:id', adminGuard, async (req, res) => {
  try {
    await banUser(req.params.id);
    res.status(200).send('success');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/admin/approveworker/:id', adminGuard, async (req, res) => {
  try {
    await approveWorker(req.params.id);
    res.status(200).send('success');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/admin/awaitingapproval', adminGuard, async (req, res) => {
  try {
    res.status(200).json(await getUnapprovedWorkers());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/admin/complaints', adminGuard, async (req, res) => {
  try {
    res.json(await getComplaints());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/clearcomplaint/:id', adminGuard, async (req, res) => {
  try {
    await clearComplaint(req.params.id);
    res.status(200).send('success');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/admin/jobhistory', adminGuard, async (req, res) => {
  try {
    res.json(await getJobHistory());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/countusers', adminGuard, async (req, res) => {
  try {
    res.json(await countUsers());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/admin/listallusers', adminGuard, async (req, res) => {
  try {
    res.json(await listAllUsers());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/admin/getworkers', adminGuard, async (req, res) => {
  try {
    res.json(await getWorkers());
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch workers' });
  }
});

app.get('/admin/getclients', adminGuard, async (req, res) => {
  try {
    res.json(await getClients());
  } catch (error) {
    res.status(500).json({ error: 'Error fetching clients' });
  }
});

app.get('/admin/user/:uid', adminGuard, async (req, res) => {
  try {
    const userData = await getUser(req.params.uid);
    if (userData) {
      res.json(userData);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/admin/acceptedRequests', adminGuard, async (req, res) => {
  try {
    res.json(await getAcceptedRequests());
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve accepted requests' });
  }
});

// Alias used by the dashboard; returns the accepted-request totals.
app.get('/admin/countacceptedrequests', adminGuard, async (req, res) => {
  try {
    res.json(await getAcceptedRequests());
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve accepted requests' });
  }
});

app.post('/admin/createuser', adminGuard, async (req, res) => {
  try {
    const result = await createUser(req.body);
    if (result.success) {
      res.status(201).json({ message: 'User created successfully', uid: result.uid });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/admin/deleteuser/:uid', adminGuard, async (req, res) => {
  try {
    await deleteUser(req.params.uid);
    res.status(200).send('User Deleted');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
