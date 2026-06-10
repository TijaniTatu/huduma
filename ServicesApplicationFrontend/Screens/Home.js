import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text, TextInput, Button, Switch, HelperText, Menu, Divider } from 'react-native-paper';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius, typography } from '../theme/theme';

export default function Home({navigation}) {


  useEffect(()=>{
    AsyncStorage.getAllKeys()
    .then(data=> console.log(data))
  },[]);

  const handleLogOut = async ()=>{
    AsyncStorage.clear()
    Alert.alert("You've been logged out");
    navigation.push('LoginScreen');
  }

  const clearStorage = async () => {
    AsyncStorage.clear();
    navigation.push("LoginScreen");
  }

  const readStorage = async () => {
    AsyncStorage.getItem("UserDetails")
    .then(result=>{
      if(JSON.parse(result)){
        Alert.alert("Storage on")
      }else {
        Alert.alert("Storage off");
      }
    })
    .catch(err=>{
      Alert.alert("Storage of")
      console.error(err);
    })
  } 


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account & Storage</Text>
      <Text style={styles.subtitle}>Developer utilities</Text>

      <Button mode="contained" icon="logout" onPress={()=> handleLogOut()} style={styles.btn} contentStyle={styles.btnContent} labelStyle={styles.btnLabel}>
        Log out
      </Button>
      <Button mode="outlined" icon="trash-can-outline" onPress={()=> clearStorage()} style={styles.btn} contentStyle={styles.btnContent} textColor={colors.danger}>
        Clear storage
      </Button>
      <Button mode="outlined" icon="database-search-outline" onPress={()=> readStorage()} style={styles.btn} contentStyle={styles.btnContent}>
        Show storage
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.xl, backgroundColor: colors.background },
  title: { ...typography.h1, textAlign: 'center' },
  subtitle: { ...typography.muted, textAlign: 'center', marginBottom: spacing.xl },
  btn: { marginVertical: spacing.xs, borderRadius: radius.md },
  btnContent: { height: 48 },
  btnLabel: { fontWeight: '700' },
});