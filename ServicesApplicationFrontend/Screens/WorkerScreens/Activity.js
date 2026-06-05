import { Alert, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, ActivityIndicator, Button, Chip, TextInput } from 'react-native-paper';
import { FIRESTORE_DB } from '../../firebaseConfig';
import { setDoc, doc, getDoc, collection, onSnapshot, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
import { AUTH } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import openMap from 'react-native-open-maps';
import { writeToChatPartyState } from '../../Services/stateService'
import * as Location from "expo-location";
import { getChatPartyState } from '../../Services/stateService';
import * as Notifications from "expo-notifications";
import axios from 'axios';

import {readWorkerJobState, writeWorkerJobState, clearWorkerJobState} from '../../Services/stateService'
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const generateNotification = async () => {
  //show the notification to the user
  Notifications.scheduleNotificationAsync({
    //set the content of the notification
    content: {
      title: "Huduma App",
      body: "You might have a new message",
    },
    trigger: null,
  });
};

const Activity = ({ navigation }) => {

  useEffect(() => {
    getActivity();
    getLocation();
    checkBan();
    if (getChatPartyState() && AUTH.currentUser) {
      let { sentBy, sentTo } = getChatPartyState();
      if (sentBy == AUTH.currentUser.uid || sentTo == AUTH.currentUser.uid && sentTo != AUTH.currentUser.uid) {
        let chatid = `${sentBy}::${sentTo}`;
        console.log(chatid, AUTH.currentUser.uid)
        const q = query(collection(FIRESTORE_DB, 'chats'), orderBy('createdAt', "desc"));
        onSnapshot(q, (snapshot) => {
          console.log(snapshot)
          generateNotification();
        }
        );
      }
    }
  }, []);

  const checkBan = async () => {
    let userRef = doc(FIRESTORE_DB,'Users',AUTH.currentUser.uid)
    getDoc(userRef)
      .then(doc=>{
        if(doc.data().ban){
          navigation.replace("BanScreen");
        }
      })
  }

  const getLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    let { latitude, longitude } = location.coords;
    let AreaName = await Location.reverseGeocodeAsync({ latitude, longitude });
  }

  const [startArea, setStartArea] = useState('');
  const [jobQueryString, setJobQueryString] = useState('');
  const [jobObject, setJobObject] = useState();
  const [working, setWorking] = useState(false);
  const [arrived, setArrived] = useState();
  const [collectionName, setCollectionName] = useState();
  const [loading, setLoading] = useState(true);
  const [pay, setPay] = useState(1);
  const [phone, setPhone] = useState( )

  const openGoogleMaps = async () => {
    let latitude = jobObject.currentLocation.latitude;
    let longitude = jobObject.currentLocation.longitude;
    let endArea = jobObject.locationName
    console.log(latitude, longitude)
    openMap({ latitude, longitude, start: startArea, end: endArea });
  }

  const onDeclineJob = async (jobObject) => {
    setLoading(true);
    const user_id = jobObject.uid;
    let ServiceRequestRef = doc(FIRESTORE_DB, 'ServiceRequest', user_id);
    let collection_name = AUTH.currentUser.uid + "::" + jobObject.uid + "::" + jobObject.date;
    let DeleteRed = doc(FIRESTORE_DB, 'AcceptedRequests', collection_name);
    setDoc(ServiceRequestRef, jobObject, { merge: true })
      .then(async () => {
        deleteDoc(DeleteRed)
          .then(() => {
            setJobObject(null);
          })
          .catch((err) => {
            console.error(err);
          })
      })
      .catch((err) => {
        setLoading(false);
      })
  }

  const checkArriveLocation = async () => {
    //ask user whether dude has arrived
    //switch screen to dude working
    const q = query(collection(FIRESTORE_DB, 'StartedJobs'));
    onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        console.log('No Work');
      }
      snapshot.forEach((Doc) => {
        if (Doc.id == collectionName) {
          setArrived(true);
          let DeleteRed = doc(FIRESTORE_DB, 'AcceptedRequests', collectionName);

        }
      })
    }, (onError) => {
      console.error(onError);
    })
  }

  const onFinishWork = async () => {
    //delete from Active jobs
    //push images to history
  }

  const getActivity = async () => {
    setLoading(true);
    let q = collection(FIRESTORE_DB, "AcceptedRequests");
    onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.id.split("::")[0] == AUTH.currentUser.uid) {
          let workerId = doc.id.split("::")[0];
          let userId = doc.id.split("::")[1];
          setCollectionName(doc.id);
          writeToChatPartyState({ sentBy: userId, sentTo: workerId })
          setJobQueryString(doc.id);
          setJobObject(doc.data())
          setLoading(false);
          setPhone(parseInt(doc.data().phoneNumber.slice(1)));
        }
        if (querySnapshot.empty) {
          setJobObject([]);
        }
      })
    })
    checkArriveLocation();
  }

  const [worktime, setWorkTime] = useState(0);

  useEffect(() => {
    let interval;
    if (working) {
      interval = setInterval(() => {
        setWorkTime((prevTime) => prevTime + 1000);
      }, 1000);
    } else if (!working) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [working]);

  const handleFinishWork = async () => {
    setLoading(true);
    clearWorkerJobState();
    writeWorkerJobState(jobObject);
    
    let DeleteRed = doc(FIRESTORE_DB, 'StartedJobs', collectionName);
    let FinishRef = doc(FIRESTORE_DB, 'FinishedJobs', collectionName);
    let finishtime = (new Date ()).toISOString();
    let elapsedTime = worktime/1000;
    setDoc(FinishRef, { ...jobObject, finishtime, elapsedTime})
      .then(() => {
        setLoading(false);
        deleteDoc(DeleteRed);
        navigation.replace("WorkerPayment");
      })
      .catch((err) => {
        console.error(err);
      })
  }


  return (
    <View style={styles.screen}>
      {loading ?
        (
          <View style={styles.center}>
            <ActivityIndicator animating size={56} color={colors.primary} />
            <Text style={styles.muted}>Checking for active jobs…</Text>
            <Button mode="text" icon="refresh" onPress={() => getActivity()} textColor={colors.primary}>Refresh</Button>
          </View>
        ) :
        (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {jobObject ?
              (<>
                <View style={styles.headRow}>
                  <Text style={styles.heading}>Current job</Text>
                  <Button mode="text" icon="refresh" onPress={() => getActivity()} textColor={colors.primary} compact>Refresh</Button>
                </View>
                <Card mode='elevated' style={styles.card}>
                  {jobObject['imageURL'] ? <Card.Cover source={{ uri: jobObject['imageURL'] }} style={styles.cover} /> : null}
                  <Card.Content style={{ paddingTop: spacing.md }}>
                    <Chip style={styles.serviceChip} textStyle={{ color: colors.primaryDark }} icon="account-hard-hat">{jobObject['ServiceWanted']}</Chip>
                    <Text style={styles.label}>Client</Text>
                    <Text style={styles.value}>{jobObject['clientName']}</Text>
                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.value}>{jobObject['description']}</Text>
                  </Card.Content>
                  <Card.Actions style={styles.actionsRow}>
                    <Button mode="outlined" icon="message-text-outline" onPress={() => navigation.push('WorkerChatScreen')}>Chat</Button>
                    <Button mode="text" textColor={colors.danger} onPress={() => onDeclineJob(jobObject)}>Decline</Button>
                  </Card.Actions>
                </Card>
                <Button mode='contained' icon="map-marker-path" onPress={() => openGoogleMaps()} style={styles.fullBtn} contentStyle={{ height: 48 }}>Open location in maps</Button>
                <Button mode='contained' icon="map-marker-check-outline" buttonColor={colors.success} onPress={() => checkArriveLocation()} style={styles.fullBtn} contentStyle={{ height: 48 }}>I've arrived</Button>
              </>) :
              (
              <View style={styles.center}>
                <Chip icon="briefcase-clock-outline" style={styles.idleChip}>No active job</Chip>
                <Text style={styles.idleTitle}>Nothing in progress</Text>
                <Text style={styles.muted}>Accept a request to start working.</Text>
              </View>
              )}

            {arrived ?
              (<View style={styles.timerCard}>
                <Text style={styles.timerLabel}>You've arrived</Text>
                <Text style={styles.timerValue}>{worktime/1000}s</Text>
                <Button mode='contained' icon="play" onPressOut={() => setWorking(true)} style={styles.fullBtn} contentStyle={{ height: 48 }}>Start working</Button>
                <Button mode='outlined' icon="stop" onPress={() => handleFinishWork()} style={styles.fullBtn} contentStyle={{ height: 48 }}>Stop & request payment</Button>
              </View>) :
              null}
          </ScrollView>
        )}
    </View>
  )
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  heading: { ...typography.h2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.md, ...shadow.card },
  cover: { marginHorizontal: spacing.md, marginTop: spacing.md, borderRadius: radius.md },
  serviceChip: { alignSelf: 'flex-start', backgroundColor: colors.primaryContainer, marginBottom: spacing.xs },
  label: { ...typography.label, marginTop: spacing.md, marginBottom: spacing.xs },
  value: { ...typography.body },
  actionsRow: { justifyContent: 'space-between' },
  fullBtn: { borderRadius: radius.md, marginTop: spacing.sm },
  muted: { ...typography.muted, marginTop: spacing.sm, textAlign: 'center' },
  idleChip: { backgroundColor: colors.surfaceAlt, marginBottom: spacing.md },
  idleTitle: { ...typography.h2, marginBottom: spacing.xs },
  timerCard: { backgroundColor: colors.charcoal, borderRadius: radius.lg, padding: spacing.xl, marginTop: spacing.lg, alignItems: 'center' },
  timerLabel: { color: 'rgba(255,255,255,0.7)', ...typography.label },
  timerValue: { color: '#fff', fontSize: 40, fontWeight: '800', marginVertical: spacing.sm },
});


export default Activity;