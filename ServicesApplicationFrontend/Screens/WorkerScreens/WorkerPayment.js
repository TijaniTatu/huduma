import { PAYMENT_URL } from '../../config';
import { Alert, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, ActivityIndicator, Button, Chip, TextInput, Appbar } from 'react-native-paper';
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
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';


import { readWorkerJobState, writeWorkerJobState, clearWorkerJobState } from '../../Services/stateService';


export default function WorkerPayment({ navigation }) {
    const [pay, setPay] = useState(1);
    const [phone, setPhone] = useState();
    const [loading, setLoading] = useState(false);
    const [servicewanted, setServiceWanted] = useState('');
    const [job_id, setJob_id] = useState('');

    const handleFinishWork = async () => {
        setLoading(true);
        //call stkpush
        //get client Phone Number
        axios.post(`${PAYMENT_URL}/lipa`, { amount: pay, phone, servicewanted, job_id })
            .then((result) => {
                console.log(Object.keys(result));
                console.log(result.data);
                setLoading(false);
            }).catch((err) => {

            })

    }

    useEffect(() => {
        let work_state = readWorkerJobState();
        console.log(work_state);
        setPhone(parseInt(work_state.phoneNumber.slice(1)));
        setServiceWanted(work_state.ServiceWanted);
        setJob_id(`${work_state.acceptedBy}::${work_state.uid}`);
    }, [])
    return (
        <View style={styles.screen}>
            <Appbar.Header style={{ backgroundColor: colors.background }} statusBarHeight={0}>
                {navigation ? <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.text} /> : null}
                <Appbar.Content title="Request payment" titleStyle={{ fontWeight: '700', color: colors.text }} />
            </Appbar.Header>

            <View style={styles.body}>
                <View style={styles.summary}>
                    <Text style={styles.summaryLabel}>Charging for</Text>
                    <Text style={styles.summaryService}>{servicewanted || 'Service'}</Text>
                    <Text style={styles.summaryAmount}>KES {pay || 0}</Text>
                </View>

                {loading ? (
                    <View style={styles.center}><ActivityIndicator color={colors.primary} size={48} /></View>
                ) : (
                    <View style={styles.card}>
                        <TextInput
                            label="Amount (KES)"
                            value={String(pay ?? '')}
                            onChangeText={(text) => setPay(parseInt(text))}
                            mode='outlined'
                            keyboardType="numeric"
                            left={<TextInput.Icon icon="cash" />}
                            style={styles.input}
                            outlineColor={colors.border}
                            activeOutlineColor={colors.primary}
                        />
                        <TextInput
                            label="Client phone number"
                            value={String(phone ?? '')}
                            onChangeText={(text) => setPhone(parseInt(text))}
                            mode='outlined'
                            keyboardType="phone-pad"
                            left={<TextInput.Icon icon="card-account-phone-outline" />}
                            style={styles.input}
                            outlineColor={colors.border}
                            activeOutlineColor={colors.primary}
                        />
                        <Button mode='contained' icon="cellphone-check" onPress={() => handleFinishWork()} style={styles.btn} contentStyle={{ height: 50 }} labelStyle={{ fontSize: 16, fontWeight: '700' }}>
                            Send M-Pesa STK push
                        </Button>
                        <Text style={styles.hint}>The client will receive a prompt on their phone to approve the payment.</Text>
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    body: { paddingHorizontal: spacing.lg },
    summary: {
        backgroundColor: colors.charcoal,
        borderRadius: radius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
    summaryService: { color: '#fff', ...typography.h3, marginTop: spacing.xs },
    summaryAmount: { color: colors.primary, fontSize: 34, fontWeight: '800', marginTop: spacing.sm },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
    input: { marginBottom: spacing.md, backgroundColor: colors.surface },
    btn: { borderRadius: radius.md, marginTop: spacing.xs },
    hint: { ...typography.caption, textAlign: 'center', marginTop: spacing.md },
    center: { paddingVertical: spacing.xxxl, alignItems: 'center' },
});
