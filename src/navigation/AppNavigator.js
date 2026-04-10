import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { auth } from '../config/firebase';
import InAppNotification from '../components/InAppNotification';

// Global notification context
export const NotificationContext = createContext(null);
export function useNotification() { return useContext(NotificationContext); }

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import MovieDetailScreen from '../screens/MovieDetailScreen';
import SeatSelectionScreen from '../screens/SeatSelectionScreen';
import BookingConfirmScreen from '../screens/BookingConfirmScreen';
import TicketsScreen from '../screens/TicketsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: 'Phim', icon: '▶', activeIcon: '▶' },
  { name: 'Tickets', label: 'Vé của tôi', icon: '◈', activeIcon: '◈' },
  { name: 'Profile', label: 'Tài khoản', icon: '◉', activeIcon: '◉' },
];

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tabStyles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const tab = TABS[index];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={[tabStyles.tab, isFocused && tabStyles.tabActive]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={[tabStyles.iconWrap, isFocused && tabStyles.iconWrapActive]}>
              <Text style={[tabStyles.icon, isFocused && tabStyles.iconActive]}>{tab.icon}</Text>
            </View>
            <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4,
  },
  tabActive: {},
  iconWrap: {
    width: 40, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  iconWrapActive: {
    backgroundColor: '#eff6ff',
  },
  icon: { fontSize: 16, color: '#94a3b8' },
  iconActive: { color: '#1d4ed8' },
  label: { fontSize: 11, fontWeight: '600', color: '#94a3b8' },
  labelActive: { color: '#1d4ed8', fontWeight: '800' },
});

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tickets" component={TicketsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="MovieDetail"
        component={MovieDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SeatSelection"
        component={SeatSelectionScreen}
        options={{
          title: 'Chọn ghế',
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <Stack.Screen
        name="BookingConfirm"
        component={BookingConfirmScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(undefined);
  const [noti, setNoti] = useState({ visible: false, title: '', body: '' });

  const showNotification = useCallback((title, body) => {
    setNoti({ visible: true, title, body });
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f2552' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#7da8d8', marginTop: 12, fontSize: 14 }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <NotificationContext.Provider value={showNotification}>
      <NavigationContainer>
        {user ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
      <InAppNotification
        visible={noti.visible}
        title={noti.title}
        body={noti.body}
        onHide={() => setNoti(n => ({ ...n, visible: false }))}
      />
    </NotificationContext.Provider>
  );
}
