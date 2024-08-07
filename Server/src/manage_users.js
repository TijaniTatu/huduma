'use strict';

const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require("../config/huduma-4bc13-firebase-adminsdk-ogdgh-e3b6545e86.json");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://huduma-4bc13-default-rtdb.firebaseio.com"
});

const db = getFirestore();

async function getUser(uid) {
  try {
    const userRecord = await getAuth().getUser(uid);
    const userDoc = await db.collection('Users').doc(uid).get();
    console.log(userDoc)
    return (userDoc.data());
    console.log(userRecord);
    if (!userDoc.exists) {
      console.log('No such document in Firestore!');
    } else {
      console.log('User data from Auth:', userRecord.toJSON());
      console.log('User data from Firestore:', userDoc.data());
    }
  } catch (error) {
    console.log('Error fetching user data:', error);
  }
}


async function getUserByEmail(email) {
  try {
    const userRecord = await getAuth().getUserByEmail(email);
    const userDoc = await db.collection('Users').doc(userRecord.uid).get();
    if (!userDoc.exists) {
      console.log('No such document in Firestore!');
    } else {
      console.log('User data from Auth:', userRecord.toJSON());
      console.log('User data from Firestore:', userDoc.data());
    }
  } catch (error) {
    console.log('Error fetching user data:', error);
  }
}

async function createUser(data) {
  try {
    const userRecord = await getAuth().createUser(data);
    await db.collection('Users').doc(userRecord.uid).set({
      address: data.address || '',
      dob: data.dob || '',
      'phone number': data.phoneNumber,
      role: data.role || '',
      secEmail: data.secEmail || '',
      username: data.username || data.email,
    });
    console.log('Successfully created new user:', userRecord.uid);
  } catch (error) {
    console.log('Error creating new user:', error);
  }
}


async function updateUser(uid, data) {
  try {
    const userRecord = await getAuth().updateUser(uid, data);
    const userRef = db.collection('Users').doc(uid);
    await userRef.update({
      address: data.address,
      dob: data.dob,
      'phone number': data.phoneNumber,
      role: data.role,
      secEmail: data.secEmail,
      username: data.username,
    });
    console.log('Successfully updated user:', userRecord.toJSON());
  } catch (error) {
    console.log('Error updating user:', error);
  }
}

// Function to delete a user
async function deleteUser(uid) {
  try {
    await getAuth().deleteUser(uid);
    await db.collection('Users').doc(uid).delete();
    console.log('Successfully deleted user');
  } catch (error) {
    console.log('Error deleting user:', error);
  }
}


async function listAllUsers() {
  try {
    const listUsersResult = await getAuth().listUsers(1000);
    let UserArray = [];
    for (const userRecord of listUsersResult.users) {
      console.log('User from Auth:', userRecord.toJSON());
      UserArray.push(userRecord.toJSON());

      const userDoc = await db.collection('Users').doc(userRecord.uid).get();
      if (userDoc.exists) {
        console.log('User from Firestore:', userDoc.data());
      } else {
        console.log('No Firestore document for user:', userRecord.uid);
      }
    }
    return (UserArray);
  } catch (error) {
    console.log('Error listing users:', error);
  }
}
async function countUsers() {
  try {
    const listUsersResult = await getAuth().listUsers(1000);
    const totalUsers = listUsersResult.users.length;
    return (totalUsers);

  } catch (error) {
    console.error('Error counting users:', error);
    res.status(500).send('Error counting users');
  }
}
async function getWorkers() {
  try {
    const snapshot = await db.collection('Users').where('role', '==', 'worker').get();
    let workers = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      let uid = doc.id;
      if (data.approved) {
        workers.push({ ...data, uid });
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
    let workers = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      let uid = doc.id;
      console.log(data);
      workers.push({ ...data, uid });
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
    let clients = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      let uid = doc.id;
      clients.push({ ...data, uid });
    });
    const count = snapshot.size; // Number of documents in the collection
    return { clients, totalClients: count };
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw new Error('Unable to fetch clients');
  }
}


async function getAcceptedRequests() {
  try {
    const snapshot = await db.collection('AcceptedRequests').get();
    const acceptedRequests = [];

    snapshot.forEach(doc => {
      acceptedRequests.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const count = acceptedRequests.length;

    return { acceptedRequests, totalAcceptedRequests: count };
  } catch (error) {
    console.error('Error fetching accepted requests:', error);
    throw new Error('Unable to fetch accepted requests');
  }
}

async function getJobHistory() {
  try {
    const snapshot = await db.collection('JobsHistory').get();
    let doneJobs = [];
    snapshot.forEach((doc) => {
      doneJobs.push({ id: doc.id, data: doc.data() });
    });
    return (doneJobs)
    console.log(doneJobs);
  } catch (err) {
    console.error(err);
  }
}

async function getComplaints() {
  try {
    const snapshot = await db.collection('Complaints').get();
    let Complaints = [];
    snapshot.forEach((doc) => {
      Complaints.push({ id: doc.id, data: doc.data() });
    })
    return Complaints;
  } catch (err) {
    console.error(err);
  }
}


async function getWorkerDistribution() {
  try {
    let EmptyArray = [];
    let elecCount=0, plumCount=0, maidCount = 0;
    let result = await db.collection('Users').where('role', '==', 'worker').get();
    result.forEach(doc=>{
      EmptyArray.push(doc.data());
    })
    return EmptyArray;
  } catch (err) {
    console.error(err);
  }
}

async function clearComplaint(id) {
  try {
    const deleteRef = db.collection('Complaints').doc(id).delete();
    return "Success"
  } catch (err) {
    return err;
  }
}

async function approveWorker(uid) {
  try {
    const workerRef = db.collection('Users').doc(uid);
    await workerRef.update({ approved: true });
    return "success";
  } catch (err) {
    return err;
  }
}

async function banUser(uid) {
  try {
    const workerRef = db.collection('Users').doc(uid);
    await workerRef.update({ ban: true });
    return "success";
  } catch (err) {
    return err;
  }
}

async function unBanUser(uid) {
  try {
    const workerRef = db.collection('Users').doc(uid);
    await workerRef.update({ ban: false });
    return "success";
  } catch (err) {
    return err;
  }
}


async function getRatings() {
  try {
    const ratingsArray = [];

  } catch (err) {

  }
}

module.exports = {
  getUser,
  listAllUsers,
  createUser,
  countUsers,
  getAcceptedRequests,
  getWorkers,
  deleteUser,
  getJobHistory,
  getComplaints,
  approveWorker,
  banUser,
  getUnapprovedWorkers,
  unBanUser,
  getClients,
  getWorkerDistribution
};