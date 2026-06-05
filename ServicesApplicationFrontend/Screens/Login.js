import React, { useState, useEffect } from 'react'

import { Alert, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import FirebaseConfig, { AUTH } from '../firebaseConfig';
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { addDoc, collection, setDoc, doc, getDoc, getDocs } from 'firebase/firestore'
import { FIRESTORE_DB } from '../firebaseConfig';

import { writeToCustomerState, writeToWorkerState } from '../Services/stateService'
import Screen from '../components/ui/Screen';
import { colors, spacing, radius, typography, shadow } from '../theme/theme';

export default function Login({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem("user-login-object")
      .then(result => {
        user = JSON.parse(result);
        console.log(user);
        if (user.email != "") {
          LocalAuthentication.authenticateAsync({ promptMessage: "Scan your Biometrics to continue" })
            .then(biometrics => {
              if (biometrics.success) {
                setLoading(true);
                signInWithEmailAndPassword(FirebaseConfig.auth, user.email, user.password)
                  .then((userCredentials) => {
                    const user = userCredentials;
                    AsyncStorage.setItem('user', JSON.stringify(user))
                    AsyncStorage.setItem('user-login-object', JSON.stringify({ email, password }));
                    const DocRef = doc(FIRESTORE_DB, "Users", user.user.uid);
                    getDoc(DocRef)
                      .then(data => {
                        let user_role = data.data().role;
                        if (user_role == 'client') {
                          writeToCustomerState(data.data())
                          navigation.replace('CustomerHomepage')
                        } else if (user_role == 'worker') {
                          console.log(data.data())
                          if(!data.data().approved && AUTH.currentUser.displayName){
                            navigation.push("NotApprovedScreen");
                          }else{
                            if(!data.data().ban){
                              writeToWorkerState(data.data());
                              navigation.push("WorkerHomepage");
                            }else{
                              navigation.push("BanScreen");
                            }
                          }
                        }
                      })
                      .catch(err => {
                        console.error(err);
                        setLoading(false);
                      })
                  })
                  .catch((error) => {
                    setLoading(false);
                    console.log(error.code + " : " + error.message);
                  })
              }
            })
            .catch(err => {
              console.error(err);
            })
        } else {

        }
      })
      .catch(err => {
        console.error(err);
      })

  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleLogIn = async () => {
    //login user
    setLoading(true);
    signInWithEmailAndPassword(FirebaseConfig.auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials;
        AsyncStorage.setItem('user', JSON.stringify(user));
        AsyncStorage.setItem('user-login-object', JSON.stringify({ email, password }));
        const DocRef = doc(FIRESTORE_DB, "Users", user.user.uid);
        getDoc(DocRef)
          .then(data => {
            AsyncStorage.setItem('specific-user-object', JSON.stringify(data.data()));
            let user_role = data.data().role;
            if (user_role == 'client') {
              writeToCustomerState(data.data());
              navigation.replace('CustomerHomepage')
            } else if (user_role == 'worker') {
              if(!data.data().approved && AUTH.currentUser.displayName){
                navigation.push("NotApprovedScreen");
              }else{
                if(!data.data().ban){
                  writeToWorkerState(data.data());
                  navigation.push("WorkerHomepage");
                }else{
                  navigation.push("BanScreen");
                }
              }
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

  return (
    <Screen scroll keyboardAvoiding contentContainerStyle={styles.content}>
      <View style={styles.brand}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to find trusted help or get hired.</Text>

      <View style={styles.card}>
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
          left={<TextInput.Icon icon="lock-outline" />}
          right={<TextInput.Icon icon={showPass ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowPass(!showPass)} />}
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <TouchableOpacity onPress={() => navigation.push('ForgotPassword')} style={styles.forgot}>
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          loading={loading}
          disabled={loading}
          onPress={() => handleLogIn()}
          style={styles.primaryBtn}
          contentStyle={styles.primaryBtnContent}
          labelStyle={styles.primaryBtnLabel}
        >
          Log in
        </Button>
      </View>

      <View style={styles.registerRow}>
        <Text style={styles.muted}>New to Huduma? </Text>
        <TouchableOpacity onPress={() => navigation.push('RegisterScreen')}>
          <Text style={styles.link}>Create account</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { width: 200, height: 64 },
  title: { ...typography.display, textAlign: 'center' },
  subtitle: { ...typography.muted, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
  forgot: { alignSelf: 'flex-end', marginBottom: spacing.md },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  primaryBtn: { borderRadius: radius.md },
  primaryBtnContent: { height: 50 },
  primaryBtnLabel: { fontSize: 16, fontWeight: '700' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl },
  muted: { ...typography.muted },
});
