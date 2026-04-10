import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [logoutModal, setLogoutModal] = useState(false);

  const getInitial = () => (user?.displayName || user?.email || 'U')[0].toUpperCase();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f2552', '#1a3a6b']} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View>
        <Text style={styles.name}>{user?.displayName || 'Người dùng'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.body}>
        <MenuItem icon="🎟️" label="Vé của tôi" />
        <MenuItem icon="🔔" label="Thông báo" />
        <MenuItem icon="🔒" label="Đổi mật khẩu" />
        <MenuItem icon="📞" label="Liên hệ hỗ trợ" />

        <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutModal(true)}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Logout confirm modal */}
      <Modal visible={logoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>👋</Text>
            <Text style={styles.modalTitle}>Đăng xuất?</Text>
            <Text style={styles.modalSub}>Bạn có chắc muốn đăng xuất khỏi tài khoản không?</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setLogoutModal(false)}
              >
                <Text style={styles.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => { setLogoutModal(false); signOut(auth); }}
              >
                <Text style={styles.confirmText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuItem({ icon, label }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { paddingTop: 60, paddingBottom: 32, alignItems: 'center' },
  avatar: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: '#3b82f6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontSize: 34, color: '#fff', fontWeight: '900' },
  name: { color: '#fff', fontSize: 20, fontWeight: '800' },
  email: { color: '#93c5fd', fontSize: 13, marginTop: 4 },
  body: { padding: 20 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 16, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
  },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: '#0f172a', fontWeight: '600' },
  arrow: { fontSize: 20, color: '#cbd5e1' },
  logoutBtn: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 12, borderWidth: 1.5, borderColor: '#ef4444',
  },
  logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center' },
  modalIcon: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  modalSub: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: '#475569', fontWeight: '700', fontSize: 15 },
  confirmBtn: { flex: 1, backgroundColor: '#ef4444', borderRadius: 12, padding: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
