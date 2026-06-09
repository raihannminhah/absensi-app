import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, Alert, RefreshControl, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory, deleteAbsensi, clearHistory } from '../utils/storage';

function groupByDate(items) {
  const groups = {};
  items.forEach((item) => {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
  });
  return Object.entries(groups).map(([date, records]) => ({ date, records }));
}

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Hapus?', 'Hapus record absensi ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          await deleteAbsensi(id);
          load();
        },
      },
    ]);
  };

  const handleClear = () => {
    Alert.alert('Hapus Semua?', 'Semua riwayat absensi akan dihapus.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus Semua', style: 'destructive', onPress: async () => {
          await clearHistory();
          load();
        },
      },
    ]);
  };

  const grouped = groupByDate(history);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />
      <View style={styles.topBar}>
        <Text style={styles.title}>📋 Riwayat Absensi</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearBtn}>Hapus Semua</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyText}>Belum ada absensi</Text>
          <Text style={styles.emptySubText}>Foto absensi kamu akan muncul di sini</Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.date}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a90d9" />}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.dateGroup}>
              <Text style={styles.dateLabel}>{item.records[0]?.day}, {item.date}</Text>
              {item.records.map((record) => (
                <View key={record.id} style={styles.card}>
                  <Image source={{ uri: record.localUri || record.uri }} style={styles.thumb} />
                  <View style={styles.cardInfo}>
                    <View style={[styles.typeBadge, record.type === 'masuk' ? styles.masuk : styles.pulang]}>
                      <Text style={styles.typeBadgeText}>
                        {record.type === 'masuk' ? '🟢 MASUK' : '🔴 PULANG'}
                      </Text>
                    </View>
                    <Text style={styles.recordTime}>{record.time}</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(record.id)}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#0d0d0d',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  clearBtn: { color: '#e74c3c', fontSize: 13 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  emptySubText: { color: '#666', fontSize: 13, marginTop: 6 },

  dateGroup: { marginBottom: 20 },
  dateLabel: { color: '#4a90d9', fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 },

  card: {
    backgroundColor: '#1a1a1a', borderRadius: 12,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 8, overflow: 'hidden',
  },
  thumb: { width: 72, height: 72, backgroundColor: '#333' },
  cardInfo: { flex: 1, paddingHorizontal: 12 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4 },
  masuk: { backgroundColor: 'rgba(46,204,113,0.2)' },
  pulang: { backgroundColor: 'rgba(231,76,60,0.2)' },
  typeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  recordTime: { color: '#bbb', fontSize: 20, fontWeight: '300', fontVariant: ['tabular-nums'] },

  deleteBtn: { padding: 16 },
  deleteBtnText: { color: '#555', fontSize: 16 },
});
