'use strict';

const { adminDb: db, adminAuth } = require('../config/firebase');

async function getUser(uid) {
  try {
    const userDoc = await db.collection('Users').doc(uid).get();
    if (!userDoc.exists) {
      console.log('No such document in Firestore!');
      return null;
    }
    return userDoc.data();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

async function createUser(data) {
  try {
    const userRecord = await adminAuth.createUser(data);
    await db.collection('Users').doc(userRecord.uid).set({
      address: data.address || '',
      dob: data.dob || '',
      'phone number': data.phoneNumber,
      role: data.role || '',
      secEmail: data.secEmail || '',
      username: data.username || data.email,
    });
    console.log('Successfully created new user:', userRecord.uid);
    return { success: true, uid: userRecord.uid };
  } catch (error) {
    console.error('Error creating new user:', error);
    return { success: false, error: error.message };
  }
}

async function updateUser(uid, data) {
  try {
    await adminAuth.updateUser(uid, data);
    await db.collection('Users').doc(uid).update({
      address: data.address,
      dob: data.dob,
      'phone number': data.phoneNumber,
      role: data.role,
      secEmail: data.secEmail,
      username: data.username,
    });
    console.log('Successfully updated user:', uid);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

async function deleteUser(uid) {
  try {
    await adminAuth.deleteUser(uid);
    await db.collection('Users').doc(uid).delete();
    console.log('Successfully deleted user');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

async function listAllUsers() {
  try {
    const listUsersResult = await adminAuth.listUsers(1000);
    return listUsersResult.users.map((u) => u.toJSON());
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}

async function countUsers() {
  try {
    const listUsersResult = await adminAuth.listUsers(1000);
    return listUsersResult.users.length;
  } catch (error) {
    console.error('Error counting users:', error);
    throw error;
  }
}

async function getWorkers() {
  try {
    const snapshot = await db.collection('Users').where('role', '==', 'worker').get();
    const workers = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.approved) {
        workers.push({ ...data, uid: doc.id });
      }
    });
    return { workers, count: workers.length };
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw new Error('Unable to fetch workers');
  }
}

async function getUnapprovedWorkers() {
  try {
    const snapshot = await db.collection('Users').where('approved', '==', false).get();
    const workers = [];
    snapshot.forEach((doc) => {
      workers.push({ ...doc.data(), uid: doc.id });
    });
    return { workers, count: workers.length };
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw new Error('Unable to fetch workers');
  }
}

async function getClients() {
  try {
    const snapshot = await db.collection('Users').where('role', '==', 'client').get();
    const clients = [];
    snapshot.forEach((doc) => {
      clients.push({ ...doc.data(), uid: doc.id });
    });
    return { clients, totalClients: snapshot.size };
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw new Error('Unable to fetch clients');
  }
}

async function getAcceptedRequests() {
  try {
    const snapshot = await db.collection('AcceptedRequests').get();
    const acceptedRequests = [];
    snapshot.forEach((doc) => {
      acceptedRequests.push({ id: doc.id, ...doc.data() });
    });
    return { acceptedRequests, totalAcceptedRequests: acceptedRequests.length };
  } catch (error) {
    console.error('Error fetching accepted requests:', error);
    throw new Error('Unable to fetch accepted requests');
  }
}

async function getJobHistory() {
  try {
    const snapshot = await db.collection('JobsHistory').get();
    const doneJobs = [];
    snapshot.forEach((doc) => {
      doneJobs.push({ id: doc.id, data: doc.data() });
    });
    return doneJobs;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getComplaints() {
  try {
    const snapshot = await db.collection('Complaints').get();
    const complaints = [];
    snapshot.forEach((doc) => {
      complaints.push({ id: doc.id, data: doc.data() });
    });
    return complaints;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getWorkerDistribution() {
  try {
    const result = await db.collection('Users').where('role', '==', 'worker').get();
    const workers = [];
    result.forEach((doc) => workers.push(doc.data()));
    return workers;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function clearComplaint(id) {
  try {
    await db.collection('Complaints').doc(id).delete();
    return 'success';
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function approveWorker(uid) {
  await db.collection('Users').doc(uid).update({ approved: true });
  return 'success';
}

async function banUser(uid) {
  await db.collection('Users').doc(uid).update({ ban: true });
  return 'success';
}

async function unBanUser(uid) {
  await db.collection('Users').doc(uid).update({ ban: false });
  return 'success';
}

module.exports = {
  getUser,
  listAllUsers,
  createUser,
  updateUser,
  countUsers,
  getAcceptedRequests,
  getWorkers,
  deleteUser,
  getJobHistory,
  getComplaints,
  approveWorker,
  banUser,
  unBanUser,
  getUnapprovedWorkers,
  getClients,
  getWorkerDistribution,
  clearComplaint,
};
