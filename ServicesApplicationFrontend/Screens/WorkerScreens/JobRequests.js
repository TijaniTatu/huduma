import { Alert, StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Card, ActivityIndicator, Button, Chip, Surface, Avatar } from 'react-native-paper';
import { FIRESTORE_DB } from '../../firebaseConfig';
import { setDoc, doc, getDoc, collection, onSnapshot, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { AUTH } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { writeWorkerJobState, readWorkerState } from '../../Services/stateService'
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';

const JobRequests = ({ navigation }) => {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [occ, setOcc] = useState('');

  let occupation;

  occupation = (readWorkerState().occupation);

  const getSpecificUserObject = async () => {
    getJobs();
  }

  const checkBan = async () => {
    let userRef = doc(FIRESTORE_DB, 'Users', AUTH.currentUser.uid)
    getDoc(userRef)
      .then(doc => {
        if (doc.data().ban) {
          navigation.replace("BanScreen");
        }
      })
  }

  const getJobs = async () => {
    setLoading(true);
    const q = query(collection(FIRESTORE_DB, 'ServiceRequest'), where("ServiceWanted", '==', occupation || occ));

    onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        setAvailableJobs([])
        setLoading(false);
      } else {
        querySnapshot.forEach((doc) => {
          let emptyArray = [];
          emptyArray.push(doc.data());
          console.log(emptyArray)
          setAvailableJobs(emptyArray);
          setLoading(false);
        })
      }
    }, (onerror) => {
      console.error(onerror.message);
    })
  }

  useEffect(() => {
    getSpecificUserObject();
    checkBan();
  }, []);

  const onAcceptJob = async (jobObject) => {
    setLoading(true);
    //create a document in accepted jobs for the job selected then go to active
    let collectionName = AUTH.currentUser.uid + "::" + jobObject.uid + "::" + jobObject.date;
    let ServiceRequestRef = doc(FIRESTORE_DB, 'AcceptedRequests', collectionName);
    let DateObject = new Date();
    let dateAccepted = DateObject.toISOString();
    let uid = AUTH.currentUser.uid;
    checkBan();
    setDoc(ServiceRequestRef, { ...jobObject, dateAccepted, acceptedBy: uid }, { merge: true })
      .then(async () => {
        writeWorkerJobState(jobObject);
        await deleteDoc(doc(FIRESTORE_DB, 'ServiceRequest', jobObject.uid));
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      })
  }

  return (
    <View style={styles.container}>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Job requests</Text>
          <Text style={styles.subtitle}>New jobs matching {occupation || 'your trade'}</Text>
        </View>
        <Button mode="text" icon="refresh" onPress={() => { getJobs() }} textColor={colors.primary} compact>Refresh</Button>
      </View>
      {
        loading ?
          (<View style={styles.center}><ActivityIndicator animating size={56} color={colors.primary} /></View>)
          :
          (availableJobs && availableJobs.length > 0) ?
            (<ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              {
                availableJobs.map((job, index) => {
                  return (
                    <Card key={index} mode='elevated' style={styles.card}>
                      <Card.Title
                        title={job['clientName']}
                        titleStyle={styles.cardTitle}
                        left={(props) => <Avatar.Icon {...props} icon="account" color={colors.primary} style={{ backgroundColor: colors.primaryContainer }} />}
                      />
                      {job['imageURL'] ? <Card.Cover source={{ uri: job['imageURL'] }} style={styles.cover} /> : null}
                      <Card.Content style={styles.content}>
                        {job['deviceBroken']
                          &&
                          <Surface style={styles.surface} elevation={0}>
                            <Chip style={styles.chip} icon="alert-circle-outline">Damaged device</Chip>
                            <Text style={styles.label}>Device type</Text>
                            <Text style={styles.value}>{job['deviceType']}</Text>
                            <Text style={styles.label}>Device model</Text>
                            <Text style={styles.value}>{job['deviceModel']}</Text>
                          </Surface>}
                        <Text style={styles.label}>Description</Text>
                        <Text style={styles.value} numberOfLines={5} lineBreakMode='tail'>{job['description']}</Text>
                        <Chip style={styles.serviceChip} icon="account-hard-hat">{job['ServiceWanted']}</Chip>
                      </Card.Content>
                      <Card.Actions>
                        <Button mode='outlined' textColor={colors.danger} style={{ borderColor: colors.danger }}>Reject</Button>
                        <Button mode='contained' icon="check" onPress={() => onAcceptJob(job)}>Accept</Button>
                      </Card.Actions>
                    </Card>
                  )
                })
              }
            </ScrollView>) :
            (<View style={styles.center}>
              <Avatar.Icon size={80} icon="file-document-outline" color={colors.textMuted} style={{ backgroundColor: colors.surfaceAlt }} />
              <Text style={styles.emptyTitle}>No requests right now</Text>
              <Text style={styles.emptyText}>New jobs for your trade will appear here.</Text>
            </View>)
      }
      <Button mode="text" icon="history" onPress={() => navigation.push('WorkerHistoryScreen')} textColor={colors.primary} style={styles.historyBtn}>View history</Button>
    </View>
  )
}

export default JobRequests

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { ...typography.h2 },
  subtitle: { ...typography.muted },
  scroll: { padding: spacing.lg, paddingBottom: spacing.sm },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h3, marginTop: spacing.lg },
  emptyText: { ...typography.muted, marginTop: spacing.xs, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.lg, ...shadow.card },
  cardTitle: { ...typography.h3 },
  cover: { marginHorizontal: spacing.md, borderRadius: radius.md },
  content: { paddingTop: spacing.sm },
  surface: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  chip: { alignSelf: 'flex-start', marginBottom: spacing.sm, backgroundColor: colors.dangerContainer },
  serviceChip: { alignSelf: 'flex-start', marginTop: spacing.md, backgroundColor: colors.primaryContainer },
  label: { ...typography.label, marginTop: spacing.sm, marginBottom: spacing.xs },
  value: { ...typography.body },
  historyBtn: { alignSelf: 'center', marginVertical: spacing.sm },
});
