import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Modal
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Toast from '../components/Toast';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = 8;

export default function SeatSelectionScreen({ route, navigation }) {
  const { movie, showtime } = route.params;
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  useEffect(() => { fetchBookedSeats(); }, []);

  const fetchBookedSeats = async () => {
    try {
      const snap = await getDoc(doc(db, 'showtimes', showtime.id));
      if (snap.exists()) setBookedSeats(snap.data().bookedSeats || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const getSeatStatus = (seat) => {
    if (bookedSeats.includes(seat)) return 'booked';
    if (selectedSeats.includes(seat)) return 'selected';
    return 'available';
  };

  const totalPrice = selectedSeats.length * (showtime.price || 85000);

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      setToast({ visible: true, message: 'Vui lòng chọn ít nhất 1 ghế', type: 'warning' });
      return;
    }
    navigation.navigate('BookingConfirm', { movie, showtime, selectedSeats, totalPrice });
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.loadingText}>Đang tải sơ đồ ghế...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      {/* Movie info bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoTitle} numberOfLines={1}>{movie.title}</Text>
        <Text style={styles.infoSub}>{showtime.date} • {showtime.time} • {showtime.theaterName}</Text>
      </View>

      {/* Screen */}
      <View style={styles.screenWrap}>
        <View style={styles.screen} />
        <Text style={styles.screenLabel}>MÀN HÌNH</Text>
      </View>

      {/* Seat map */}
      <ScrollView contentContainerStyle={styles.seatsContainer} showsVerticalScrollIndicator={false}>
        {ROWS.map(row => (
          <View key={row} style={styles.rowContainer}>
            <Text style={styles.rowLabel}>{row}</Text>
            <View style={styles.seatRow}>
              {Array.from({ length: COLS }, (_, i) => {
                const seat = `${row}${i + 1}`;
                const status = getSeatStatus(seat);
                return (
                  <TouchableOpacity
                    key={seat}
                    style={[styles.seat, styles[`seat_${status}`]]}
                    onPress={() => toggleSeat(seat)}
                    disabled={status === 'booked'}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.seatText, status === 'booked' && styles.seatTextBooked]}>
                      {i + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.rowLabel}>{row}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          { status: 'seat_available', label: 'Trống' },
          { status: 'seat_selected', label: 'Đang chọn' },
          { status: 'seat_booked', label: 'Đã đặt' },
        ].map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, styles[item.status]]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerSeats}>
            {selectedSeats.length > 0 ? `Ghế: ${selectedSeats.join(', ')}` : 'Chưa chọn ghế'}
          </Text>
          <Text style={styles.footerPrice}>
            {totalPrice > 0 ? `${totalPrice.toLocaleString('vi-VN')}đ` : '—'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.continueBtn, selectedSeats.length === 0 && styles.continueBtnDisabled]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            {selectedSeats.length > 0 ? `Đặt ${selectedSeats.length} ghế →` : 'Chọn ghế'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' },
  loadingText: { color: '#94a3b8', marginTop: 12 },

  infoBar: { backgroundColor: '#1e293b', paddingHorizontal: 20, paddingVertical: 12 },
  infoTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  infoSub: { color: '#64748b', fontSize: 12, marginTop: 2 },

  screenWrap: { alignItems: 'center', paddingVertical: 16 },
  screen: {
    width: '75%', height: 6, backgroundColor: '#3b82f6',
    borderRadius: 4, marginBottom: 6,
    shadowColor: '#3b82f6', shadowOpacity: 0.8, shadowRadius: 12, elevation: 8,
  },
  screenLabel: { color: '#475569', fontSize: 11, letterSpacing: 3, fontWeight: '700' },

  seatsContainer: { paddingHorizontal: 12, paddingBottom: 8 },
  rowContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'center' },
  rowLabel: { width: 18, color: '#475569', fontWeight: '700', fontSize: 12, textAlign: 'center' },
  seatRow: { flexDirection: 'row', gap: 6, marginHorizontal: 8 },
  seat: { width: 34, height: 30, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  seat_available: { backgroundColor: '#1e3a5f', borderWidth: 1, borderColor: '#2563eb' },
  seat_selected: { backgroundColor: '#f5a623', borderWidth: 1, borderColor: '#fbbf24' },
  seat_booked: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  seatText: { fontSize: 10, fontWeight: '700', color: '#93c5fd' },
  seatTextBooked: { color: '#334155' },

  legend: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 10, backgroundColor: '#0f172a' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 18, height: 14, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#64748b' },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1e293b', padding: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: '#334155',
  },
  footerInfo: { flex: 1, marginRight: 12 },
  footerSeats: { color: '#94a3b8', fontSize: 12, marginBottom: 2 },
  footerPrice: { color: '#fff', fontSize: 18, fontWeight: '900' },
  continueBtn: { backgroundColor: '#1d4ed8', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 20 },
  continueBtnDisabled: { backgroundColor: '#334155' },
  continueBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
