import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Dialog, Portal, Button, ActivityIndicator } from 'react-native-paper';

import { AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { setDoc, doc, getDoc, collection, onSnapshot, query, where, getDocs, deleteDoc, } from 'firebase/firestore';
import {writeAskForJobState} from '../../Services/stateService';
import {CheckCollission, CheckAskService} from '../../Services/collissionService';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';

const occupations = [
  { id: '1', name: 'Electrician', icon: require('../../assets/Icons/electrician.png') },
  { id: '2', name: 'Maid', icon: require('../../assets/Icons/maid.jpg') },
  { id: '3', name: 'Gardener', icon: require('../../assets/Icons/gardener.png') },
  { id: '4', name: 'Chef', icon: require('../../assets/Icons/chef.png') },
  { id: '5', name: 'Exterminator', icon: require('../../assets/Icons/exterminator.png') },
  { id: '6', name: 'Plumber', icon: require('../../assets/Icons/plumber.png') },
  { id: '7', name: 'Carpenter', icon: require('../../assets/Icons/carpenter.png') },
  { id: '8', name: 'Pet services', icon: require('../../assets/Icons/dogwalker.png') },
];

const OccupationItem = ({ name, icon, onPress }) => (
  <TouchableOpacity style={styles.occupationItem} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.iconWrap}>
      <Image source={icon} style={styles.icon} />
    </View>
    <Text style={styles.occupationText}>{name}</Text>
  </TouchableOpacity>
);

const JobScreen = ({ navigation }) => {

  const cancelJob = async () => {
    let docRef = doc(FIRESTORE_DB, 'ServiceRequest', AUTH.currentUser.uid);
    await deleteDoc(docRef);
    CheckAskService(AUTH.currentUser.uid)
    .then((collission)=>{
      console.log(collission);
      setLoadingJobRequest(collission);
    });
  }

  useEffect(()=>{
    CheckAskService(AUTH.currentUser.uid)
      .then((collission)=>{
        console.log(collission);
        setLoadingJobRequest(collission);
      });
  },[]);

  const [onJob, setOnJob] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loadingJobRequest, setLoadingJobRequest] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const [serviceWanted, setServiceWanted] = useState('');

  const handleJobPress = (jobType) => {
    console.log("Selected job type:", jobType);
    setServiceWanted(jobType);
    showDialog();
    // Navigation logic or further actions based on jobType
  };

  const handleJobRequest = async () => {
    setLoadingJobRequest(true);
    if(onJob){
      Alert.alert('Alert','You already have a job in queue',
      [{
        text: 'Cancel Job',
        onPress: () => cancelJob()
      }, {
        text:'Close'
      }])
    }else{
      writeAskForJobState({serviceWanted});
      navigation.push("AskServiceScreen");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {loadingJobRequest ?
        (
        <View style={styles.pending}>
          <ActivityIndicator style={{alignSelf:'center'}} animating size={64} color={colors.primary}/>
          <Text style={styles.pendingTitle}>Request sent</Text>
          <Text style={styles.pendingText}>We're matching you with a nearby professional.</Text>
          <Button mode="outlined" onPress={cancelJob} textColor={colors.danger} style={styles.cancelBtn}>Cancel request</Button>
        </View>
        ) :
        (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.heading}>What do you need help with?</Text>
            <Text style={styles.subheading}>Pick a service to find verified professionals near you.</Text>
            <View style={styles.grid}>
              {occupations.map((occupation) => (
                <OccupationItem
                  key={occupation.id}
                  name={occupation.name}
                  icon={occupation.icon}
                  onPress={() => handleJobPress(occupation.name)}
                />
              ))}
            </View>
            <Button mode="text" icon="history" onPress={()=>{ navigation.push('CustomerHistoryScreen')}} textColor={colors.primary} style={styles.historyBtn}>
              View history
            </Button>
            <Portal>
              <Dialog visible={visible} onDismiss={hideDialog} style={{ borderRadius: radius.lg }}>
                <Dialog.Title>Confirm service</Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium" style={{ color: colors.textMuted }}>Do you want to request a {serviceWanted}?</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={hideDialog} textColor={colors.textMuted}>Cancel</Button>
                  <Button mode="contained" onPress={() => handleJobRequest()}>Yes, continue</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </ScrollView>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  heading: { ...typography.h2, marginTop: spacing.sm },
  subheading: { ...typography.muted, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  occupationItem: {
    width: '48%',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: { width: 56, height: 56, borderRadius: radius.sm },
  occupationText: { ...typography.bodyStrong, textAlign: 'center' },
  historyBtn: { marginTop: spacing.sm, alignSelf: 'center' },
  pending: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  pendingTitle: { ...typography.h2, marginTop: spacing.lg },
  pendingText: { ...typography.muted, textAlign: 'center', marginTop: spacing.xs },
  cancelBtn: { marginTop: spacing.xl, borderColor: colors.danger, borderRadius: radius.md },
});

export default JobScreen;
