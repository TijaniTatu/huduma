import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Text, Button, ActivityIndicator } from 'react-native-paper';

import { StyleSheet, View } from 'react-native';
import * as Location from "expo-location";
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const InitialRegion = {
    latitude: -1.2918808496837835,
    longitude: 36.814434219500434,
    latitudeDelta: 2,
    longitudeDelta: 2
}

export default function MapScreen(props) {

    const [currentLocation, setCurrentLocation] = useState(null);
    const [initialRegion, setInitialRegion] = useState(null);
    const [locationName, setLocationName] = useState();

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
            let {latitude, longitude} = location.coords;
            //console.log(await (Location.reverseGeocodeAsync({location, longitude})));
            let AreaName = await Location.reverseGeocodeAsync({latitude, longitude});
            setLocationName(AreaName[0].formattedAddress);
            setInitialRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
            props.setStateCurrentLocation(location.coords);
            
        }
        getLocation();
    }, []);
    const updateRegion = async (region) => {
        setCurrentLocation(region);
        let {latitude, longitude} = currentLocation;
        let AreaName = await Location.reverseGeocodeAsync({latitude, longitude});
        setLocationName(AreaName[0].formattedAddress);
        props.setState(AreaName[0].formattedAddress);
    }
    return (
        <View style={styles.container}>
            {initialRegion ? (
                <MapView style={styles.map} initialRegion={initialRegion} onRegionChangeComplete={(region)=> updateRegion(region)}>
                    {currentLocation && (
                        <Marker
                            coordinate={{
                                latitude: currentLocation.latitude,
                                longitude: currentLocation.longitude,
                            }}
                            title="Your Location"
                        />
                    )}
                </MapView>
            ) : (
                <View style={styles.loading}>
                    <ActivityIndicator animating size={48} color={colors.primary} />
                    <Text style={styles.loadingText}>Getting your location…</Text>
                </View>
            )}
            {locationName ? (
                <View style={styles.pill}>
                    <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
                    <Text style={styles.pillText} numberOfLines={1}>{locationName}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceAlt,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { ...typography.muted, marginTop: spacing.md },
    pill: {
        position: 'absolute',
        bottom: spacing.md,
        left: spacing.md,
        right: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.pill,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        ...shadow.card,
    },
    pillText: { ...typography.bodyStrong, marginLeft: spacing.xs, flexShrink: 1 },
});
