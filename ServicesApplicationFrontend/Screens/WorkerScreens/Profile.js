import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Text, TextInput, Button, Switch, HelperText, Menu, Divider, ActivityIndicator, Appbar, SegmentedButtons, Chip } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import * as ImagePicker from 'expo-image-picker';
import { AUTH, FIRESTORE_DB, STORAGE } from '../../firebaseConfig';
import { addDoc, collection, setDoc, doc, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';


export default function Profile({ navigation }) {
  useEffect(() => {
    if (AUTH.currentUser.displayName) {
      setProfileSet(true);
      setName(AUTH.currentUser.displayName);
      setImageURL(AUTH.currentUser.photoURL);
      //console.log(AUTH.currentUser);
      const DocRef = doc(FIRESTORE_DB, "Users", AUTH.currentUser.uid);
      getDoc(DocRef)
        .then((res) => {
          setPhoneNumber(res.data().phoneNumber);
          setOccupation(res.data().occupation);
        }).catch((err) => console.error);
    } else {
      setProfileSet(false);
    }
  }, [])
  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';
  const [profileSet, setProfileSet] = useState(false);
  const [buildProfile, setBuildProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [occupation, setOccupation] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+254');
  const [date, setDate] = useState();
  const [open, setOpen] = useState(false);
  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = React.useCallback(
    (params) => {
      setOpen(false);
      setDate(params.date);
    },
    [setOpen, setDate]
  );
  const [image, setImage] = useState();
  const [imageURL, setImageURL] = useState('');

  const getUploadPath = async () => {
    try {
      const UserObject = await AsyncStorage.getItem('user');
      const user = JSON.parse(UserObject);
      return `profilePhotos/${user.user.uid}`;
    } catch (err) {
      console.error(err);
    }
  }

  const getPhotoURL = async () => {
    try {
      const refPath = await getUploadPath();
      const pathReference = ref(STORAGE, refPath);
      const URL = await getDownloadURL(pathReference);
      setImageURL(URL);
      console.log(URL);
      return URL;
    } catch (err) {
      console.error(err);
    }
  }

  const pickImage = async () => {
    let result = ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true
    });

    setImage((await result).assets[0].uri);
    setImageURL((await result).assets[0].uri);
  }

  const uploadImage = async () => {
    setLoading(true);
    if (image == null) {
      console.log('no image');
      setLoading(false);
      return null;
    }
    
  
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;
    console.log(filename);

    const path = `profilePhotos/${AUTH.currentUser.uid}`
    console.log(path);
    const profilePhotoStorage = ref(STORAGE, `${path}`);

    const metadata = {
      contentType: 'image/jpeg'
    }

    fetch(image)
      .then((resp) => {
        resp.blob().then(res => {
          uploadBytes(profilePhotoStorage, res, metadata)
            .then((snap) => {
              console.log('uploaded profile photo');
              getPhotoURL();
              setLoading(false);
            })
            .catch((err) => {
              console.error(err);
            })
        })
      })
  }

  const writeUserToFirestore = async () => {
    try {
      const UserObject = await AsyncStorage.getItem('user');
      const user = JSON.parse(UserObject);
      let uid = user.user.uid;
      let photoURL = await getPhotoURL();
      setDoc(doc(FIRESTORE_DB, 'Users', uid), { name, phoneNumber, date, occupation, photoURL }, { merge: true });
    } catch (err) {
      console.error(err)
    }
  }

  const updateUserProfile = async () => {
    //console.log(AUTH.currentUser);
    setLoading(true);
    updateProfile(AUTH.currentUser, {
      displayName: name, photoURL: await getPhotoURL(),
    }).then((res) => {
      uploadImage();
      writeUserToFirestore();
      navigation.push("LoginScreen");

    }).catch((err) => {
      setLoading(false);
      console.error(err);
    })
  }

  const editProfile = async () => {
    setLoading(true);
    updateProfile(AUTH.currentUser, {
      displayName: name, photoURL: await getPhotoURL(),
    }).then((res) => {
      let uid = AUTH.currentUser.uid;
      let photoURL = imageURL;
      uploadImage();
      setDoc(doc(FIRESTORE_DB, 'Users', uid), { name, phoneNumber, photoURL}, { merge: true });
    }).catch((err) => {
      setLoading(false);
      console.error(err);
    })
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {profileSet ?
        (<>
          {loading ?
            (<View style={styles.center}><ActivityIndicator animating size={56} color={colors.primary} /></View>) :
            (<>
              <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={() => pickImage()} style={styles.avatarWrap} activeOpacity={0.85}>
                  <Image
                    style={styles.image}
                    source={{ uri: imageURL }}
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                  />
                  <View style={styles.cameraBadge}>
                    <MaterialCommunityIcons name="camera" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.userName}>{name}</Text>
                <View style={styles.occRow}>
                  <Chip icon="account-hard-hat" style={styles.occChip} textStyle={{ color: colors.primaryDark }}>{occupation}</Chip>
                </View>
                <View style={styles.card}>
                  <TextInput
                    value={name}
                    onChangeText={(text) => setName(text)}
                    mode='outlined'
                    label='Username'
                    disabled={loading}
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                  />
                  <TextInput
                    value={phoneNumber}
                    onChangeText={(text) => setPhoneNumber(text)}
                    mode='outlined'
                    label='Phone number'
                    keyboardType="phone-pad"
                    disabled={loading}
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                  />
                  <Button mode="contained" disabled={loading} onPress={() => editProfile()} style={styles.primaryBtn} contentStyle={{ height: 50 }} labelStyle={{ fontSize: 16, fontWeight: '700' }}>
                    Update profile
                  </Button>
                </View>
              </ScrollView>
            </>)}
        </>) :
        (<>
          {
            buildProfile ?
              (<>
                <ScrollView style={styles.container}>
                  <KeyboardAvoidingView behavior='position' style={{ flex: 1 }}>
                    <Text>Lets Get You Going</Text>
                    <TouchableOpacity onPress={() => pickImage()}>
                      <Image
                        style={styles.image}
                        source={{ uri: imageURL }}
                        placeholder={{ blurhash }}
                        contentFit="cover"
                        transition={1000}
                      />
                    </TouchableOpacity>
                    <Text>What best describes your occupation </Text>
                    <SegmentedButtons
                      value={occupation}
                      onValueChange={setOccupation}
                      buttons={
                        [
                          {
                            value: 'Electrician',
                            label: 'Electrician'
                          },
                          {
                            value: 'Plumber',
                            label: 'Plumber'
                          },
                          {
                            value: 'Maid',
                            label: 'Maid'
                          }
                        ]
                      }
                    />
                    <TextInput
                      value={name}
                      onChangeText={(text) => setName(text)}
                      mode='outlined'
                      label='user name'
                      disabled={loading}
                    />
                    <TextInput
                      value={phoneNumber}
                      onChangeText={(text) => setPhoneNumber(text)}
                      mode='outlined'
                      label='phone number'
                      disabled={loading}
                    />

                    <TouchableOpacity onPress={() => setOpen(true)}>
                      {date ?
                        (<>
                          <Text style={{ fontSize: 20 }}>
                            D.O.B  {date.toString()}
                          </Text>
                        </>) :
                        (<>
                          <Text style={{ fontSize: 20, }}>
                            Dob
                          </Text>
                        </>)}

                    </TouchableOpacity>
                    <DatePickerModal
                      mode="single"
                      visible={open}
                      onDismiss={onDismissSingle}
                      date={date}
                      onConfirm={onConfirmSingle}
                      label='Select your Birth Date'
                    />
                    {loading ? (<>
                      <ActivityIndicator animating />
                    </>) :
                      (<>
                        <Button onPress={() => navigation.push('WorkerBuildProfileScreen')} mode='elevated'> BUILD PROFILE </Button>
                      </>)}
                  </KeyboardAvoidingView>
                </ScrollView>
              </>)
              :
              (<>
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="account-hard-hat-outline" size={88} color={colors.textFaint} />
                  <Text style={styles.emptyTitle}>Set up your worker profile</Text>
                  <Text style={styles.emptyText}>Add your trade and details so you can start receiving jobs.</Text>
                  <Button mode="contained" onPress={()=>navigation.push('WorkerBuildProfileScreen')} style={styles.emptyBtn} contentStyle={{ height: 50 }} labelStyle={{ fontSize: 16, fontWeight: '700' }}>
                    Build profile
                  </Button>
                </View>
              </>)
          }

        </>)}
    </View>

  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarWrap: { alignSelf: 'center', marginTop: spacing.sm },
  image: {
    width: 128, height: 128, borderRadius: 64, alignSelf: 'center',
    backgroundColor: colors.surfaceAlt, borderWidth: 3, borderColor: colors.surface,
  },
  cameraBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.surface,
  },
  userName: { ...typography.h1, textAlign: 'center', marginTop: spacing.md },
  occRow: { alignItems: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  occChip: { backgroundColor: colors.primaryContainer },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
  primaryBtn: { borderRadius: radius.md, marginTop: spacing.xs },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h2, marginTop: spacing.md, textAlign: 'center' },
  emptyText: { ...typography.muted, marginTop: spacing.xs, marginBottom: spacing.lg, textAlign: 'center' },
  emptyBtn: { alignSelf: 'stretch', borderRadius: radius.md },
});
