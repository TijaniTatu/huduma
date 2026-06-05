// NotificationScreen.js

import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, List, Avatar, Divider } from 'react-native-paper';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIRESTORE_DB } from '../firebaseConfig';
import { colors, spacing, radius, typography, shadow } from '../theme/theme';


const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const uid = currentUser.uid;
        const q = query(collection(FIRESTORE_DB, 'notifications'), where('userId', '==', uid));
        const querySnapshot = await getDocs(q);
        const fetchedNotifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(fetchedNotifications);
      } else {
        console.error('No user is signed in');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            titleStyle={styles.itemTitle}
            description={item.body}
            descriptionStyle={styles.itemDesc}
            left={props => <List.Icon {...props} icon="bell-outline" color={colors.primary} />}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Avatar.Icon size={80} icon="bell-sleep-outline" color={colors.textMuted} style={{ backgroundColor: colors.surfaceAlt }} />
            <Text style={styles.emptyMessage}>No notifications yet</Text>
            <Text style={styles.emptySub}>We'll let you know when something happens.</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heading: { ...typography.h1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  itemTitle: { ...typography.bodyStrong },
  itemDesc: { ...typography.muted },
  divider: { backgroundColor: colors.border },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxxl * 2 },
  emptyMessage: { ...typography.h3, marginTop: spacing.lg },
  emptySub: { ...typography.muted, marginTop: spacing.xs },
});

export default NotificationScreen;
