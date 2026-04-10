import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const { width } = Dimensions.get('window');

export default function MovieDetailScreen({ route, navigation }) {
  const { movie } = route.params;
  const [showtimes, setShowtimes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchShowtimes(); }, []);

  const fetchShowtimes = async () => {
    try {
      const q = query(collection(db, 'showtimes'), where('movieId', '==', movie.id));
      const snap = await getDocs(q);
      setShowtimes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (r) => r >= 8 ? '#22c55e' : r >= 6 ? '#f5a623' : '#ef4444';

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Poster banner */}
        <View style={styles.bannerWrapper}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Image source={{ uri: movie.poster }} style={styles.banner} blurRadius={2} />
          <View style={styles.bannerOverlay} />
          <Image source={{ uri: movie.poster }} style={styles.posterCenter} />
        </View>

        <View style={styles.body}>
          {/* Title & rating */}
          <Text style={styles.title}>{movie.title}</Text>

          <View style={styles.ratingRow}>
            <View style={[styles.ratingCircle, { borderColor: getRatingColor(movie.rating) }]}>
              <Text style={[styles.ratingNum, { color: getRatingColor(movie.rating) }]}>{movie.rating}</Text>
              <Text style={styles.ratingOf}>/10</Text>
            </View>
            <View style={styles.metaBlock}>
              <View style={styles.genreTag}>
                <Text style={styles.genreTagText}>{movie.genre}</Text>
              </View>
              <Text style={styles.metaText}>🕐 {movie.duration} phút</Text>
            </View>
          </View>

          {/* Stars */}
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Text key={i} style={[styles.star, { color: i < Math.round(movie.rating / 2) ? '#f5a623' : '#e2e8f0' }]}>★</Text>
            ))}
            <Text style={styles.starsLabel}>({movie.rating}/10 IMDb)</Text>
          </View>

          {/* Synopsis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nội dung phim</Text>
            <View style={styles.synopsisCard}>
              <Text style={styles.synopsis}>{movie.synopsis}</Text>
            </View>
          </View>

          {/* Showtimes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn suất chiếu</Text>
            {loading ? (
              <ActivityIndicator color="#1d4ed8" style={{ marginTop: 12 }} />
            ) : showtimes.length === 0 ? (
              <View style={styles.noShowtimeBox}>
                <Text style={styles.noShowtimeIcon}>📅</Text>
                <Text style={styles.noShowtime}>Chưa có suất chiếu</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                {showtimes.map(st => {
                  const isSelected = selected?.id === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[styles.showtimeCard, isSelected && styles.showtimeSelected]}
                      onPress={() => setSelected(st)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.showtimeDate, isSelected && styles.wt]}>{st.date}</Text>
                      <Text style={[styles.showtimeTime, isSelected && styles.wt]}>{st.time}</Text>
                      <View style={[styles.showtimeDivider, isSelected && { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                      <Text style={[styles.showtimeTheater, isSelected && styles.wt]} numberOfLines={2}>{st.theaterName}</Text>
                      <Text style={[styles.showtimePrice, isSelected && { color: '#bfdbfe' }]}>
                        {(st.price || 85000).toLocaleString('vi-VN')}đ/ghế
                      </Text>
                      {isSelected && (
                        <View style={styles.checkMark}><Text style={styles.checkMarkText}>✓</Text></View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky bottom button */}
      <View style={styles.stickyBottom}>
        {selected && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>Đã chọn: {selected.time} • {selected.date}</Text>
            <Text style={styles.selectedTheater} numberOfLines={1}>{selected.theaterName}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.disabled]}
          disabled={!selected}
          onPress={() => navigation.navigate('SeatSelection', { movie, showtime: selected })}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>{selected ? 'Chọn ghế ngồi →' : 'Chọn suất chiếu'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f1f5f9' },
  container: { flex: 1 },

  backBtn: {
    position: 'absolute', top: 48, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20,
    width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  bannerWrapper: { height: 260, position: 'relative', alignItems: 'center', justifyContent: 'flex-end' },
  banner: { position: 'absolute', width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(15,37,82,0.72)' },
  posterCenter: { width: 120, height: 175, borderRadius: 14, marginBottom: 16, borderWidth: 3, borderColor: '#fff', elevation: 12 },

  body: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 14 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 10 },
  ratingCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  ratingNum: { fontSize: 20, fontWeight: '800' },
  ratingOf: { fontSize: 10, color: '#94a3b8' },
  metaBlock: { flex: 1, gap: 8 },
  genreTag: { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  genreTagText: { color: '#1d4ed8', fontSize: 12, fontWeight: '700' },
  metaText: { color: '#64748b', fontSize: 13 },

  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 20 },
  star: { fontSize: 20 },
  starsLabel: { color: '#94a3b8', fontSize: 12, marginLeft: 6 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 12, letterSpacing: 0.3 },
  synopsisCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 2 },
  synopsis: { color: '#475569', lineHeight: 24, fontSize: 14 },

  noShowtimeBox: { alignItems: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 14 },
  noShowtimeIcon: { fontSize: 36, marginBottom: 8 },
  noShowtime: { color: '#94a3b8', fontStyle: 'italic', fontSize: 14 },

  showtimeCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    marginRight: 12, alignItems: 'center', minWidth: 130,
    elevation: 3, borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
  },
  showtimeSelected: { backgroundColor: '#1d4ed8', borderColor: '#3b82f6', elevation: 6 },
  showtimeDate: { fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: '600' },
  showtimeTime: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  showtimeDivider: { width: '80%', height: 1, backgroundColor: '#e2e8f0', marginVertical: 8 },
  showtimeTheater: { fontSize: 11, color: '#64748b', textAlign: 'center', lineHeight: 16 },
  showtimePrice: { fontSize: 11, color: '#1d4ed8', fontWeight: '700', marginTop: 6 },
  wt: { color: '#fff' },
  checkMark: { position: 'absolute', top: 8, right: 8, backgroundColor: '#22c55e', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  checkMarkText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  stickyBottom: {
    backgroundColor: '#fff', padding: 16, paddingBottom: 24,
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  selectedInfo: { marginBottom: 10 },
  selectedLabel: { fontSize: 13, fontWeight: '700', color: '#1d4ed8' },
  selectedTheater: { fontSize: 12, color: '#64748b', marginTop: 2 },
  continueBtn: { backgroundColor: '#1d4ed8', borderRadius: 14, padding: 16, alignItems: 'center' },
  disabled: { backgroundColor: '#cbd5e1' },
  continueBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
