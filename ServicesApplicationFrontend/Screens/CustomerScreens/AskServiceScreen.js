import { View, TouchableOpacity, KeyboardAvoidingView, StyleSheet, SafeAreaView, ScrollView, Alert, Platform } from 'react-native';
import { Text, Button, TextInput, Appbar, ActivityIndicator, Menu, Switch } from 'react-native-paper';
import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CameraView, useCameraPermissions, getCameraPermissionsAsync } from 'expo-camera';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapScreen from './MapScreen';
import * as Location from "expo-location";
import { STORAGE } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { writeAskForJobState, getAskForJobState, cleatAskForJobState, readCustomerState } from '../../Services/stateService';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';

const TakePhotos = (props) => {
    const cameraRef = useRef();
    const [permission, requestPermission] = useCameraPermissions();
    useEffect(() => {
        requestPermission();
        __startCamera();
    }, [])

    const __startCamera = async () => {
        const { status } = await getCameraPermissionsAsync();
        if (status === 'granted') {
            // do something
        } else {
            Alert.alert("Access denied")
        }
    }

    const __takePicture = async () => {
        const photo = await cameraRef.current.takePictureAsync();
        props.setStateImage(photo.uri)
        props.closeCamera(false);
    }

    return (
        <View style={{ flex: 1 }}>
            <CameraView ref={cameraRef} style={{ flex: 1 }} />
            <Button onPress={() => __takePicture()}> Take photo </Button>
            <Button onPress={() => props.closeCamera(false)}> Go Back </Button>
        </View>
    )
}

let serviceWanted = getAskForJobState().serviceWanted;

