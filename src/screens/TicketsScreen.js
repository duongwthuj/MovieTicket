import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, Modal, Image
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export default function TicketsScreen() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const q = query(collection(db, 'tickets'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
      setTickets(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity style={styles.ticket} onPress={() => setSelected(item)} activeOpacity={0.85}>
      {/* Left: movie info */}
      <View style={styles.ticketLeft}>
        <Image source={{ uri: item.moviePoster }} style={styles.ticketPoster} />
        <View style={styles.ticketInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>{item.movieTitle}</Text>
          <Text style={styles.theater} numberOfLines={1}>🏛️ {item.theaterName}</Text>
          <Text style={styles.datetime}>📅 {item.date} • {item.time}</Text>
          <Text style={styles.seats}>💺 Ghế: <Text style={styles.seatsBold}>{item.seats.join(', ')}</Text></Text>
          <View style={[styles.statusBadge, item.status === 'confirmed' ? styles.confirmed : styles.cancelled]}>
            <Text style={styles.statusText}>{item.status === 'confirmed' ? '✓ Đã xác nhận' : '✕ Đã huỷ'}</Text>
          </View>
        </View>
      </View>

      {/* Right: code + price */}
      <View style={styles.ticketRight}>
        <View style={styles.qrBox}>
          <Text style={styles.qrIcon}>▦</Text>
          <Text style={styles.ticketCode}>{item.id.slice(0, 6).toUpperCase()}</Text>
        </View>
        <Text style={styles.price}>{item.totalPrice.toLocaleString('vi-VN')}đ</Text>
        <Text style={styles.tapDetail}>Xem chi tiết</Text>
      </View>

      {/* Perforated edge */}
      <View style={styles.perfTop} />
      <View style={styles.perfBottom} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Vé của tôi</Text>
          <Text style={styles.headerSub}>{tickets.length} vé đã đặt</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchTickets}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d4ed8" />
          <Text style={styles.loadingText}>Đang tải vé...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎟️</Text>
          <Text style={styles.emptyTitle}>Chưa có vé nào</Text>
          <Text style={styles.emptyText}>Đặt vé ngay để xem phim yêu thích!</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={i => i.id}
          renderItem={renderTicket}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchTickets}
          refreshing={loading}
        />
      )}

      {/* Ticket detail modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Handle */}
            <View style={styles.handle} />

            <Text style={styles.modalMovieTitle}>{selected?.movieTitle}</Text>

            {/* QR area */}
            <View style={styles.modalQRArea}>
              <Text style={styles.modalQRIcon}>▦</Text>
              <Text style={styles.modalTicketCode}>{selected?.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={styles.modalQRHint}>Xuất trình mã này tại quầy</Text>
            </View>

            {/* Details */}
            <View style={styles.modalDetails}>
              <ModalRow label="Rạp chiếu" value={selected?.theaterName} />
              <ModalRow label="Ngày" value={selected?.date} />
              <ModalRow label="Giờ" value={selected?.time} />
              <ModalRow label="Ghế" value={selected?.seats?.join(', ')} highlight />
              <ModalRow label="Tổng tiền" value={`${selected?.totalPrice?.toLocaleString('vi-VN')}đ`} highlight />
            </View>

            <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ModalRow({ label, value, highlight }) {
  return (
    <View style={styles.modalRow}>
      <Text style={styles.modalLabel}>{label}</Text>
      <Text style={[styles.modalValue, highlight && styles.modalHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },

  header: {
    backgroundColor: '#0f2552', paddingTop: 52, paddingBottom: 20,
    paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerSub: { color: '#7da8d8', fontSize: 13, marginTop: 2 },
  refreshBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  refreshIcon: { color: '#fff', fontSize: 22, fontWeight: '700' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#64748b', marginTop: 12, fontSize: 14 },

  ticket: {
    backgroundColor: '#fff', borderRadius: 18, marginBottom: 16,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    flexDirection: 'row', overflow: 'hidden', position: 'relative',
  },
  ticketLeft: { flex: 1, flexDirection: 'row' },
  ticketPoster: { width: 80, height: 120 },
  ticketInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  movieTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  theater: { color: '#64748b', fontSize: 12, marginBottom: 2 },
  datetime: { color: '#64748b', fontSize: 12, marginBottom: 2 },
  seats: { color: '#64748b', fontSize: 12, marginBottom: 6 },
  seatsBold: { color: '#1d4ed8', fontWeight: '700' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  confirmed: { backgroundColor: '#dcfce7' },
  cancelled: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#166534' },

  ticketRight: {
    width: 88, backgroundColor: '#f8fafc', alignItems: 'center',
    justifyContent: 'center', padding: 10, borderLeftWidth: 1.5,
    borderLeftColor: '#e2e8f0', borderStyle: 'dashed',
  },
  qrBox: { alignItems: 'center', marginBottom: 8 },
  qrIcon: { fontSize: 36, color: '#1d4ed8' },
  ticketCode: { fontSize: 11, fontWeight: '800', color: '#0f172a', letterSpacing: 1, marginTop: 2 },
  price: { fontSize: 11, color: '#1d4ed8', fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  tapDetail: { fontSize: 10, color: '#94a3b8' },

  perfTop: { position: 'absolute', top: -8, right: 78, width: 16, height: 16, borderRadius: 8, backgroundColor: '#f1f5f9' },
  perfBottom: { position: 'absolute', bottom: -8, right: 78, width: 16, height: 16, borderRadius: 8, backgroundColor: '#f1f5f9' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#334155', marginBottom: 8 },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalMovieTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', textAlign: 'center', marginBottom: 20 },

  modalQRArea: { backgroundColor: '#eff6ff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 },
  modalQRIcon: { fontSize: 72, color: '#1d4ed8' },
  modalTicketCode: { fontSize: 28, fontWeight: '900', color: '#1d4ed8', letterSpacing: 4, marginTop: 8 },
  modalQRHint: { color: '#64748b', fontSize: 12, marginTop: 8 },

  modalDetails: { backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, marginBottom: 20 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalLabel: { color: '#94a3b8', fontSize: 13 },
  modalValue: { color: '#0f172a', fontSize: 13, fontWeight: '700', maxWidth: '55%', textAlign: 'right' },
  modalHighlight: { color: '#1d4ed8' },

  modalClose: { backgroundColor: '#1d4ed8', borderRadius: 14, padding: 15, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
