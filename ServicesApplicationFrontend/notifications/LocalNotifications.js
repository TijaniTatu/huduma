import { StyleSheet, Text, View, Button } from "react-native";
import * as Notifications from "expo-notifications";

{
  /*Configure our notification settings:*/
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const generateNotification = async () => {//research if i can have message parameters
  //show the notification to the user
  Notifications.scheduleNotificationAsync({
    //set the content of the notification
    content: {
      title: "Work found",
      body: "A job is being requested",
    },
    trigger: null,
  });
};
return (
    //sample to see if it works....later to be used once a job is clicked
  <View style={styles.container}>
    
    <Button
      title="find job"
      onPress={() => generateNotification()}
    />
  </View>
);