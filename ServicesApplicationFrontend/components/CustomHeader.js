import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const CustomHeader = ({ username, onSettingsPress, onNotificationsPress, onProfilePress }) => {
  return (
    <SafeAreaView style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <Text style={styles.welcomeText}>Welcome, {username}</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={onNotificationsPress} style={styles.iconButton}>
            <MaterialCommunityIcons name="bell" color="#888888" size={26} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSettingsPress} style={styles.iconButton}>
            <MaterialCommunityIcons name="cog" color="#888888" size={26} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onProfilePress} style={styles.iconButton}>
            <MaterialCommunityIcons name="account-circle" color="#888888" size={26} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.separator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    elevation: 4, // shadow for Android
    shadowColor: '#000', // shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
  },
});

export default CustomHeader;
