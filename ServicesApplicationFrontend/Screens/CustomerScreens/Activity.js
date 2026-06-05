import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, Button, Card, Chip, TextInput } from 'react-native-paper';
import { Image } from 'expo-image';
import { FIRESTORE_DB } from '../../firebaseConfig';
import { setDoc, doc, getDoc, collection, onSnapshot, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
import { AUTH } from '../../firebaseConfig';

import { writeToChatPartyState, writeToWorkerState, readWorkerState, writeAskForJobState } from '../../Services/stateService';
import call from 'react-native-phone-call';
import { getChatPartyState } from '../../Services/stateService';
import * as Notifications from "expo-notifications";
import { Rating } from 'react-native-ratings';
import RBSheet from 'react-native-raw-bottom-sheet';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';


const ActivityScreen = ({ navigation }) => {
  const [loading, setloading] = useState(true);
  const [requestSent, setRequestSent] = useState();
  const [workerComing, setWorkerComing] = useState(false);
  const [currentWorkState, setCurrentWorkState] = useState('');
  const [jobObject, setJobObject] = useState();
  const [workerID, setWorkerID] = useState()
  const [worker, setWorker] = useState();
  const [imageURL, setImageURL] = useState();
  const [workURL, setWorkURL] = useState('')
  const [jobFinished, setJobFinished] = useState(false);

  const [collectionName, setCollectionName] = useState('');

  //FormStates
  const [formLoading, setFormLoading] = useState(false);
  const [arrivaTime, setArrivalTime] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);
  const [payment, setPayment] = useState(0);
const [starRating, setStarRating] = useState(0);

  const getActivity = async () => {
    let q = collection(FIRESTORE_DB, "AcceptedRequests");
    onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.id.split("::")[1] == AUTH.currentUser.uid) {
          writeAskForJobState({ collectionName: doc.id });
          setWorkURL(doc.id);
          work_url = doc.id;
          let workerId = doc.id.split("::")[0];
          worker_id = workerId;
          let userId = doc.id.split("::")[1];
          writeToChatPartyState({ sentBy: userId, sentTo: workerId })
          setJobObject(doc.data());
          setCurrentWorkState('A repair man is coming to you');
          getWorkerProfile();
          setWorkerComing(true);
          setloading(false);
        }
      })
    })
  }

  const getRequestSent = async () => {
    let q = doc(FIRESTORE_DB, 'ServiceRequest', AUTH.currentUser.uid);
    onSnapshot(q, (snapshot) => {
      if (snapshot.exists) {
        setWorkerComing(true)
      }
    })
  }

  const getWorkerProfile = async () => {
    if (jobObject) {
      let workerRef = doc(FIRESTORE_DB, 'Users', jobObject.acceptedBy)
      getDoc(workerRef)
        .then((doc) => {
          console.log(doc.data());
          setWorker(doc.data());
          setImageURL(doc.data().photoURL)
        })
        .catch(err => console.error);
    } else {
      console.log('worker loaded')
    }
  }

  const onDeclineJob = async (jobObject) => {
    setloading(true);
    const user_id = jobObject.uid;
    let ServiceRequestRef = doc(FIRESTORE_DB, 'ServiceRequest', user_id);
    let collection_name = jobObject.acceptedBy + "::" + jobObject.uid + "::" + jobObject.date;
    let DeleteRed = doc(FIRESTORE_DB, 'AcceptedRequests', collection_name);
    setDoc(ServiceRequestRef, jobObject, { merge: true })
      .then(async () => {
        await deleteDoc(DeleteRed);
        Alert.alert('Job Declined');
        getActivity();
      })
      .catch((err) => {
        setloading(false);
      })
  }

  const getJobFinished = async () => {
    let q = collection(FIRESTORE_DB, "FinishedJobs");
    onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.id.split("::")[1] == AUTH.currentUser.uid) {
          setCollectionName(doc.id);
          setloading(false);
          setJobFinished(true);
        }
      })
    })
  }

  useEffect(() => {
    getActivity();
    getWorkerProfile();
    getJobFinished();
  }, [])

  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  const onWorkerArrive = async () => {
    //Add to DB that worker has arrived
    setloading(true);
    let workerArriveRef = doc(FIRESTORE_DB, 'StartedJobs', workURL);
    let startDate = new Date();
    let startTime = startDate.toISOString();
    setDoc(workerArriveRef, { ...jobObject, startTime })
      .then(() => {
        //setloading(false);
      }).catch(err => console.error);

  }

  const handleFormSubmit = async () => {
    setFormLoading(true);
    let JobsHistoryRef = doc(FIRESTORE_DB, 'NewJobsHistory', collectionName);
    let DeleteRef = doc(FIRESTORE_DB, 'FinishedJobs', collectionName);
    let DeleteRed = doc(FIRESTORE_DB, 'AcceptedRequests', collectionName);
    setDoc(JobsHistoryRef, { ...jobObject, arrivaTime, satisfaction, starRating, payment }, { merge: true })
      .then(() => {
        deleteDoc(DeleteRef);
        deleteDoc(DeleteRed);
        navigation.replace('CustomerHomepage');
      }).catch(err => {
        console.error(err);
        setFormLoading(false);
      })
  }

  const cancelJob = async () => {
    let docRef = doc(FIRESTORE_DB, 'ServiceRequest', AUTH.currentUser.uid);
    await deleteDoc(docRef);
  }

  const refRBSheet = useRef();

  return (
    <View style={styles.screen}>
      {loading ?
        (<View style={styles.center}><ActivityIndicator animating size={56} color={colors.primary} /></View>)
        :
        (<View style={{ flex: 1 }}>
          {workerComing ?
            (<View style={styles.body}>
              {jobFinished ?
                (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Job complete</Text>
                    <Text style={styles.cardSub}>Please rate your experience.</Text>
                    <TextInput
                      style={styles.input}
                      mode='outlined'
                      label='Worker arrived on time (0-5)'
                      value={arrivaTime}
                      onChangeText={(text) => setArrivalTime(text)}
                      maxLength={2}
                      keyboardType="numeric"
                      disabled={formLoading}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                    />
                    <TextInput
                      style={styles.input}
                      mode='outlined'
                      label="Satisfaction with the job (0-5)"
                      value={satisfaction}
                      onChangeText={(text) => setSatisfaction(text)}
                      maxLength={2}
                      keyboardType="numeric"
                      disabled={formLoading}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                    />
                    <Text style={styles.rateLabel}>Rate the worker's service</Text>
                    <Rating
                      startingValue={starRating}
                      imageSize={32}
                      onFinishRating={(rating) => setStarRating(rating)}
                      style={{ paddingVertical: spacing.sm }}
                    />
                    <Button mode="contained" onPress={() => handleFormSubmit()} disabled={formLoading} loading={formLoading} style={styles.primaryBtn} contentStyle={{ height: 50 }} labelStyle={{ fontWeight: '700' }}>Submit review</Button>
                  </View>
                )
                :
                (
                  <Card mode='elevated' style={styles.card}>
                    {worker ?
                      (<>
                        <Card.Content>
                          <View style={styles.workerHead}>
                            <Image
                              style={styles.image}
                              source={{ uri: imageURL }}
                              placeholder={{ blurhash }}
                              contentFit="cover"
                              transition={1000}
                            />
                            <Text style={styles.workerName}>{worker.name}</Text>
                            <Chip style={styles.occChip} textStyle={{ color: colors.primaryDark }} icon="account-hard-hat">{worker.occupation}</Chip>
                            <Text style={styles.statusText}>On the way to you</Text>
                            <Text style={styles.muted}>{worker.phoneNumber}</Text>
                          </View>
                        </Card.Content>
                        <Card.Actions style={styles.actionsRow}>
                          <Button mode="outlined" icon="message-text-outline" onPress={() => navigation.push('CustomerChatScreen')}>Chat</Button>
                          <Button mode="contained" icon="phone" onPress={() => {
                            let number = worker.phoneNumber;
                            call({ number, prompt: true })
                          }}>Call</Button>
                        </Card.Actions>
                        <View style={styles.secondaryActions}>
                          <Button mode="contained" icon="check-circle-outline" buttonColor={colors.success} onPress={() => onWorkerArrive()} style={styles.fullBtn}>Worker has arrived</Button>
                          <View style={styles.linkRow}>
                            <Button mode="text" onPress={() => refRBSheet.current.open()} textColor={colors.primary}>Worker stats</Button>
                            <Button mode="text" onPress={() => onDeclineJob(jobObject)} textColor={colors.danger}>Decline</Button>
                          </View>
                          <Button mode="text" onPress={() => cancelJob()} textColor={colors.textMuted}>Cancel request</Button>
                        </View>
                        <RBSheet
                          ref={refRBSheet}
                          useNativeDriver={false}
                          customStyles={{
                            wrapper: {
                              backgroundColor: colors.backdropFallback || 'rgba(15,31,42,0.4)',
                            },
                            container: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg },
                            draggableIcon: {
                              backgroundColor: colors.border,
                            },
                          }}
                          customModalProps={{
                            animationType: 'slide',
                            statusBarTranslucent: true,
                          }}
                          customAvoidingViewProps={{
                            enabled: false,
                          }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.sheetTitle}>{worker.name}</Text>
                            <View style={styles.statsWrap}>
                              <Chip style={styles.statChip} icon="account-hard-hat">{worker.occupation}</Chip>
                              <Chip style={styles.statChip} icon="wrench">Jobs: {worker.jobs}</Chip>
                              <Chip style={styles.statChip} icon="star">Rating: {worker.rating}</Chip>
                              <Chip style={styles.statChip} icon="cash">Avg cost: {worker.averagecost}</Chip>
                            </View>
                            <Button mode='contained' onPress={() => refRBSheet.current.close()} style={styles.primaryBtn}>Close</Button>
                          </View>
                        </RBSheet>
                      </>) : (
                      <Card.Content style={styles.center}>
                        <ActivityIndicator animating color={colors.primary} />
                        <TouchableOpacity onPress={() => getWorkerProfile()}>
                          <Text style={styles.muted}>Loading worker details…</Text>
                        </TouchableOpacity>
                      </Card.Content>
                      )}
                  </Card>
                )}
            </View>) :
            (<View style={styles.center}>
              <Chip icon="map-marker-radius-outline" style={styles.idleChip}>No active job</Chip>
              <Text style={styles.idleTitle}>Nothing in progress</Text>
              <Text style={styles.muted}>Request a service from the Jobs tab to get started.</Text>
            </View>)}
        </View>)}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  body: { flex: 1, padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  cardTitle: { ...typography.h2 },
  cardSub: { ...typography.muted, marginBottom: spacing.md },
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
  rateLabel: { ...typography.label, marginTop: spacing.sm, marginBottom: spacing.xs, alignSelf: 'center' },
  primaryBtn: { borderRadius: radius.md, marginTop: spacing.sm },
  workerHead: { alignItems: 'center', paddingVertical: spacing.sm },
  image: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.surfaceAlt },
  workerName: { ...typography.h2, marginTop: spacing.md },
  occChip: { backgroundColor: colors.primaryContainer, marginTop: spacing.sm },
  statusText: { ...typography.bodyStrong, color: colors.success, marginTop: spacing.sm },
  muted: { ...typography.muted },
  actionsRow: { justifyContent: 'center', gap: spacing.sm },
  secondaryActions: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  fullBtn: { borderRadius: radius.md, marginTop: spacing.sm },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  sheetTitle: { ...typography.h2, textAlign: 'center', marginBottom: spacing.md },
  statsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.lg },
  statChip: { backgroundColor: colors.surfaceAlt },
  idleChip: { backgroundColor: colors.surfaceAlt, marginBottom: spacing.md },
  idleTitle: { ...typography.h2, marginBottom: spacing.xs },
});


export default ActivityScreen;