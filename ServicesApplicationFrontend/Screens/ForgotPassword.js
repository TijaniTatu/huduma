import { API_URL } from '../config';
import React, { useState, useEffect } from 'react'

import { Alert, StyleSheet, View, Image } from 'react-native';
import { Text, TextInput, Button, Avatar } from 'react-native-paper';

import axios from 'axios';
import Screen from '../components/ui/Screen';
import AppHeader from '../components/ui/AppHeader';
import { colors, spacing, radius, typography, shadow } from '../theme/theme';

export default function ForgotPassword({ navigation }) {

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        setLoading(true);
        if (email == '') {
            Alert.alert('Email cannot be null');
        } else {
            axios.post(`${API_URL}/api/resetpassword`, { email })
                .then(result => {
                    Alert.alert('Reset Link has been sent successfully');
                    navigation.push('LoginScreen');
                })
                .catch(err => {
                    Alert.alert(err.error);
                })
        }
    }

    return (
        <Screen scroll keyboardAvoiding padded={false}>
            <AppHeader onBack={() => navigation.push('LoginScreen')} />
            <View style={styles.body}>
                <Avatar.Icon
                    size={72}
                    icon="lock-reset"
                    color={colors.primary}
                    style={styles.iconWrap}
                />
                <Text style={styles.title}>Forgot your password?</Text>
                <Text style={styles.subtitle}>
                    Enter the email address linked to your account and we'll send you a reset link.
                </Text>

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

                    <Button
                        mode="contained"
                        loading={loading}
                        disabled={loading}
                        onPress={() => handleReset()}
                        style={styles.primaryBtn}
                        contentStyle={styles.primaryBtnContent}
                        labelStyle={styles.primaryBtnLabel}
                    >
                        Send reset link
                    </Button>
                    <Button
                        mode="text"
                        onPress={() => navigation.push('LoginScreen')}
                        textColor={colors.textMuted}
                        style={{ marginTop: spacing.xs }}
                    >
                        Back to login
                    </Button>
                </View>
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    body: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
    iconWrap: {
        alignSelf: 'center',
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: colors.primaryContainer,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    iconText: { fontSize: 32 },
    title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.sm },
    subtitle: { ...typography.muted, textAlign: 'center', lineHeight: 21, marginBottom: spacing.xl },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
    input: { marginBottom: spacing.md, backgroundColor: colors.surface },
    primaryBtn: { borderRadius: radius.md },
    primaryBtnContent: { height: 50 },
    primaryBtnLabel: { fontSize: 16, fontWeight: '700' },
});
