import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Modal, Image
} from 'react-native';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useNotification } from '../navigation/AppNavigator';

export default function BookingConfirmScreen({ route, navigation }) {
  const { movie, showtime, selectedSeats, totalPrice } = route.params;
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const showNotification = useNotification();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const ticketData = {
        userId: user.uid,
        userName: user.displayName,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster,
        showtimeId: showtime.id,
        theaterName: showtime.theaterName,
        date: showtime.date,
        time: showtime.time,
        seats: selectedSeats,
        totalPrice,
        status: 'confirmed',
        bookedAt: new Date().toISOString(),
      };

      const ticketRef = await addDoc(collection(db, 'tickets'), ticketData);
      await updateDoc(doc(db, 'showtimes', showtime.id), {
        bookedSeats: arrayUnion(...selectedSeats)
      });

      setTicketCode(ticketRef.id.slice(0, 8).toUpperCase());
      setSuccessModal(true);

      // Hiện in-app notification xác nhận
      showNotification(
        '🎉 Đặt vé thành công!',
        `${movie.title} • ${showtime.time} ngày ${showtime.date} • Ghế: ${selectedSeats.join(', ')}`
      );

      // Nhắc trước giờ chiếu 30 phút bằng setTimeout
      try {
        const [day, month, year] = showtime.date.split('/');
        const [hour, minute] = showtime.time.split(':');
        const showtimeDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
        const reminderDate = new Date(showtimeDate.getTime() - 60 * 60 * 1000);
        const msUntilReminder = reminderDate.getTime() - Date.now();

        if (msUntilReminder > 0) {
          setTimeout(() => {
            showNotification(
              '⏰ Còn 30 phút nữa là đến giờ chiếu!',
              `${movie.title} • ${showtime.time} tại ${showtime.theaterName}. Còn 1 tiếng nữa!`
            );
          }, msUntilReminder);
        }
      } catch (e) {
        console.log('Lỗi lên lịch reminder:', e);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác nhận đặt vé</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Movie info card */}
        <View style={styles.movieCard}>
          <Image source={{ uri: movie.poster }} style={styles.moviePoster} />
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle}>{movie.title}</Text>
            <View style={styles.genreTag}>
              <Text style={styles.genreTagText}>{movie.genre}</Text>
            </View>
            <Text style={styles.movieMeta}>🕐 {movie.duration} phút</Text>
          </View>
        </View>

        {/* Ticket detail card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketHeaderText}>CHI TIẾT VÉ</Text>
          </View>

          <InfoRow icon="🏛️" label="Rạp chiếu" value={showtime.theaterName} />
          <Divider />
          <InfoRow icon="📅" label="Ngày chiếu" value={showtime.date} />
          <Divider />
          <InfoRow icon="🕐" label="Giờ chiếu" value={showtime.time} />
          <Divider />
          <InfoRow icon="💺" label="Ghế ngồi" value={selectedSeats.join(', ')} highlight />
          <Divider />
          <InfoRow icon="🎟️" label="Số lượng" value={`${selectedSeats.length} ghế`} />

          {/* Perforated line */}
          <View style={styles.perforated}>
            <View style={styles.circleLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.circleRight} />
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Tổng thanh toán</Text>
              <Text style={styles.priceSub}>{selectedSeats.length} ghế × {(showtime.price || 85000).toLocaleString('vi-VN')}đ</Text>
            </View>
            <Text style={styles.priceValue}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>📌 Lưu ý</Text>
          <Text style={styles.noteText}>• Vé đã đặt không được hoàn trả</Text>
          <Text style={styles.noteText}>• Vui lòng có mặt trước 15 phút</Text>
          <Text style={styles.noteText}>• Xuất trình mã vé tại quầy</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky confirm button */}
      <View style={styles.stickyBottom}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmText}>🎬 Xác nhận đặt vé</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successCircle}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Đặt vé thành công!</Text>
            <Text style={styles.successSub}>Chúc bạn xem phim vui vẻ</Text>

            <View style={styles.ticketCodeBox}>
              <Text style={styles.ticketCodeLabel}>Mã vé của bạn</Text>
              <Text style={styles.ticketCode}>{ticketCode}</Text>
              <Text style={styles.ticketCodeHint}>Xuất trình mã này tại quầy</Text>
            </View>

            <View style={styles.modalInfo}>
              <ModalInfoRow label="Phim" value={movie.title} />
              <ModalInfoRow label="Rạp" value={showtime.theaterName} />
              <ModalInfoRow label="Suất" value={`${showtime.date} • ${showtime.time}`} />
              <ModalInfoRow label="Ghế" value={selectedSeats.join(', ')} />
            </View>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setSuccessModal(false);
                navigation.navigate('MainTabs', { screen: 'Tickets' });
              }}
            >
              <Text style={styles.modalBtnText}>Xem vé của tôi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBtnOutline}
              onPress={() => {
                setSuccessModal(false);
                navigation.navigate('MainTabs', { screen: 'Home' });
              }}
            >
              <Text style={styles.modalBtnOutlineText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoRow({ icon, label, value, highlight }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoHighlight]}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.rowDivider} />;
}

