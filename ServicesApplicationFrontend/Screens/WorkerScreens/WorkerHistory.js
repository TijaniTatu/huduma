import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Card, Button, ActivityIndicator, Appbar, Text, Avatar, Divider } from 'react-native-paper';
import { Image } from 'expo-image';

import React, { useEffect, useState } from 'react';

import { AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { setDoc, doc, getDoc, collection, onSnapshot, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import call from 'react-native-phone-call';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';


export default function WorkerHistory({ navigation }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clientName, setClientName] = useState('');
    const [clientNumber, setClientNumber] = useState('')
    const [workid, setWorkId] = useState();
    const [earned, setEarned] = useState(0);
    useEffect(() => {
        fetchUserHistory();
    }, []);
    const fetchUserHistory = async () => {
        setLoading(true);
        const q = query(collection(FIRESTORE_DB, 'NewJobsHistory'))
        onSnapshot(q, (snapsot) => {
            let EmptyArray = [];
            snapsot.forEach((doc) => {
                if (doc.id.split("::")[0] == AUTH.currentUser.uid) {
                    //setHistory(doc.data());
                    setWorkId(doc.id);
                    EmptyArray.push(doc.data());
                    setEarned(prev => (prev + parseInt(doc.data().payment)))
                    console.log(EmptyArray);
                    setClientName(doc.data().clientName);
                    setHistory(EmptyArray);
                }
            })
            setLoading(false);
            //console.log(history.length)
        }, (onerror) => {
            console.error(onerror.message);
        })
    }
    const getWorkerDetails = async (uid) => {
        let WorkerRef = doc(FIRESTORE_DB, 'Users', uid);
        const TempArray = [];
        worker.forEach(element => {
            TempArray.push(element);
        })
        return getDoc(WorkerRef)
            .then((resp) => {
                TempArray.push(resp.data());
                //console.log(TempArray);
                setWorker(TempArray);
                // console.log(worker)
            }).catch((err => {
                console.error(err);
            }));
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
                (<View style={styles.center}><ActivityIndicator animating size={56} color={colors.primary} /></View>) :
                (
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.earnCard}>
                        <Text style={styles.earnLabel}>Total earned</Text>
                        <Text style={styles.earnValue}>KES {earned}</Text>
                    </View>

                    {history.length === 0 ? (
                      <View style={styles.empty}>
                        <Avatar.Icon size={72} icon="history" color={colors.textMuted} style={{ backgroundColor: colors.surfaceAlt }} />
                        <Text style={styles.emptyText}>No completed jobs yet.</Text>
                      </View>
                    ) : history.map((job, index) => {
                        return (
                            <Card key={index} mode='elevated' style={styles.card}>
                                <View style={styles.cardHead}>
                                  <Avatar.Icon size={40} icon="briefcase-check-outline" color={colors.success} style={styles.headIcon} />
                                  <Text style={styles.service}>{job.ServiceWanted}</Text>
                                </View>
                                <Divider style={styles.divider} />
                                <Card.Content>
                                    <Text style={styles.label}>Served</Text>
                                    <View style={styles.row}>
                                        <Image
                                            style={styles.image}
                                            source={{ uri: job.imageURL }}
                                            placeholder={{ blurhash }}
                                            contentFit="cover"
                                            transition={1000}
                                        />
                                        <View style={styles.clientInfo}>
                                            <Text style={styles.clientName}>{job.clientName}</Text>
                                            <Text style={styles.muted}>{job.phone_number}</Text>
                                            <Button mode='outlined' icon="phone" style={styles.callBtn}
                                                onPress={() => {
                                                    let number = job.phone_number;
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
                                    <Button mode='contained' icon="flag-outline" buttonColor={colors.danger}>Report</Button>
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
    earnCard: { backgroundColor: colors.charcoal, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
    earnLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
    earnValue: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: spacing.xs },
    empty: { alignItems: 'center', paddingVertical: spacing.xxxl },
    emptyText: { ...typography.muted, marginTop: spacing.md },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.lg, ...shadow.card },
    cardHead: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
    headIcon: { backgroundColor: colors.successContainer, marginRight: spacing.sm },
    service: { ...typography.h3 },
    divider: { backgroundColor: colors.border },
    label: { ...typography.label, marginTop: spacing.md, marginBottom: spacing.xs },
    value: { ...typography.body },
    row: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm },
    image: { width: 76, height: 76, borderRadius: 38 },
    clientInfo: { flex: 1, marginLeft: spacing.lg },
    clientName: { ...typography.bodyStrong },
    muted: { ...typography.muted, marginBottom: spacing.sm },
    callBtn: { alignSelf: 'flex-start', borderRadius: radius.md },
});
