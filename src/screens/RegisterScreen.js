import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from '../components/Toast';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      showToast('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password !== confirm) {
      showToast('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name, email, createdAt: new Date().toISOString()
      });
      showToast('Đăng ký thành công!', 'success');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showToast('Email này đã được sử dụng');
      } else if (error.code === 'auth/invalid-email') {
        showToast('Email không hợp lệ');
      } else {
        showToast('Đăng ký thất bại. Vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a1628', '#1a3a6b']} style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.logo}>🎬 MovieTix</Text>

          <View style={styles.card}>
            <Text style={styles.title}>Tạo tài khoản</Text>

            <TextInput style={styles.input} placeholder="Họ và tên" placeholderTextColor="#aaa"
              value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa"
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Mật khẩu" placeholderTextColor="#aaa"
              value={password} onChangeText={setPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Xác nhận mật khẩu" placeholderTextColor="#aaa"
              value={confirm} onChangeText={setConfirm} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng ký</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, paddingTop: 60 },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a3a6b', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#dde3f0', borderRadius: 10,
    padding: 14, marginBottom: 14, color: '#333', fontSize: 15
  },
  button: {
    backgroundColor: '#1a3a6b', borderRadius: 10,
    padding: 15, alignItems: 'center', marginTop: 4, marginBottom: 16
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', color: '#888', fontSize: 14 },
  linkBold: { color: '#1a3a6b', fontWeight: 'bold' },
});