function ModalInfoRow({ label, value }) {
  return (
    <View style={styles.modalInfoRow}>
      <Text style={styles.modalInfoLabel}>{label}</Text>
      <Text style={styles.modalInfoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f1f5f9' },
  container: { flex: 1 },

  header: {
    backgroundColor: '#0f2552', paddingTop: 52, paddingBottom: 18,
    paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10 },
  backBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },

  movieCard: {
    flexDirection: 'row', backgroundColor: '#fff', margin: 16, borderRadius: 18,
    overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
  },
  moviePoster: { width: 90, height: 130 },
  movieInfo: { flex: 1, padding: 14, justifyContent: 'center', gap: 8 },
  movieTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  genreTag: { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  genreTagText: { color: '#1d4ed8', fontSize: 11, fontWeight: '700' },
  movieMeta: { color: '#64748b', fontSize: 13 },

  ticketCard: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 18,
    overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
  },
  ticketHeader: { backgroundColor: '#0f2552', paddingVertical: 10, paddingHorizontal: 16 },
  ticketHeaderText: { color: '#7da8d8', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  infoIcon: { fontSize: 16, marginRight: 10 },
  infoLabel: { flex: 1, color: '#64748b', fontSize: 14 },
  infoValue: { color: '#0f172a', fontSize: 14, fontWeight: '700', maxWidth: '50%', textAlign: 'right' },
  infoHighlight: { color: '#1d4ed8' },
  rowDivider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 16 },

  perforated: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  circleLeft: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#f1f5f9', marginLeft: -10 },
  circleRight: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#f1f5f9', marginRight: -10 },
  dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },

  priceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  priceLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  priceSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  priceValue: { fontSize: 24, fontWeight: '900', color: '#1d4ed8' },

  noteCard: {
    backgroundColor: '#fefce8', margin: 16, borderRadius: 14,
    padding: 14, borderLeftWidth: 3, borderLeftColor: '#f5a623',
  },
  noteTitle: { fontSize: 13, fontWeight: '800', color: '#92400e', marginBottom: 8 },
  noteText: { color: '#78350f', fontSize: 12, marginBottom: 4, lineHeight: 18 },

  stickyBottom: {
    backgroundColor: '#fff', padding: 16, paddingBottom: 28,
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  confirmBtn: { backgroundColor: '#1d4ed8', borderRadius: 14, padding: 17, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center' },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successIcon: { color: '#fff', fontSize: 40, fontWeight: '900' },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  successSub: { color: '#64748b', fontSize: 14, marginBottom: 20 },

  ticketCodeBox: { backgroundColor: '#eff6ff', borderRadius: 16, padding: 16, alignItems: 'center', width: '100%', marginBottom: 20 },
  ticketCodeLabel: { color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  ticketCode: { fontSize: 32, fontWeight: '900', color: '#1d4ed8', letterSpacing: 4 },
  ticketCodeHint: { color: '#94a3b8', fontSize: 11, marginTop: 6 },

  modalInfo: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, marginBottom: 20 },
  modalInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  modalInfoLabel: { color: '#94a3b8', fontSize: 13 },
  modalInfoValue: { color: '#0f172a', fontSize: 13, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },

  modalBtn: { backgroundColor: '#1d4ed8', borderRadius: 12, padding: 14, alignItems: 'center', width: '100%', marginBottom: 10 },
  modalBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  modalBtnOutline: { borderRadius: 12, padding: 12, alignItems: 'center', width: '100%', borderWidth: 1.5, borderColor: '#e2e8f0' },
  modalBtnOutlineText: { color: '#475569', fontWeight: '700', fontSize: 14 },
});
