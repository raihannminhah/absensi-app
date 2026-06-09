import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
  Alert, ScrollView, Platform, StatusBar,
} from 'react-native';
import { getSettings, saveSettings } from '../utils/storage';
import {
  requestNotificationPermission,
  scheduleAbsensiNotification,
  cancelNotification,
} from '../utils/notifications';

function pad(n) { return String(n).padStart(2, '0'); }

function TimeAdjuster({ label, hour, minute, onChange }) {
  return (
    <View style={styles.timeRow}>
      <Text style={styles.timeLabel}>{label}</Text>
      <View style={styles.timeControls}>
        {/* Hour */}
        <View style={styles.spinBox}>
          <TouchableOpacity onPress={() => onChange((hour + 1) % 24, minute)}>
            <Text style={styles.arrow}>▲</Text>
          </TouchableOpacity>
          <Text style={styles.timeValue}>{pad(hour)}</Text>
          <TouchableOpacity onPress={() => onChange((hour - 1 + 24) % 24, minute)}>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.colon}>:</Text>
        {/* Minute */}
        <View style={styles.spinBox}>
          <TouchableOpacity onPress={() => onChange(hour, (minute + 5) % 60)}>
            <Text style={styles.arrow}>▲</Text>
          </TouchableOpacity>
          <Text style={styles.timeValue}>{pad(minute)}</Text>
          <TouchableOpacity onPress={() => onChange(hour, (minute - 5 + 60) % 60)}>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  const update = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Izin Notifikasi', 'Aktifkan izin notifikasi di pengaturan HP untuk menerima pengingat absensi.');
        setSaving(false);
        return;
      }

      await saveSettings(settings);

      // Schedule / cancel masuk
      if (settings.notifMasukAktif) {
        await scheduleAbsensiNotification({
          id: 'masuk',
          title: '🟢 Pengingat Absen Masuk',
          body: `Jangan lupa absen masuk! Sekarang ${pad(settings.jamMasuk.hour)}:${pad(settings.jamMasuk.minute)}`,
          hour: settings.jamMasuk.hour,
          minute: settings.jamMasuk.minute,
        });
      } else {
        await cancelNotification('masuk');
      }

      // Schedule / cancel pulang
      if (settings.notifPulangAktif) {
        await scheduleAbsensiNotification({
          id: 'pulang',
          title: '🔴 Pengingat Absen Pulang',
          body: `Jangan lupa absen pulang! Sekarang ${pad(settings.jamPulang.hour)}:${pad(settings.jamPulang.minute)}`,
          hour: settings.jamPulang.hour,
          minute: settings.jamPulang.minute,
        });
      } else {
        await cancelNotification('pulang');
      }

      Alert.alert('✅ Tersimpan!', 'Pengaturan notifikasi berhasil diperbarui.');
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan pengaturan.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />
      <Text style={styles.title}>⚙️ Pengaturan Notifikasi</Text>
      <Text style={styles.subtitle}>Atur jam pengingat absensi harian kamu</Text>

      {/* Masuk */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>🟢 Absen Masuk</Text>
            <Text style={styles.cardDesc}>Pengingat jam masuk kerja</Text>
          </View>
          <Switch
            value={settings.notifMasukAktif}
            onValueChange={(v) => update('notifMasukAktif', v)}
            trackColor={{ false: '#333', true: '#2ecc71' }}
            thumbColor="#fff"
          />
        </View>
        {settings.notifMasukAktif && (
          <TimeAdjuster
            label="Jam masuk:"
            hour={settings.jamMasuk.hour}
            minute={settings.jamMasuk.minute}
            onChange={(h, m) => update('jamMasuk', { hour: h, minute: m })}
          />
        )}
      </View>

      {/* Pulang */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>🔴 Absen Pulang</Text>
            <Text style={styles.cardDesc}>Pengingat jam pulang kerja</Text>
          </View>
          <Switch
            value={settings.notifPulangAktif}
            onValueChange={(v) => update('notifPulangAktif', v)}
            trackColor={{ false: '#333', true: '#e74c3c' }}
            thumbColor="#fff"
          />
        </View>
        {settings.notifPulangAktif && (
          <TimeAdjuster
            label="Jam pulang:"
            hour={settings.jamPulang.hour}
            minute={settings.jamPulang.minute}
            onChange={(h, m) => update('jamPulang', { hour: h, minute: m })}
          />
        )}
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Notifikasi akan muncul setiap hari pada jam yang kamu set. Pastikan aplikasi tidak di-force close agar notifikasi berjalan normal.
        </Text>
      </View>

      {/* Save */}
      <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : '💾 Simpan Pengaturan'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16, paddingTop: 52 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#666', fontSize: 13, marginBottom: 24 },

  card: {
    backgroundColor: '#1a1a1a', borderRadius: 14,
    padding: 16, marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cardDesc: { color: '#666', fontSize: 12, marginTop: 2 },

  timeRow: { marginTop: 8, alignItems: 'center' },
  timeLabel: { color: '#888', fontSize: 13, marginBottom: 10 },
  timeControls: { flexDirection: 'row', alignItems: 'center' },
  spinBox: { alignItems: 'center', width: 64 },
  arrow: { color: '#4a90d9', fontSize: 22, paddingVertical: 6 },
  timeValue: { color: '#fff', fontSize: 36, fontWeight: '200', fontVariant: ['tabular-nums'] },
  colon: { color: '#fff', fontSize: 36, fontWeight: '200', marginHorizontal: 4, marginBottom: 4 },

  infoBox: {
    backgroundColor: 'rgba(74,144,217,0.1)', borderRadius: 10,
    padding: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(74,144,217,0.2)',
  },
  infoText: { color: '#aaa', fontSize: 13, lineHeight: 20 },

  saveBtn: {
    backgroundColor: '#4a90d9', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
