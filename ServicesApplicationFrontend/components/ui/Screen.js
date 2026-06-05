import React from 'react';
import { View, StyleSheet, StatusBar, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme/theme';

/**
 * Consistent screen scaffold: safe-area, brand background, optional scroll,
 * optional keyboard avoidance, and standard horizontal padding.
 */
export default function Screen({
  children,
  scroll = false,
  padded = true,
  keyboardAvoiding = false,
  edges = ['top', 'bottom'],
  style,
  contentContainerStyle,
  backgroundColor = colors.background,
}) {
  const padStyle = padded && styles.padded;

  let body;
  if (scroll) {
    body = (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, padStyle, contentContainerStyle]}
      >
        {children}
      </ScrollView>
    );
  } else {
    body = <View style={[styles.flex, padStyle, contentContainerStyle]}>{children}</View>;
  }

  if (keyboardAvoiding) {
    body = (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }, style]} edges={edges}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
  scrollContent: { paddingVertical: spacing.lg, flexGrow: 1 },
});
