import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import Screen from '../components/ui/Screen';
import { colors, spacing, radius, typography } from '../theme/theme';

const SplashScreen = ({ navigation }) => {
  const [showSplash, setShowSplash] = useState(true);
  return (
    <Screen contentContainerStyle={styles.container}>
      {showSplash && (
        <>
          <View style={styles.top}>
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <LottieView
              source={require('../assets/animations/worker-customer.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
            <Text style={styles.title}>Get jobs done, the trusted way</Text>
            <Text style={styles.subtitle}>
              Connect with verified local electricians, plumbers and maids — or get hired for work near you.
            </Text>
          </View>

          <View style={styles.bottom}>
            <Button
              mode="contained"
              onPress={() => navigation.push('LoginScreen')}
              style={styles.cta}
              contentStyle={styles.ctaContent}
              labelStyle={styles.ctaLabel}
            >
              Get started
            </Button>
          </View>
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingVertical: spacing.xxl },
  top: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 220, height: 60, marginBottom: spacing.lg },
  lottie: { width: 240, height: 240, marginBottom: spacing.lg },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.sm, paddingHorizontal: spacing.lg },
  subtitle: { ...typography.muted, textAlign: 'center', lineHeight: 21, paddingHorizontal: spacing.xl },
  bottom: { paddingHorizontal: spacing.lg },
  cta: { borderRadius: radius.md },
  ctaContent: { height: 52 },
  ctaLabel: { fontSize: 16, fontWeight: '700' },
});

export default SplashScreen;