export default function AskServiceScreen({ navigation }) {

    const [isPickingPhoto, setIsPickingPhoto] = useState(false);
    const [isSettingLocation, setIsSettingLocation] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('');
    const [locationName, setLocationName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState();
    const [imageURL, setImageURL] = useState();
    const [loading, setLoading] = useState();
    const [urgency, setUrgency] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [deviceBroken, setDeviceBroken] = useState(false);
    const [deviceType, setDeviceType] = useState('');
    const [deviceModel, setDeviceModel] = useState('');
    const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

    const getUploadPath = async () => {
        try {
            const uid = AUTH.currentUser.uid;
            return `ServiceRequestPhotos/${uid}`;
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
        };

        fetch(image)
            .then((resp) => {
                resp.blob().then(res => {
                    uploadBytes(profilePhotoStorage, res, metadata)
                        .then(async () => {
                            setImageURL(await getPhotoURL());
                        })
                        .catch((err) => {
                            console.error(err);
                        })
                })
            })
    }

    const PushToFirestore = async () => {
        setLoading(true);
        await uploadImage();
        let ServiceRequestRef = doc(FIRESTORE_DB, 'ServiceRequest', AUTH.currentUser.uid);
        let phoneNumber = readCustomerState().phone_number;
        let uid = AUTH.currentUser.uid
        let clientName = AUTH.currentUser.displayName;
        let imageURL = await getPhotoURL();
        let ServiceWanted = await getAskForJobState().serviceWanted;
        let DateObject = new Date();
        let date = DateObject.toISOString();
        let time = selectedTime.toISOString().split('T')[1].split('.')[0];
        let appointmentDate = selectedDate.toISOString().split('T')[0];

        setDoc(ServiceRequestRef, {
            uid, clientName, imageURL, ServiceWanted, description, locationName, date, deviceBroken,
            deviceType,
            deviceModel, currentLocation, phoneNumber
        }, { merge: true })
            .then(() => {
                navigation.replace('CustomerHomepage');
            }).catch(err => {
                setLoading(false);
                console.error(err);
            })
    }

    const onTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate || selectedTime;
        setShowTimePicker(false);
        setSelectedTime(currentDate);
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || selectedDate;
        setShowDatePicker(false);
        setSelectedDate(currentDate);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Appbar.Header style={{ backgroundColor: colors.background }} statusBarHeight={0}>
                <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.text} />
                <Appbar.Content title="Request details" titleStyle={{ fontWeight: '700', color: colors.text }} />
            </Appbar.Header>

            {loading ?
                (<View style={styles.loadingContainer}>
                    <ActivityIndicator size={48} animating color={colors.primary} />
                </View>
                ) : (
                    <>
                        {isPickingPhoto || isSettingLocation ? (
                            <>
                                {isPickingPhoto ? (
                                    <TakePhotos closeCamera={setIsPickingPhoto} setStateImage={(val) => setImage(val)} />
                                ) : (
                                    <View style={{ flex: 1, padding: spacing.lg }}>
                                        <MapScreen
                                            setState={(val) => setLocationName(val)}
                                            setStateCurrentLocation={(val) => setCurrentLocation(val)}
                                        />
                                        <Button mode="contained" onPress={() => setIsSettingLocation(false)} style={styles.submitButton} contentStyle={{ height: 50 }} labelStyle={{ fontWeight: '700' }}>Use this location</Button>
                                    </View>
                                )}
                            </>
                        ) : (
                            <KeyboardAvoidingView
                                behavior={Platform.OS === "ios" ? "padding" : "height"}
                                style={{ flex: 1 }}
                            >
                                <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                                    <Text style={styles.title}>{serviceWanted} details</Text>
                                    <Text style={styles.subtitle}>Add a photo and describe what you need.</Text>

                                    <TouchableOpacity onPress={() => setIsPickingPhoto(!isPickingPhoto)} activeOpacity={0.85} style={styles.photoBox}>
                                        {image ? (
                                            <Image style={styles.image} source={{ uri: image }} placeholder={{ blurhash }} contentFit="cover" transition={1000} />
                                        ) : (
                                            <View style={styles.photoPlaceholder}>
                                                <MaterialCommunityIcons name="camera-plus-outline" size={36} color={colors.textMuted} />
                                                <Text style={styles.photoHint}>Add a photo</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.card}>
                                        <View style={styles.switchRow}>
                                            <Text style={styles.label}>Is it a broken appliance?</Text>
                                            <Switch value={deviceBroken} onValueChange={() => setDeviceBroken(!deviceBroken)} color={colors.primary} />
                                        </View>

                                        {deviceBroken && (
                                            <>
                                                <TextInput
                                                    label="Appliance type"
                                                    value={deviceType}
                                                    onChangeText={(text) => setDeviceType(text)}
                                                    style={styles.input}
                                                    mode="outlined"
                                                    outlineColor={colors.border}
                                                    activeOutlineColor={colors.primary}
                                                />
                                                <TextInput
                                                    label="Appliance model"
                                                    value={deviceModel}
                                                    onChangeText={(text) => setDeviceModel(text)}
                                                    style={styles.input}
                                                    mode="outlined"
                                                    outlineColor={colors.border}
                                                    activeOutlineColor={colors.primary}
                                                />
                                            </>
                                        )}

                                        <TextInput
                                            label="Describe the issue"
                                            value={description}
                                            onChangeText={(text) => setDescription(text)}
                                            style={styles.input}
                                            mode="outlined"
                                            multiline
                                            numberOfLines={4}
                                            outlineColor={colors.border}
                                            activeOutlineColor={colors.primary}
                                        />

                                        <Menu
                                            visible={showMenu}
                                            onDismiss={() => setShowMenu(false)}
                                            anchor={<Button mode="outlined" icon="alert-outline" onPress={() => setShowMenu(true)} style={styles.selectBtn} textColor={colors.text}>{urgency ? `Urgency: ${urgency}` : "Select urgency"}</Button>}
                                        >
                                            <Menu.Item onPress={() => { setUrgency("Low"); setShowMenu(false); }} title="Low" />
                                            <Menu.Item onPress={() => { setUrgency("Medium"); setShowMenu(false); }} title="Medium" />
                                            <Menu.Item onPress={() => { setUrgency("High"); setShowMenu(false); }} title="High" />
                                        </Menu>

                                        <Button mode="outlined" icon="map-marker-outline" onPress={() => setIsSettingLocation(!isSettingLocation)} style={styles.selectBtn} textColor={colors.text}>
                                            {locationName ? locationName : "Set location"}
                                        </Button>
                                    </View>
                                </ScrollView>
                                <View style={styles.footer}>
                                    <Button
                                        mode="contained"
                                        onPress={() => PushToFirestore()}
                                        style={styles.submitButton}
                                        contentStyle={{ height: 50 }}
                                        labelStyle={{ fontSize: 16, fontWeight: '700' }}
                                    >
                                        Request service
                                    </Button>
                                </View>
                            </KeyboardAvoidingView>
                        )}
                    </>
                )
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollViewContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
    title: { ...typography.h2, marginTop: spacing.sm },
    subtitle: { ...typography.muted, marginBottom: spacing.lg },
    photoBox: { borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.lg },
    image: { width: '100%', height: 200, borderRadius: radius.lg },
    photoPlaceholder: {
        width: '100%', height: 160, borderRadius: radius.lg,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
        alignItems: 'center', justifyContent: 'center',
    },
    photoHint: { ...typography.muted, marginTop: spacing.sm },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    label: { ...typography.bodyStrong, flex: 1 },
    input: { marginVertical: spacing.sm, backgroundColor: colors.surface },
    selectBtn: { marginTop: spacing.sm, borderColor: colors.border, borderRadius: radius.md, justifyContent: 'flex-start' },
    footer: { padding: spacing.lg, backgroundColor: colors.background },
    submitButton: { borderRadius: radius.md },
    locationText: { ...typography.body, padding: spacing.sm },
});

