import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { colors, spacing, typography } from '../../theme/theme';

/**
 * Consistent top bar. Optional back button, title/subtitle, and a right slot
 * (either a custom node via `right`, or an icon button via `rightIcon`/`onRightPress`).
 * Icons are rendered through Paper's IconButton (MaterialCommunityIcons names).
 */
export default function AppHeader({
  title,
  subtitle,
  onBack,
  right,
  rightIcon,
  onRightPress,
  style,
}) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.side}>
        {onBack ? (
          <IconButton icon="chevron-left" size={26} iconColor={colors.text} onPress={onBack} style={styles.iconBtn} />
        ) : null}
      </View>

      <View style={styles.titleWrap}>
        {title ? <Text numberOfLines={1} style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={[styles.side, styles.right]}>
        {right
          ? right
          : rightIcon
          ? <IconButton icon={rightIcon} size={22} iconColor={colors.text} onPress={onRightPress} style={styles.iconBtn} />
          : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: 52,
    backgroundColor: colors.background,
  },
  side: { width: 44, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  iconBtn: { margin: 0 },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { ...typography.h3, color: colors.text },
  subtitle: { ...typography.caption, marginTop: 1 },
});
