import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Card, Button, ActivityIndicator, Appbar, Text, TextInput } from 'react-native-paper';
import { Image } from 'expo-image';

import React, { useEffect, useState } from 'react';

import { AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { setDoc, doc, getDoc, collection, onSnapshot, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import call from 'react-native-phone-call';
import { getAskForJobState } from '../../Services/stateService';
import Screen from '../../components/ui/Screen';
import AppHeader from '../../components/ui/AppHeader';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';

export default function ClientComplain({navigation}) {
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const handleComplaintSubmit = async () => {
    setLoading(true);
    let { collectionName } = getAskForJobState();
    const complaintRef = doc(FIRESTORE_DB, 'Complaints', collectionName);
    setDoc(complaintRef, { collectionName, complaint })
      .then(() => {
        setLoading(false);
        navigation.replace('CustomerHomepage');
      }).catch(err => console.error(err));
  }
  return (
    <Screen scroll keyboardAvoiding padded={false}>
      <AppHeader title="Raise a complaint" onBack={() => navigation.goBack()} rightIcon="cog-outline" onRightPress={() => navigation.push('Settings')} />
      <View style={styles.body}>
        <Text style={styles.subtitle}>
          Tell us what went wrong with your service. Our team will review it.
        </Text>
        <View style={styles.card}>
          <TextInput
            mode="outlined"
            label="What's your complaint?"
            multiline={true}
            numberOfLines={8}
            value={complaint}
            onChangeText={(text) => setComplaint(text)}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />
          <Button
            mode="contained"
            loading={loading}
            disabled={loading}
            onPress={handleComplaintSubmit}
            style={styles.btn}
            contentStyle={styles.btnContent}
            labelStyle={styles.btnLabel}
          >
            Submit complaint
          </Button>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  subtitle: { ...typography.muted, marginBottom: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  input: { marginBottom: spacing.lg, backgroundColor: colors.surface, minHeight: 140 },
  btn: { borderRadius: radius.md },
  btnContent: { height: 50 },
  btnLabel: { fontSize: 16, fontWeight: '700' },
});
