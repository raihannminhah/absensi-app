import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'absensi_history';
const SETTINGS_KEY = 'absensi_settings';

export const defaultSettings = {
  jamMasuk: { hour: 8, minute: 0 },
  jamPulang: { hour: 17, minute: 0 },
  notifMasukAktif: true,
  notifPulangAktif: true,
};

// History
export async function saveAbsensi(item) {
  const history = await getHistory();
  history.unshift(item); // newest first
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export async function getHistory() {
  const data = await AsyncStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export async function deleteAbsensi(id) {
  const history = await getHistory();
  const filtered = history.filter((item) => item.id !== id);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

export async function clearHistory() {
  await AsyncStorage.removeItem(HISTORY_KEY);
}

// Settings
export async function getSettings() {
  const data = await AsyncStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : defaultSettings;
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
