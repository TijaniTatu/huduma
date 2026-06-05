import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef, useEffect } from 'react';
import { Alert, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Button, Switch, HelperText, Menu, Divider, ActivityIndicator, Appbar } from 'react-native-paper';
import { Image } from 'expo-image';

import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from "expo-location";

import axios from 'axios';
import { app, auth } from '../firebaseConfig';
import { signInWithPhoneNumber } from 'firebase/auth';
import VerifyPhone from './VerifyPhone';
import { DatePickerModal } from 'react-native-paper-dates';
import { STORAGE, AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { addDoc, collection, setDoc, doc, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import MapScreen from './CustomerScreens/MapScreen';

import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../theme/theme';

export default function BuildProfile({ navigation }) {

  const [uid, setUID] = useState('');
  const [username, setUserName] = useState('');
  const [phone_number, setPhone_number] = useState('+254');
  const [image, setImage] = useState();
  const [imageURL, setImageURL] = useState();

  const [email, setEmail] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [waitVerify, setWaitVerify] = useState(true);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [date, setDate] = useState();
  const [open, setOpen] = useState(false);
  const [mapViewOpen, setMapViewOpen] = useState(false);
  const recaptchaVerifier = useRef(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [locationName, setLocationName] = useState('');

  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      //console.log(location);
      let { latitude, longitude } = location.coords;
      //console.log(await (Location.reverseGeocodeAsync({location, longitude})));
      let AreaName = await Location.reverseGeocodeAsync({ latitude, longitude });
      setLocationName(AreaName[0].formattedAddress);
      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
    getLocation();
  }, []);


  const verifyCode = async (code) => {
    setVerifyLoading(true);
    if (confirmationResult) {
      try {
        const userCredential = await confirmationResult.confirm(code);
        console.log('Verified');
        //send request to build profile
        //push to homepage
        AsyncStorage.getItem('UserDetails')
          .then(UserDetails => {
            let UserObject = JSON.parse(UserDetails);
            console.log(Object.keys(UserObject.data.userCredential.user))
            setUID(UserObject.data.userCredential.user.uid);
            setEmail(UserObject.data.userCredential.user.email);


            //Send this request after SMS verification

            axios.post(`${API_URL}/api/buildprofile`, { uid, username, phone_number, email })

              .then(response => {
                //go to build profile
                //store details in async storage
                navigation.push('HomeScreen');
              }).catch(err => {
                //somehow alert the user there's an error
                console.error(err);
              })

          })
          .catch(err => {
            console.error(err);
          })
      } catch (error) {
        setVerifyLoading(false);
        console.error(error);
        setVerificationWrong(true);
      }
    } else {
    }
  };

  const handleNext = async () => {

    // fetch uuid and email from AsyncStorage
    setLoading(true);
    setWaitVerify(!waitVerify);
    signInWithPhoneNumber(auth, phone_number, recaptchaVerifier.current)
      .then(result => {
        setWaitVerify(true);
        setConfirmationResult(result);
      })
      .catch(err => {
        console.error(err);
      })
    /*AsyncStorage.getItem('UserDetails')
      .then(UserDetails => {
        let UserObject = JSON.parse(UserDetails);
        console.log(Object.keys(UserObject.data.userCredential.user))
        setUID(UserObject.data.userCredential.user.uid);
        setEmail(UserObject.data.userCredential.user.email);


        //Send this request after SMS verification
        axios.post(`${API_URL}/api/buildprofile`, { uid, username, phone_number, email })
          .then(response => {
            //go to build profile
            //store details in async storage
            navigation.push('HomeScreen');
          }).catch(err => {
            //somehow alert the user there's an error
            console.error(err);
          })

      })
      .catch(err => {
        console.error(err);
      }) */
  }

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

  const uploadImage = async () => {
    if (image == null) {
      return null;
    }
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;
    console.log(filename);

    const path = await getUploadPath();
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
      setDoc(doc(FIRESTORE_DB, 'Users', uid), { username, phone_number, date, currentLocation, locationName, secondaryEmail }, { merge: true });
    } catch (err) {
      console.error(err)
    }
  }

  const updateUserProfile = async () => {
    console.log(AUTH.currentUser);

    updateProfile(AUTH.currentUser, {
      displayName: username, photoURL: await getPhotoURL(),
    }).then((res) => {
      uploadImage();
      writeUserToFirestore();
      navigation.push("LoginScreen");
      console.log(res)
    }).catch((err) => {
      console.error(err);
    })
  }

  const handleLocationUpdate = () => {
    setMapViewOpen(!mapViewOpen)
    if (currentLocation) {
      console.log(currentLocation);
    }
  }

  return (
    <View style={styles.container}>

      <Appbar.Header mode='small' collapsable={true} style={{ backgroundColor: colors.background }} statusBarHeight={0}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.text} />
        <Appbar.Content title="Build profile" titleStyle={{ fontWeight: '700', color: colors.text }} />
        <Appbar.Action icon="cog-outline" color={colors.text} onPress={() => { navigation.push("Settings") }} />
      </Appbar.Header>

      {loading ?
        (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.headerText}>Let's get you set up</Text>
          <Text style={styles.subtitle}>Add your details so workers can reach you.</Text>

          <TouchableOpacity onPress={() => pickImage()} style={styles.avatarWrap} activeOpacity={0.85}>
            {imageURL ? (
              <Image style={styles.image} source={{ uri: imageURL }} placeholder={{ blurhash }} contentFit="cover" transition={1000} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <MaterialCommunityIcons name="account-plus-outline" size={40} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <MaterialCommunityIcons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              value={username}
              label='Full name'
              onChangeText={(text) => setUserName(text)}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              left={<TextInput.Icon icon="account-outline" />}
            />
            <TextInput
              style={styles.input}
              value={phone_number}
              label='Phone number'
              keyboardType="phone-pad"
              onChangeText={(text) => setPhone_number(text)}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              left={<TextInput.Icon icon="phone-outline" />}
            />
            <TextInput
              style={styles.input}
              value={secondaryEmail}
              label='Secondary email'
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(text) => setSecondaryEmail(text)}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              left={<TextInput.Icon icon="email-outline" />}
            />

            <TouchableOpacity onPress={() => setOpen(true)} style={styles.fieldRow}>
              <MaterialCommunityIcons name="calendar-outline" size={22} color={colors.textMuted} />
              <Text style={styles.fieldText}>{date ? `Date of birth: ${date.toString().slice(0,15)}` : 'Set date of birth'}</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textFaint} />
            </TouchableOpacity>

            <DatePickerModal
              locale="en"
              mode="single"
              visible={open}
              onDismiss={onDismissSingle}
              date={date}
              onConfirm={onConfirmSingle}
            />

            {mapViewOpen ?
              (<View style={styles.mapBox}>
                <MapScreen
                  setState={(val) => setLocationName(val)}
                  setStateCurrentLocation={(val) => setCurrentLocation(val)}
                />
              </View>) : null}

            <TouchableOpacity onPress={() => handleLocationUpdate()} style={styles.fieldRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={22} color={colors.textMuted} />
              <Text style={styles.fieldText} numberOfLines={1}>
                {mapViewOpen ? 'Use this location' : (locationName ? locationName : 'Set home location')}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textFaint} />
            </TouchableOpacity>
          </View>

          <Button mode='contained' style={styles.continueBtn} contentStyle={{ height: 50 }} labelStyle={{ fontSize: 16, fontWeight: '700' }} onPress={() => updateUserProfile()}>Continue</Button>
        </ScrollView>
        ) :
        (<>
          {verifyLoading ?
            (<View style={styles.center}><ActivityIndicator animating={true} color={colors.primary} size={48} /></View>) :
            (<>
              <VerifyPhone
                onVerify={verifyCode}
                onVerificationRetry={() => {
                  setConfirmationResult(null);
                  setVerificationWrong(false);
                  setIsVerifying(false);
                }}
              />
            </>)}

        </>)}


    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerText: { ...typography.h1, textAlign: 'center', marginTop: spacing.sm },
  subtitle: { ...typography.muted, textAlign: 'center', marginBottom: spacing.lg },
  avatarWrap: { alignSelf: 'center', marginBottom: spacing.lg },
  image: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', backgroundColor: colors.surfaceAlt },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  fieldText: { ...typography.body, flex: 1, marginLeft: spacing.md },
  mapBox: { height: 240, borderRadius: radius.md, overflow: 'hidden', marginVertical: spacing.md },
  continueBtn: { borderRadius: radius.md, marginTop: spacing.lg },
});
