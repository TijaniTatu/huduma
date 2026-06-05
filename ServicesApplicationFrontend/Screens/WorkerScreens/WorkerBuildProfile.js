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
import * as DocumentPicker from 'expo-document-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';


export default function WorkerBuildProfile({navigation}) {
  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';
  const [profileSet, setProfileSet] = useState(false);
  const [buildProfile, setBuildProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [occupation, setOccupation] = useState('Electrician');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+254');
  const [date, setDate] = useState();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState();
  const [fileName, setFileName] = useState('');
  const [idPhoto, setIdPhoto] = useState();
  const [idPhotoName, setIdPhotoName] = useState('');
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
  const pickCertificate = async () => {
    DocumentPicker.getDocumentAsync({ type: 'application/pdf' })
      .then(res => {
        setFile(res.assets[0].uri)
        setFileName(res.assets[0].name)
      })
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

  const getIDURL = async () => {
    try{
      const URL = await getDownloadURL(ref(STORAGE,`workerID/${AUTH.currentUser.uid}`));
      console.log(URL);
      return URL;
    }catch(err){
      console.error(err);
    }
  }

  const getCertificateURL = async () => {
    try{
      const URL = await getDownloadURL(ref(STORAGE,`workerCertificates/${AUTH.currentUser.uid}`));
      return URL;
    }catch(err){
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

  const pickID = async () => {
    let result = ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true
    });

    setIdPhoto((await result).assets[0].uri);
    setIdPhotoName((await result).assets[0].fileName)
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

  const uploadCertificate = async () => {
    setLoading(true);
    if (file == null) {
      console.log('no file');
      setLoading(false);
      return null;
    }
    const uploadUri = file;
    let filename = fileName;
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;
    console.log(filename);
    const path = `workerCertificates/${AUTH.currentUser.uid}`
    console.log(path);
    const profilePhotoStorage = ref(STORAGE, `${path}`);
    const metadata = {
      contentType: 'application/pdf'
    }
    fetch(file)
      .then((resp) => {
        resp.blob().then(res => {
          uploadBytes(profilePhotoStorage, res, metadata)
            .then((snap) => {
              console.log('uploaded Certificate');
              getCertificateURL();
              setLoading(false);
            })
            .catch((err) => {
              console.error(err);
            })
        })
      })
  }

  const uploadID = async () => {
    setLoading(true);
    if (idPhoto == null) {
      console.log('no image');
      setLoading(false);
      return null;
    }
    const uploadUri = idPhoto;
    let filename = idPhotoName;
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;
    const path = `workerID/${AUTH.currentUser.uid}`
    const profilePhotoStorage = ref(STORAGE, `${path}`);
    const metadata = {
      contentType: 'image/jpeg'
    }
    fetch(idPhoto)
      .then((resp) => {
        resp.blob().then(res => {
          uploadBytes(profilePhotoStorage, res, metadata)
            .then((snap) => {
              console.log('uploaded ID');
              getIDURL();
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
      let idURL = await getIDURL();
      let certificateURL = await getCertificateURL();
      setDoc(doc(FIRESTORE_DB, 'Users', uid), { name, phoneNumber, date, occupation, photoURL, idURL, certificateURL, approved:false, ban:false }, { merge: true });
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
      uploadImage().then(uploadCertificate()).then(uploadID())
      .then(()=> writeUserToFirestore())
      .then(()=> navigation.push("LoginScreen"))
    }).catch((err) => {
      setLoading(false);
      console.error(err);
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Appbar.Header style={{ backgroundColor: colors.background }} statusBarHeight={0}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.text} />
        <Appbar.Content title="Worker profile" titleStyle={{ fontWeight: '700', color: colors.text }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.headerText}>Let's get you hired</Text>
        <Text style={styles.subtitle}>Add your trade and verification documents.</Text>

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
          <Text style={styles.label}>What best describes your trade?</Text>
          <SegmentedButtons
            value={occupation}
            onValueChange={setOccupation}
            style={styles.segmented}
            buttons={[
              { value: 'Electrician', label: 'Electrician' },
              { value: 'Plumber', label: 'Plumber' },
              { value: 'Maid', label: 'Maid' },
            ]}
          />
          <TextInput
            value={name}
            onChangeText={(text) => setName(text)}
            mode='outlined'
            label='Full name'
            disabled={loading}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="account-outline" />}
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
            left={<TextInput.Icon icon="phone-outline" />}
          />

          <TouchableOpacity onPress={() => setOpen(true)} style={styles.fieldRow}>
            <MaterialCommunityIcons name="calendar-outline" size={22} color={colors.textMuted} />
            <Text style={styles.fieldText}>{date ? `Date of birth: ${date.toString().slice(0,15)}` : 'Set date of birth'}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textFaint} />
          </TouchableOpacity>
        </View>

        <DatePickerModal
          mode="single"
          visible={open}
          onDismiss={onDismissSingle}
          date={date}
          onConfirm={onConfirmSingle}
          label='Select your Birth Date'
        />

        {loading ? (
          <View style={styles.center}><ActivityIndicator animating color={colors.primary} size={48} /></View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Verification documents</Text>
            <View style={styles.card}>
              <View style={styles.uploadRow}>
                <MaterialCommunityIcons name={idPhotoName ? 'check-circle' : 'card-account-details-outline'} size={24} color={idPhotoName ? colors.success : colors.textMuted} />
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadTitle}>National ID (front)</Text>
                  <Text style={styles.uploadMeta} numberOfLines={1}>{idPhotoName || 'No file selected'}</Text>
                </View>
                <Button onPress={() => pickID()} mode='contained-tonal' compact>Pick</Button>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.uploadRow}>
                <MaterialCommunityIcons name={fileName ? 'check-circle' : 'file-document-outline'} size={24} color={fileName ? colors.success : colors.textMuted} />
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadTitle}>Trade certificate (PDF)</Text>
                  <Text style={styles.uploadMeta} numberOfLines={1}>{fileName || 'No file selected'}</Text>
                </View>
                <Button onPress={() => pickCertificate()} mode='contained-tonal' compact>Pick</Button>
              </View>
            </View>
            <Button onPress={() => updateUserProfile()} mode='contained' style={styles.buildBtn} contentStyle={{ height: 50 }} labelStyle={{ fontSize: 16, fontWeight: '700' }}>Build profile</Button>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  headerText: { ...typography.h1, textAlign: 'center', marginTop: spacing.xs },
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
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card, marginBottom: spacing.lg },
  label: { ...typography.label, marginBottom: spacing.sm },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm, marginLeft: spacing.xs },
  segmented: { marginBottom: spacing.md },
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  fieldText: { ...typography.body, flex: 1, marginLeft: spacing.md },
  uploadRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  uploadInfo: { flex: 1, marginLeft: spacing.md },
  uploadTitle: { ...typography.bodyStrong },
  uploadMeta: { ...typography.caption },
  divider: { backgroundColor: colors.border, marginVertical: spacing.xs },
  buildBtn: { borderRadius: radius.md },
});
