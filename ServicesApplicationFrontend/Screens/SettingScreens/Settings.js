import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, List, Switch, Divider, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const Settings = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);
  const toggleDarkMode = () => setDarkModeEnabled(!darkModeEnabled);
  const handleLogOut = async ()=>{
    AsyncStorage.clear();
    Alert.alert("You've been logged out");
    navigation.replace('LoginScreen');
  }

  const icon = (name, color = colors.primary) => () => <List.Icon icon={name} color={color} />;

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: colors.background }} statusBarHeight={0}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.text} />
        <Appbar.Content title="Settings" titleStyle={{ fontWeight: '700', color: colors.text }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Section title="Preferences">
          <List.Item
            title="Notifications"
            titleStyle={styles.itemTitle}
            left={icon('bell-outline')}
            right={() => <Switch value={notificationsEnabled} onValueChange={toggleNotifications} color={colors.primary} />}
          />
        </Section>

        <Section title="Account">
          <List.Item title="Change password" titleStyle={styles.itemTitle} left={icon('lock-outline')} right={icon('chevron-right', colors.textFaint)} onPress={() => navigation.navigate('ChangePasswordScreen')} />
          <Divider style={styles.divider} />
          <List.Item title="Change email address" titleStyle={styles.itemTitle} left={icon('email-outline')} right={icon('chevron-right', colors.textFaint)} onPress={() => navigation.navigate('ChangeEmailScreen')} />
          <Divider style={styles.divider} />
          <List.Item title="Build profile" titleStyle={styles.itemTitle} left={icon('account-edit-outline')} right={icon('chevron-right', colors.textFaint)} onPress={() => navigation.navigate('BuildProfileScreen')} />
        </Section>

        <Section title="About">
          <List.Item title="About" titleStyle={styles.itemTitle} left={icon('information-outline')} right={icon('chevron-right', colors.textFaint)} onPress={() => navigation.navigate('About')} />
          <Divider style={styles.divider} />
          <List.Item title="Terms & conditions" titleStyle={styles.itemTitle} left={icon('file-document-outline')} right={icon('chevron-right', colors.textFaint)} onPress={() => navigation.navigate('TermsConditions')} />
          <Divider style={styles.divider} />
          <List.Item title="Help & support" titleStyle={styles.itemTitle} left={icon('help-circle-outline')} right={icon('chevron-right', colors.textFaint)} onPress={() => navigation.navigate('HelpSupport')} />
        </Section>

        <Section title="Feedback">
          <List.Item title="Provide feedback" titleStyle={styles.itemTitle} left={icon('message-outline')} right={icon('chevron-right', colors.textFaint)} onPress={() => navigation.navigate('Feedback')} />
        </Section>

        <Section title="Account actions">
          <List.Item
            title="Log out"
            titleStyle={[styles.itemTitle, { color: colors.danger }]}
            left={icon('logout', colors.danger)}
            onPress={() => handleLogOut()}
          />
        </Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.label, marginBottom: spacing.sm, marginLeft: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.soft },
  itemTitle: { ...typography.body, fontWeight: '500' },
  divider: { backgroundColor: colors.border, marginLeft: 56 },
});

export default Settings;
