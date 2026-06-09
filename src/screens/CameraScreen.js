import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, StatusBar, Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { saveAbsensi } from '../utils/storage';

const { width } = Dimensions.get('window');

function getNow() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const day = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][now.getDay()];
  return { date, time, day, raw: now };
}

function getType(hour) {
  if (hour >= 5 && hour < 13) return 'masuk';
  return 'pulang';
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState('back');
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(false);
  const [clock, setClock] = useState(getNow());
  const cameraRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setClock(getNow()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!permission) return <View style={styles.center}><ActivityIndicator color="#4a90d9" /></View>;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Izin kamera diperlukan</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || loading) return;

    if (!mediaPermission?.granted) {
      const res = await requestMediaPermission();
      if (!res.granted) {
        Alert.alert('Izin Galeri', 'Izin galeri diperlukan untuk menyimpan foto absensi.');
        return;
      }
    }

    setLoading(true);
    try {
      const now = getNow();
      const type = getType(now.raw.getHours());

      // Take photo
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, base64: false });

      // Save to media library (galeri)
      const asset = await MediaLibrary.createAssetAsync(photo.uri);
      await MediaLibrary.createAlbumAsync('Absensi', asset, false);

      // Save record to history
      const record = {
        id: Date.now().toString(),
        type,
        date: now.date,
        time: now.time,
        day: now.day,
        uri: asset.uri,
        localUri: photo.uri,
      };
      await saveAbsensi(record);

      Alert.alert(
        '✅ Absensi Tersimpan!',
        `${type === 'masuk' ? '🟢 Masuk' : '🔴 Pulang'} — ${now.time}\nFoto tersimpan ke Galeri > Album Absensi`,
        [{ text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Error', 'Gagal mengambil foto. Coba lagi.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const hour = clock.raw.getHours();
  const type = getType(hour);
  const typeLabel = type === 'masuk' ? '🟢 ABSEN MASUK' : '🔴 ABSEN PULANG';
  const typeColor = type === 'masuk' ? '#2ecc71' : '#e74c3c';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.typeLabel}>{typeLabel}</Text>
        <View style={styles.clockBox}>
          <Text style={styles.time}>{clock.time}</Text>
          <Text style={styles.date}>{clock.day}, {clock.date}</Text>
        </View>
      </View>

      {/* Camera */}
      <View style={styles.cameraWrap}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash ? 'on' : 'off'}
        >
          {/* Timestamp overlay */}
          <View style={styles.overlay}>
            <View style={[styles.badge, { backgroundColor: typeColor }]}>
              <Text style={styles.badgeText}>{typeLabel}</Text>
              <Text style={styles.badgeTime}>{clock.time}  {clock.date}</Text>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Flip */}
        <TouchableOpacity style={styles.sideBtn} onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
          <Text style={styles.sideBtnIcon}>🔄</Text>
          <Text style={styles.sideBtnText}>Balik</Text>
        </TouchableOpacity>

        {/* Shutter */}
        <TouchableOpacity style={[styles.shutter, loading && styles.shutterDisabled]} onPress={handleCapture} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" size="large" />
            : <View style={styles.shutterInner} />
          }
        </TouchableOpacity>

        {/* Flash */}
        <TouchableOpacity style={styles.sideBtn} onPress={() => setFlash(f => !f)}>
          <Text style={styles.sideBtnIcon}>{flash ? '⚡' : '🔦'}</Text>
          <Text style={styles.sideBtnText}>{flash ? 'Flash On' : 'Flash Off'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d0d' },
  permText: { color: '#fff', fontSize: 16, marginBottom: 16 },
  btn: { backgroundColor: '#4a90d9', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold' },

  header: { paddingTop: 50, paddingBottom: 12, alignItems: 'center', backgroundColor: '#0d0d0d' },
  typeLabel: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 2, marginBottom: 4 },
  clockBox: { alignItems: 'center' },
  time: { color: '#fff', fontSize: 42, fontWeight: '200', letterSpacing: 4, fontVariant: ['tabular-nums'] },
  date: { color: '#888', fontSize: 13, marginTop: 2 },

  cameraWrap: { flex: 1, marginHorizontal: 0 },
  camera: { flex: 1 },
  overlay: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  badge: {
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    opacity: 0.88, alignItems: 'center',
  },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  badgeTime: { color: '#fff', fontSize: 12, marginTop: 2 },

  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: 24, paddingHorizontal: 24, backgroundColor: '#0d0d0d',
  },
  shutter: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#555',
    elevation: 4,
  },
  shutterDisabled: { opacity: 0.5 },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  sideBtn: { alignItems: 'center', width: 60 },
  sideBtnIcon: { fontSize: 26 },
  sideBtnText: { color: '#888', fontSize: 11, marginTop: 4 },
});
