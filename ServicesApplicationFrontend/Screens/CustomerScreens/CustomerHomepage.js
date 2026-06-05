import React, { useState, useEffect } from 'react';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Alert, StyleSheet, View } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Dialog, Appbar, List, Switch } from 'react-native-paper';

import JobScreen from './Jobs';
import ProfileScreen from './Profile';
import ActivityScreen from './Activity';
import { AUTH, FIRESTORE_DB } from '../../firebaseConfig';

import {readCustomerState, writeToCustomerState, clearCustomerState} from '../../Services/stateService'
import { colors } from '../../theme/theme';
const Tab = createMaterialBottomTabNavigator();

const CustomerHomepage = ({ navigation }) => {
  let customerUser = readCustomerState();
  const [username, setUsername] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    // Function to fetch username from AsyncStorage or backend API
    fetchUsername();
  }, [username]);

  const fetchUsername = async () => {
    setUsername(AUTH.currentUser.displayName);
    console.log(customerUser);
  };

  return (
    <>
      <Appbar.Header mode='small' collapsable={true} style={{ backgroundColor: colors.surface }} statusBarHeight={0}>
        <Appbar.Content title={username ? `Hi, ${username}` : 'Welcome'} titleStyle={{ fontWeight: '700', color: colors.text }} />
        <Appbar.Action icon="cog-outline" onPress={() => {navigation.push("Settings")}} />
      </Appbar.Header>
      <Tab.Navigator
        initialRouteName="Jobs"
        activeColor={colors.primary}
        inactiveColor={colors.textMuted}
        barStyle={{ backgroundColor: colors.surface }}
      >
        <Tab.Screen
          name="Jobs"
          component={JobScreen}
          options={{
            tabBarLabel: 'Jobs',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="briefcase"
                color={color}
                size={26}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Activity"
          component={ActivityScreen}
          options={{
            tabBarLabel: 'Activity',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="clock"
                color={color}
                size={26}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="account"
                color={color}
                size={26}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", marginHorizontal: 30 },
  input: { marginVertical: 5, borderRadius: 0 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 20,
    justifyContent: "space-between",
  },
  textContainer: { alignContent: 'center', alignItems: 'center' }

});

export default CustomerHomepage;