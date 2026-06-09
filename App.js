import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import CameraScreen from './src/screens/CameraScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { requestNotificationPermission } from './src/utils/notifications';
import { getSettings } from './src/utils/storage';
import { scheduleAbsensiNotification } from './src/utils/notifications';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
    </View>
  );
}

export default function App() {
  useEffect(() => {
    // Request permission & restore notifications on app launch
    (async () => {
      const granted = await requestNotificationPermission();
      if (!granted) return;

      const settings = await getSettings();

      if (settings.notifMasukAktif) {
        await scheduleAbsensiNotification({
          id: 'masuk',
          title: '🟢 Pengingat Absen Masuk',
          body: `Jangan lupa absen masuk!`,
          hour: settings.jamMasuk.hour,
          minute: settings.jamMasuk.minute,
        });
      }

      if (settings.notifPulangAktif) {
        await scheduleAbsensiNotification({
          id: 'pulang',
          title: '🔴 Pengingat Absen Pulang',
          body: `Jangan lupa absen pulang!`,
          hour: settings.jamPulang.hour,
          minute: settings.jamPulang.minute,
        });
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#111',
              borderTopColor: '#222',
              height: 60,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: '#4a90d9',
            tabBarInactiveTintColor: '#555',
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          }}
        >
          <Tab.Screen
            name="Kamera"
            component={CameraScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="📷" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Riwayat"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Pengaturan"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
