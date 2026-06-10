import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react'

import { Alert, StyleSheet, View } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { sendEmailVerification, updateEmail, verifyBeforeUpdateEmail } from 'firebase/auth';

import { AUTH } from '../../firebaseConfig';
import Screen from '../../components/ui/Screen';
import AppHeader from '../../components/ui/AppHeader';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';

export default function ChangeEmail({ navigation }) {

  const [emailAddress, setEmailAddress] = useState('');
  const [loading, setLoading] = useState(false);


  const updateUserEmail = async () => {
    setLoading(true);
    verifyBeforeUpdateEmail(AUTH.currentUser, emailAddress)
        .then(()=>{
            Alert.alert('Email changed');
        }).catch(err=> console.error);
    /*updateEmail(AUTH.currentUser, emailAddress)
        .then((resp)=>{
            console.error(resp)
        }).catch((err)=>{
            setLoading(false);
            console.error(err);
        })*/
  }

  return (
    <Screen scroll keyboardAvoiding padded={false}>
      <AppHeader title="Change email" onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator animating={true} color={colors.primary} />
          <Text style={styles.loadingText}>Check your inbox to verify the new address.</Text>
        </View>
      ) : (
        <View style={styles.body}>
          <Text style={styles.subtitle}>
            Enter your new email address. We'll send a verification link before the change takes effect.
          </Text>
          <View style={styles.card}>
            <TextInput
              mode="outlined"
              label="New email address"
              value={emailAddress}
              onChangeText={(text) => setEmailAddress(text)}
              autoCapitalize="none"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email-outline" />}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
            <Button mode="contained" onPress={() => updateUserEmail()} style={styles.btn} contentStyle={styles.btnContent} labelStyle={styles.btnLabel}>
              Change email
            </Button>
            <Button mode="text" onPress={()=> navigation.push('ForgotPassword')} textColor={colors.textMuted} style={{ marginTop: spacing.xs }}>
              Forgot password?
            </Button>
          </View>
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  subtitle: { ...typography.muted, marginBottom: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  input: { marginBottom: spacing.lg, backgroundColor: colors.surface },
  btn: { borderRadius: radius.md },
  btnContent: { height: 50 },
  btnLabel: { fontSize: 16, fontWeight: '700' },
  loadingBox: { padding: spacing.xxl, alignItems: 'center' },
  loadingText: { ...typography.muted, marginTop: spacing.md, textAlign: 'center' },
});
