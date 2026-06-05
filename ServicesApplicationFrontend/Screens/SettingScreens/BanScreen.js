import { View, StyleSheet } from 'react-native';
import React from 'react';
import { Button, Text, Avatar } from 'react-native-paper';
import Screen from '../../components/ui/Screen';
import { colors, spacing, radius, typography } from '../../theme/theme';

export default function BanScreen({navigation}) {
    return (
        <Screen contentContainerStyle={styles.container}>
            <Avatar.Icon size={88} icon="account-cancel-outline" color={colors.danger} style={styles.icon} />
            <Text style={styles.title}>Account suspended</Text>
            <Text style={styles.message}>
                Your account has been suspended. If you think this is a mistake, please contact Huduma support.
            </Text>
            <Button
                mode="contained"
                onPress={()=> navigation.replace("LoginScreen")}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
            >
                Back to login
            </Button>
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
    icon: { backgroundColor: colors.dangerContainer, marginBottom: spacing.lg },
    title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.sm },
    message: { ...typography.muted, textAlign: 'center', lineHeight: 21, marginBottom: spacing.xl },
    button: { borderRadius: radius.md, alignSelf: 'stretch' },
    buttonContent: { height: 50 },
    buttonLabel: { fontSize: 16, fontWeight: '700' },
});
