import React, { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import { Text, Button, TextInput, Snackbar, Paragraph, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE } from '../../firebaseConfig';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone_number, setPhone_number] = useState('+254');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [secEmail, setSecEmail] = useState('');
  const [dob, setDob] = useState(new Date()); // Default to current date
  const [username, setUsername] = useState('');
  const [imageURL, setImageURL] = useState();
  const [image, setImage] = useState()
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [profileExists, setProfileExists] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); // State to show/hide date picker
  const [loading, setLoading] = useState(false);
  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  const loadUserProfile = async () => {
    if (AUTH.currentUser.displayName) {
      setProfileExists(true);
      setName(AUTH.currentUser.displayName);
      getPhotoURL();
      setEmail(AUTH.currentUser.email);
      const DocRef = doc(FIRESTORE_DB, "Users", AUTH.currentUser.uid);
      getDoc(DocRef)
        .then((res) => {
          setPhone_number(res.data().phone_number);
          setAddress(res.data().locationName);
          setSecEmail(res.data().secondaryEmail);
          console.log(new Date(res.data().date).getDate());
          setDob(res.data().date.toString());
        }).catch((err) => console.error);
    } else {
      setProfileExists(false);
    }
  
  }


  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    LocalAuthentication.authenticateAsync({ promptMessage: "Scan your Biometrics to continue" })
      .then(async(biometrics)=>{
        if(biometrics.success){
          uploadImage();
          let uploadURL = await getPhotoURL();
          updateProfile(AUTH.currentUser, {
            displayName: name, photoURL: uploadURL
          }).then((res) => {
            setDoc(doc(FIRESTORE_DB, 'Users', AUTH.currentUser.uid), { phone_number, address, secEmail, photoURL: uploadURL }, { merge: true })
              .then((resp) => {
                setLoading(false);
                setEditMode(false);
              })
              .catch((err) => console.error);
          }).catch((err) => {
            console.error(err);
          })
        }else{
          Alert.alert('Biometrics scan failed');
        }
      })


  };

  const pickImage = async () => {
    let result = ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true
    });

    setImageURL((await result).assets[0].uri);
    setImage((await result).assets[0].uri)
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
      return URL;
    } catch (err) {
      console.error(err);
    }
  }

  const uploadImage = async () => {
    console.log('I get called')
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
            .then(async (snap) => {
              console.log('uploaded profile photo');
              console.log(await getPhotoURL());
              setImageURL(await getPhotoURL());
            })
            .catch((err) => {
              console.error(err);
            })
        })
      })
  }

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const hideDatePickerModal = () => {
    setShowDatePicker(false);
  };

  const handleDateChange = (selectedDate) => {
    const currentDate = selectedDate || dob;
    hideDatePickerModal();
    setDob(currentDate);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {profileExists ? (
        <View style={styles.profileContainer}>
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
          <View style={styles.header}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
          <View style={styles.content}>
            <TextInput
              label="Name"
              value={name}
              onChangeText={(text) => setName(text)}
              editable={editMode}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
            <TextInput
              label="Phone Number"
              value={phone_number}
              onChangeText={(text) => setPhone_number(text)}
              editable={editMode}
              keyboardType="phone-pad"
              style={styles.input}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
            <TextInput
              label="Address"
              value={address}
              onChangeText={(text) => setAddress(text)}
              editable={editMode}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
            <TextInput
              label="Secondary Email"
              value={secEmail}
              onChangeText={(text) => setSecEmail(text)}
              editable={editMode}
              keyboardType="email-address"
              style={styles.input}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
            <TouchableOpacity onPress={showDatePickerModal}>
              <TextInput
                label="Date of Birth"
                value={dob}
                editable={false}
                style={styles.input}
                mode="outlined"
              />
            </TouchableOpacity>

            <Portal>
              <Modal visible={showDatePicker} onDismiss={hideDatePickerModal} contentContainerStyle={styles.modal}>
                <View>
                  <DateTimePicker
                    value={dob || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => handleDateChange(selectedDate)}
                  />
                  <Button mode="contained" onPress={hideDatePickerModal} style={styles.modalButton}>
                    Done
                  </Button>
                </View>
              </Modal>
            </Portal>

            {loading ?
              (<>
                <ActivityIndicator />
              </>) : (<>
                <Button mode="contained" style={styles.editButton} onPress={() => setEditMode(!editMode)}>
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
                {editMode && (
                  <Button mode="contained" style={styles.saveButton} onPress={()=> handleSaveProfile()}>
                    Save Changes
                  </Button>
                )}
              </>)}

          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-circle-outline" size={88} color={colors.textFaint} />
          <Text style={styles.noProfileTitle}>Build your profile</Text>
          <Text style={styles.noProfileText}>Add your details so workers can reach and serve you.</Text>
          <Button
            mode="contained"
            style={styles.buildProfileButton}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
            onPress={() => navigation.push('BuildProfileScreen')}
          >
            Build profile
          </Button>
        </View>
      )}
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  profileContainer: {},
  avatarWrap: { alignSelf: 'center', marginTop: spacing.sm },
  image: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignSelf: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  header: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
  userName: { ...typography.h1, textAlign: 'center' },
  userEmail: { ...typography.muted, marginTop: spacing.xs, textAlign: 'center' },
  content: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
  editButton: { marginTop: spacing.md, borderRadius: radius.md },
  saveButton: { marginTop: spacing.sm, borderRadius: radius.md },
  buildProfileButton: { alignSelf: 'stretch', marginTop: spacing.lg, borderRadius: radius.md },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxxl },
  noProfileTitle: { ...typography.h2, marginTop: spacing.md },
  noProfileText: { textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.sm, ...typography.muted },
  modal: { backgroundColor: colors.surface, padding: spacing.lg, margin: spacing.lg, borderRadius: radius.lg },
});

export default ProfileScreen;
