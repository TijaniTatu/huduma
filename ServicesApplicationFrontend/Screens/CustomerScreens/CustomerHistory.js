import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Card, Button, ActivityIndicator, Appbar, Text, Avatar, Divider } from 'react-native-paper';
import { Image } from 'expo-image';

import React, { useEffect, useState } from 'react';

import { AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { setDoc, doc, getDoc, collection, onSnapshot, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import call from 'react-native-phone-call';
import {writeAskForJobState} from '../../Services/stateService'
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';

export default function CustomerHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState();
  const [workid, setWorkId] = useState();
  useEffect(() => {
    fetchUserHistory();
  }, []);
  const fetchUserHistory = async () => {
    setLoading(true);
    const q = query(collection(FIRESTORE_DB, 'NewJobsHistory'))
    onSnapshot(q, (snapsot) => {
      let EmptyArray = [];
      snapsot.forEach((doc) => {
        if (doc.id.split("::")[1] == AUTH.currentUser.uid) {
          //setHistory(doc.data());
          setWorkId(doc.id);
          getWorkerDetails(doc.id.split("::")[0])
            .then(() => {
              EmptyArray.push({job_id:doc.id, ...doc.data()});
              //console.log(doc.data())
              setHistory([{job_id:doc.id, ...doc.data()}]);
            })
        }
      })
      setHistory(EmptyArray);
      setLoading(false);
    }, (onerror) => {
      console.error(onerror.message);
    })
  }
  const getWorkerDetails = async (uid) => {
    let WorkerRef = doc(FIRESTORE_DB, 'Users', uid);
    return getDoc(WorkerRef)
      .then((resp) => {
        setWorker(resp.data());
        console.log(worker);
      }).catch((err => {
        console.error(err);
      }))
  }
  const handleReport = async (job_id)=>{
    console.log(job_id);
    writeAskForJobState({collectionName: job_id});
    navigation.push('ClientComplainScreen');

  }
  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';
  return (
    <View style={styles.screen}>
      <Appbar.Header mode='small' collapsable={true} style={styles.appbar} statusBarHeight={0}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.text} />
        <Appbar.Content title="Your history" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="refresh" onPress={fetchUserHistory} color={colors.text} />
        <Appbar.Action icon="cog-outline" onPress={() => { navigation.push("Settings") }} color={colors.text} />
      </Appbar.Header>
      {loading ?
        (
          <View style={styles.center}><ActivityIndicator animating size={56} color={colors.primary} /></View>
        ) :
        history.length === 0 ? (
          <View style={styles.center}>
            <Avatar.Icon size={80} icon="history" color={colors.textMuted} style={{ backgroundColor: colors.surfaceAlt }} />
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyText}>Completed jobs will show up here.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {history.map((job, index) => {
              return (
                <Card key={index} style={styles.card} mode="elevated">
                  <View style={styles.cardHead}>
                    <Avatar.Icon size={40} icon="briefcase-outline" color={colors.primary} style={styles.headIcon} />
                    <Text style={styles.service}>{job.ServiceWanted}</Text>
                  </View>
                  <Divider style={styles.divider} />
                  <Card.Content>
                    <Text style={styles.label}>Serviced by</Text>
                    <View style={styles.row}>
                      <Image
                        style={styles.image}
                        source={{ uri: worker.photoURL }}
                        placeholder={{ blurhash }}
                        contentFit="cover"
                        transition={1000}
                      />
                      <View style={styles.workerInfo}>
                        <Text style={styles.workerName}>{worker.name}</Text>
                        <Text style={styles.muted}>{worker.phoneNumber}</Text>
                        <Button mode='outlined' icon="phone"
                          style={styles.callBtn}
                          onPress={() => {
                            let number = worker.phoneNumber;
                            call({ number });
                          }}
                        >Call</Button>
                      </View>
                    </View>

                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.value}>{job.description}</Text>
                    <Text style={styles.label}>Area</Text>
                    <Text style={styles.value}>{job.locationName}</Text>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{job.dateAccepted}</Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button mode='contained' icon="flag-outline" buttonColor={colors.danger} onPress={()=> handleReport(job.job_id)}>
                      Report
                    </Button>
                  </Card.Actions>
                </Card>
              )
            })}
          </ScrollView>
        )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  appbar: { backgroundColor: colors.background },
  appbarTitle: { fontWeight: '700', color: colors.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h2, marginTop: spacing.lg },
  emptyText: { ...typography.muted, marginTop: spacing.xs, textAlign: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.lg, ...shadow.card },
  cardHead: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  headIcon: { backgroundColor: colors.primaryContainer, marginRight: spacing.sm },
  service: { ...typography.h3 },
  divider: { backgroundColor: colors.border },
  label: { ...typography.label, marginTop: spacing.md, marginBottom: spacing.xs },
  value: { ...typography.body },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm },
  image: { width: 76, height: 76, borderRadius: 38 },
  workerInfo: { flex: 1, marginLeft: spacing.lg },
  workerName: { ...typography.bodyStrong },
  muted: { ...typography.muted, marginBottom: spacing.sm },
  callBtn: { alignSelf: 'flex-start', borderRadius: radius.md },
});
