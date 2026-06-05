import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react'

import { Alert, StyleSheet, View } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { updatePassword } from 'firebase/auth';
import * as LocalAuthentication from 'expo-local-authentication';

import { AUTH } from '../../firebaseConfig';
import Screen from '../../components/ui/Screen';
import AppHeader from '../../components/ui/AppHeader';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';

export default function ChangePassword({ navigation }) {

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const updateUserPassword = async () => {
    setLoading(true);
    let userLoginObject = await AsyncStorage.getItem('user-login-object');
    let userLogin = JSON.parse(userLoginObject);
    try {
      let userLoginObject = await AsyncStorage.getItem('user-login-object');
      let userLogin = JSON.parse(userLoginObject);
      console.log(userLogin);

      if (userLogin.password == oldPassword) {
        if (newPassword == confirmPassword) {
          LocalAuthentication.authenticateAsync({ promptMessage: "Scan your Biometrics to continue" })
            .then(biometrics => {
              if (biometrics.success) {
                updatePassword(AUTH.currentUser, newPassword)
                  .then(() => {
                    Alert.alert('Password Changed');
                    setLoading(false);
                  })
                  .catch(() => {
                    Alert.alert('Could not change Password');
                    setLoading(false);
                  })
              }
            })
        } else {
          setLoading(false);
          Alert.alert("Confirm your new password");
        }
      } else {
        setLoading(false);
        console.log(userLogin.password);
        Alert.alert("Old password does not match entered password");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }

  }

  const eye = (
    <TextInput.Icon icon={show ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShow(!show)} />
  );

  return (
    <Screen scroll keyboardAvoiding padded={false}>
      <AppHeader title="Change password" onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator animating={true} color={colors.primary} />
        </View>
      ) : (
        <View style={styles.body}>
          <Text style={styles.subtitle}>
            Enter your current password and choose a new one. You'll confirm with biometrics.
          </Text>
          <View style={styles.card}>
            <TextInput
              mode="outlined"
              label="Current password"
              value={oldPassword}
              onChangeText={(text) => setOldPassword(text)}
              secureTextEntry={!show}
              left={<TextInput.Icon icon="lock-outline" />}
              right={eye}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
            <TextInput
              mode="outlined"
              label="New password"
              value={newPassword}
              onChangeText={(text) => setNewPassword(text)}
              secureTextEntry={!show}
              left={<TextInput.Icon icon="lock-plus-outline" />}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
            <TextInput
              mode="outlined"
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              secureTextEntry={!show}
              left={<TextInput.Icon icon="lock-check-outline" />}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
            <Button mode="contained" onPress={() => updateUserPassword()} style={styles.btn} contentStyle={styles.btnContent} labelStyle={styles.btnLabel}>
              Change password
            </Button>
            <Button mode="text" onPress={() => navigation.push('ForgotPassword')} textColor={colors.textMuted} style={{ marginTop: spacing.xs }}>
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
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
  btn: { borderRadius: radius.md, marginTop: spacing.xs },
  btnContent: { height: 50 },
  btnLabel: { fontSize: 16, fontWeight: '700' },
  loadingBox: { padding: spacing.xxl, alignItems: 'center' },
});
