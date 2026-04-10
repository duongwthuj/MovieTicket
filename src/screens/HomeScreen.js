import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, TextInput, ActivityIndicator, StatusBar, Dimensions
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const { width } = Dimensions.get('window');
const GENRES = ['Tất cả', 'Hành động', 'Tình cảm', 'Kinh dị', 'Khoa học viễn tưởng', 'Hài'];

export default function HomeScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Tất cả');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMovies(); }, []);

  useEffect(() => {
    let result = movies;
    if (genre !== 'Tất cả') result = result.filter(m => m.genre === genre);
    if (search) result = result.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, genre, movies]);

  const fetchMovies = async () => {
    try {
      const snap = await getDocs(collection(db, 'movies'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMovies(data);
      setFiltered(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (r) => r >= 8 ? '#22c55e' : r >= 6 ? '#f5a623' : '#ef4444';

  const renderMovie = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => navigation.navigate('MovieDetail', { movie: item })}
    >
      <View style={styles.posterWrapper}>
        <Image source={{ uri: item.poster }} style={styles.poster} />
        <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(item.rating) }]}>
          <Text style={styles.ratingBadgeText}>★ {item.rating}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.genreRow}>
          <View style={styles.genreTag}>
            <Text style={styles.genreTagText}>{item.genre}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>🕐 {item.duration} phút</Text>
        </View>
        <Text style={styles.synopsis} numberOfLines={2}>{item.synopsis}</Text>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('MovieDetail', { movie: item })}
        >
          <Text style={styles.bookBtnText}>Đặt vé ngay</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2552" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🎬 MovieTix</Text>
          <Text style={styles.headerSub}>Đặt vé xem phim dễ dàng</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{filtered.length} phim</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.search}
          placeholder="Tìm kiếm phim..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Genre filter */}
      <View style={styles.genreWrapper}>
        <FlatList
          data={GENRES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.genreBtn, genre === item && styles.genreActive]}
              onPress={() => setGenre(item)}
            >
              <Text style={[styles.genreText, genre === item && styles.genreTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Movie list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Đang tải phim...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎭</Text>
          <Text style={styles.emptyTitle}>Không tìm thấy phim</Text>
          <Text style={styles.emptyText}>Thử tìm kiếm với từ khoá khác</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderMovie}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchMovies}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },

  header: {
    backgroundColor: '#0f2552',
    paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: 0.5 },
  headerSub: { color: '#7da8d8', fontSize: 12, marginTop: 2 },
  headerBadge: { backgroundColor: '#1e40af', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  headerBadgeText: { color: '#93c5fd', fontSize: 12, fontWeight: '700' },

  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, marginBottom: 10,
    borderRadius: 14, paddingHorizontal: 14, elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  search: { flex: 1, paddingVertical: 13, fontSize: 14, color: '#1e293b' },
  clearBtn: { color: '#94a3b8', fontSize: 16, paddingLeft: 8 },

  genreWrapper: { backgroundColor: '#f1f5f9', paddingBottom: 8, zIndex: 1 },
  genreBtn: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
    marginRight: 8, backgroundColor: '#e2e8f0', height: 38,
    justifyContent: 'center', alignItems: 'center',
  },
  genreActive: { backgroundColor: '#1d4ed8' },
  genreText: { color: '#475569', fontSize: 13, fontWeight: '600', whiteSpace: 'nowrap' },
  genreTextActive: { color: '#fff' },

  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18,
    marginBottom: 16, overflow: 'hidden',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
  },
  posterWrapper: { position: 'relative' },
  poster: { width: 115, height: 165 },
  ratingBadge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  ratingBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  info: { flex: 1, padding: 14, justifyContent: 'space-between' },
  movieTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', lineHeight: 21 },

  genreRow: { flexDirection: 'row', marginTop: 6 },
  genreTag: { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  genreTagText: { color: '#1d4ed8', fontSize: 11, fontWeight: '700' },

  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { color: '#64748b', fontSize: 12 },

  synopsis: { color: '#64748b', fontSize: 12, lineHeight: 18, marginTop: 6 },

  bookBtn: {
    backgroundColor: '#1d4ed8', borderRadius: 10,
    paddingVertical: 9, alignItems: 'center', marginTop: 8,
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#64748b', marginTop: 12, fontSize: 14 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155' },
  emptyText: { color: '#94a3b8', marginTop: 6, fontSize: 13 },
});
