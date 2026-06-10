import { View, StyleSheet } from 'react-native';
import React from 'react';
import { Button, Text, Avatar } from 'react-native-paper';
import Screen from '../../components/ui/Screen';
import { colors, spacing, radius, typography } from '../../theme/theme';

export default function NotApprovedScreen({ navigation }) {
  return (
    <Screen contentContainerStyle={styles.container}>
      <Avatar.Icon size={88} icon="clock-outline" color={colors.primary} style={styles.icon} />
      <Text style={styles.title}>Account pending approval</Text>
      <Text style={styles.message}>
        Your worker account hasn't been approved yet. Complete your profile so our team can verify you faster.
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.replace('WorkerBuildProfileScreen')}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        Complete your profile
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  icon: { backgroundColor: colors.primaryContainer, marginBottom: spacing.lg },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.sm },
  message: { ...typography.muted, textAlign: 'center', lineHeight: 21, marginBottom: spacing.xl },
  button: { borderRadius: radius.md, alignSelf: 'stretch' },
  buttonContent: { height: 50 },
  buttonLabel: { fontSize: 16, fontWeight: '700' },
});
