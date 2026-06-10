import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Portal, Modal, Menu, SegmentedButtons, Avatar } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, setDoc, doc, getDoc } from 'firebase/firestore'
import Firebase from '../firebaseConfig';
import { FIRESTORE_DB } from '../firebaseConfig'
import { IosAlertStyle } from 'expo-notifications';
import Screen from '../components/ui/Screen';
import AppHeader from '../components/ui/AppHeader';
import { colors, spacing, radius, typography, shadow } from '../theme/theme';

const PasswordModal = ({ visible, hideModal }) => {
  const rules = [
    'At least 8 characters long',
    'Contains an uppercase letter',
    'Contains a lowercase letter',
    'Contains a number',
    'Contains a special character (e.g. !@#$%^&*)',
  ];
  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={modalStyles.container}>
        <Text style={modalStyles.title}>Password guidelines</Text>
        {rules.map((r, i) => (
          <View key={i} style={modalStyles.ruleRow}>
            <Avatar.Icon size={22} icon="check" color={colors.success} style={modalStyles.ruleIcon} />
            <Text style={modalStyles.ruleText}>{r}</Text>
          </View>
        ))}
        <Button onPress={hideModal} style={{ marginTop: spacing.md }}>Close</Button>
      </Modal>
    </Portal>
  );
};

export default function Register({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('client'); // default value is client
  const [accountCreated, setAccountCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    if (accountCreated) {
      setLoading(false);
    } else {
      if (password !== confirmPassword) {
        Alert.alert('Passwords need to match');
        setLoading(false);//to not show loading sign
      } else {
        createUserWithEmailAndPassword(Firebase.auth, email, password)
          .then((userCredential) => {
            sendEmailVerification(Firebase.auth.currentUser)
              .then(() => {
                let uid = userCredential.user.uid;
                console.log(role);
                setDoc(doc(FIRESTORE_DB, 'Users', uid), { role }, {merge:true})
                  .then(()=>{
                    Alert.alert("Verification Email sent, Click the link in your email address to verify your account");
                  }).catch((err)=>{
                    console.error(err);
                  })
                setLoading(false);
              })
              .catch((error) => {
                console.error(error)
                Alert.alert('Another Error');
                setLoading(false);
              })
          })
          .catch((error) => {
            console.error(error);
            Alert.alert('Email Already Used');
            setLoading(false);
          });
      }
    }
  };

  const handleRegisterNext = async () => {
    //Login place creds in localStorage then push to Home Screen based on role
    setLoading(true);
    signInWithEmailAndPassword(FirebaseConfig.auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials;
        AsyncStorage.setItem('user', JSON.stringify(user));
        AsyncStorage.setItem('user-login-object', JSON.stringify({ email, password }));
        const DocRef = doc(FIRESTORE_DB, "Users", user.user.uid);
        getDoc(DocRef)
          .then(data => {
            let user_role = data.data().role;
            if (user_role == 'client') {
              navigation.replace('CustomerHomepage')
            } else if (user_role == 'worker') {
              navigation.replace('WorkerHomepage')
            }
          })
          .catch(err => {
            setLoading(false);
            console.error(err)
          })

      })
      .catch((error) => {
        setLoading(false);
        console.log(error.code + " : " + error.message);
      })
  };

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <Screen scroll keyboardAvoiding padded={false}>
      <AppHeader title="Create account" onBack={() => navigation.replace('LoginScreen')} />
      <View style={styles.body}>
        <Text style={styles.title}>Join Huduma</Text>
        <Text style={styles.subtitle}>Create an account to get help or get hired.</Text>

        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator animating={true} color={colors.primary} style={{ marginVertical: spacing.xxl }} />
          ) : (
            <>
              <TextInput
                mode="outlined"
                label="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                autoCapitalize="none"
                keyboardType="email-address"
                left={<TextInput.Icon icon="email-outline" />}
                style={styles.input}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
              <TextInput
                mode="outlined"
                label="Password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={!showPass}
                onFocus={showModal}
                left={<TextInput.Icon icon="lock-outline" />}
                right={<TextInput.Icon icon={showPass ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowPass(!showPass)} />}
                style={styles.input}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
              <TextInput
                mode="outlined"
                label="Confirm password"
                value={confirmPassword}
                onChangeText={(text) => setConfirmPassword(text)}
                secureTextEntry={!showConfirm}
                left={<TextInput.Icon icon="lock-check-outline" />}
                right={<TextInput.Icon icon={showConfirm ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowConfirm(!showConfirm)} />}
                style={styles.input}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />

              <Text style={styles.roleLabel}>I want to...</Text>
              <SegmentedButtons
                value={role}
                onValueChange={setRole}
                style={styles.segmented}
                buttons={[
                  { value: 'client', label: 'Get help', icon: 'hand-heart-outline' },
                  { value: 'worker', label: 'Get work', icon: 'briefcase-outline' },
                ]}
              />
              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.primaryBtn}
                contentStyle={styles.primaryBtnContent}
                labelStyle={styles.primaryBtnLabel}
              >
                Send email verification
              </Button>
            </>
          )}
          {accountCreated ? (
            <Button style={styles.input} mode='elevated' onPress={() => handleRegisterNext()}> Next </Button>
          ) : null}

          <PasswordModal visible={modalVisible} hideModal={hideModal} />
        </View>

        <View style={styles.row}>
          <Text style={styles.muted}>Already have an account? </Text>
          <TouchableOpacity onPress={()=> navigation.replace("LoginScreen")}>
            <Text style={styles.textLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  title: { ...typography.h1, marginTop: spacing.sm },
  subtitle: { ...typography.muted, marginBottom: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
  roleLabel: { ...typography.label, marginBottom: spacing.sm },
  segmented: { marginBottom: spacing.lg },
  primaryBtn: { borderRadius: radius.md },
  primaryBtnContent: { height: 50 },
  primaryBtnLabel: { fontSize: 16, fontWeight: '700' },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  muted: { ...typography.muted },
  textLink: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});

const modalStyles = StyleSheet.create({
  container: { backgroundColor: colors.surface, padding: spacing.xl, marginHorizontal: spacing.xl, borderRadius: radius.lg },
  title: { ...typography.h3, marginBottom: spacing.md },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  ruleIcon: { backgroundColor: colors.successContainer, marginRight: spacing.sm },
  ruleText: { ...typography.body, flex: 1 },
});
