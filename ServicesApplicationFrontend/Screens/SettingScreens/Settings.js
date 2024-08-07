import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, List, Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';


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

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      <ScrollView>
        <List.Section>
          <List.Subheader>Preferences</List.Subheader>
          <List.Item
            title="Notifications" //backend required 
            right={() => (
              <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
            )}
          />

          {/* <List.Item
            title="Language"
            description="English"
            onPress={() => navigation.navigate('LanguageSettings')}
            left={() => <List.Icon icon="translate" />}
          /> */}
        </List.Section>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Change Password"
            onPress={() => navigation.navigate('ChangePasswordScreen')}//create a reset password screen...maybe can be similar to the forgot password
            left={() => <List.Icon icon="lock" />}
          />
          <List.Item
            title="Change Email Address"
            onPress={() => navigation.navigate('ChangeEmailScreen')}//STONIE should create a screen
            left={() => <List.Icon icon="shield-lock" />}
          />
          <List.Item
            title="Build Profile"
            onPress={() => navigation.navigate('BuildProfileScreen')}//sample screens from gpt
            left={() => <List.Icon icon="shield" />}
          />
        </List.Section>
        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="About"
            onPress={() => navigation.navigate('About')}
            left={() => <List.Icon icon="information" />}
          />
          <List.Item
            title="Terms & Conditions"
            onPress={() => navigation.navigate('TermsConditions')}
            left={() => <List.Icon icon="file-document" />}
          />
          <List.Item
            title="Help & Support"
            onPress={() => navigation.navigate('HelpSupport')}
            left={() => <List.Icon icon="help-circle" />}
          />
        </List.Section>
        <List.Section>
          <List.Subheader>Feedback</List.Subheader>
          <List.Item
            title="Provide Feedback"
            onPress={() => navigation.navigate('Feedback')}
            left={() => <List.Icon icon="message" />}
          />
        </List.Section>
        <List.Section>
          <List.Subheader>Account Actions</List.Subheader>
          <List.Item
            title="Logout"
            onPress={() => handleLogOut()}
            left={() => <List.Icon icon="logout" />}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default Settings;
