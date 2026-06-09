import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleAbsensiNotification({ id, title, body, hour, minute }) {
  // Cancel existing notification with same id first
  await cancelNotification(id);

  const trigger = {
    hour,
    minute,
    repeats: true,
  };

  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: '#4a90d9',
    },
    trigger,
  });

  // Save mapping id → notifId
  const saved = await AsyncStorage.getItem('notif_ids');
  const map = saved ? JSON.parse(saved) : {};
  map[id] = notifId;
  await AsyncStorage.setItem('notif_ids', JSON.stringify(map));

  return notifId;
}

export async function cancelNotification(id) {
  const saved = await AsyncStorage.getItem('notif_ids');
  if (!saved) return;
  const map = JSON.parse(saved);
  if (map[id]) {
    await Notifications.cancelScheduledNotificationAsync(map[id]);
    delete map[id];
    await AsyncStorage.setItem('notif_ids', JSON.stringify(map));
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem('notif_ids');
}

export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
