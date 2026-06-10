
import React, { useEffect } from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { paperTheme, colors } from "../theme/theme";

// Render all react-native-paper icons through @expo/vector-icons, which bundles
// and auto-loads the MaterialCommunityIcons font (react-native-vector-icons does
// not auto-load fonts in Expo, which showed icons as missing-glyph boxes).
const paperSettings = { icon: (props) => <MaterialCommunityIcons {...props} /> };

import Login from "../Screens/Login";
import Register from "../Screens/Register";
import BuildProfile from "../Screens/BuildProfile";
import Home from "../Screens/Home";
import ForgotPassword from "../Screens/ForgotPassword";
import SplashScreen from "../Screens/SplashScreen";
import WorkerHomepage from "../Screens/WorkerScreens/WorkerHomepage";
import CustomerHomepage from "../Screens/CustomerScreens/CustomerHomepage";
import Settings from "../Screens/SettingScreens/Settings";
import ChangePassword from "../Screens/SettingScreens/ChangePassword";
import ChangeEmail from "../Screens/SettingScreens/ChangeEmail";
import MapScreen from "../Screens/CustomerScreens/MapScreen";
import Profile from "../Screens/WorkerScreens/Profile";
import AskServiceScreen from "../Screens/CustomerScreens/AskServiceScreen";
import CustomerChat from "../Screens/CustomerScreens/CustomerChat";
import WorkerChat from "../Screens/WorkerScreens/WorkerChat";
import CustomerHistory from "../Screens/CustomerScreens/CustomerHistory";
import WorkerHistory from "../Screens/WorkerScreens/WorkerHistory";
import ClientComplain from "../Screens/CustomerScreens/ClientComplain";
import BanScreen from "../Screens/SettingScreens/BanScreen";
import NotApprovedScreen from "../Screens/SettingScreens/NotApprovedScreen";
import WorkerBuildProfile from "../Screens/WorkerScreens/WorkerBuildProfile";
import ActivityScreen from "../Screens/CustomerScreens/Activity";
import WorkerPayment from "../Screens/WorkerScreens/WorkerPayment";

const Stack = createNativeStackNavigator();
const noHeader = { headerShown: false };

const theme = paperTheme;

const screenOptions = {
    headerStyle: { backgroundColor: colors.background },
    headerShadowVisible: false,
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700', color: colors.text },
    contentStyle: { backgroundColor: colors.background },
    headerBackTitleVisible: false,
};

const AuthStack = () => {
    return (
        <PaperProvider theme={theme} settings={paperSettings}>
            <NavigationContainer>

                <Stack.Navigator initialRouteName="SplashScreen" screenOptions={screenOptions}>

                    <Stack.Screen
                        name="LoginScreen"
                        component={Login}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="RegisterScreen"
                        component={Register}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="BuildProfileScreen"
                        component={BuildProfile}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="HomeScreen"
                        component={Home}
                    />
                    <Stack.Screen
                        name="ForgotPassword"
                        component={ForgotPassword}
                    />
                    <Stack.Screen
                        name="SplashScreen"
                        component={SplashScreen}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="WorkerHomepage"
                        component={WorkerHomepage}
                        options={noHeader}

                    />
                    <Stack.Screen
                        name="CustomerHomepage"
                        component={CustomerHomepage}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="Settings"
                        component={Settings}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="ChangePasswordScreen"
                        component={ChangePassword}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="ChangeEmailScreen"
                        component={ChangeEmail}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="MapScreen"
                        component={MapScreen}
                    />
                    <Stack.Screen
                        name="WorkerProfileScreen"
                        component={Profile}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="CustomerChatScreen"
                        component={CustomerChat}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="WorkerChatScreen"
                        component={WorkerChat}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="CustomerHistoryScreen"
                        component={CustomerHistory}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="WorkerHistoryScreen"
                        component={WorkerHistory}
                        options={noHeader}
                    />
                    <Stack.Screen
                        name="ClientComplainScreen"
                        component={ClientComplain}
                        options={noHeader}
                    />
                    <Stack.Screen name="AskServiceScreen" component={AskServiceScreen} options={noHeader} />
                    <Stack.Screen name="BanScreen" component={BanScreen} options={noHeader} />
                    <Stack.Screen name="NotApprovedScreen" component={NotApprovedScreen} options={noHeader} />
                    <Stack.Screen name="WorkerBuildProfileScreen" component={WorkerBuildProfile} options={noHeader} />
                    <Stack.Screen name="CustomerActivity" component={ActivityScreen} options={noHeader} />
                    <Stack.Screen name="WorkerPayment" component={WorkerPayment} options={noHeader} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );

}


export default AuthStack;