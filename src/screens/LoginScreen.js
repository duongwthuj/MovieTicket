import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from '../components/Toast';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        showToast('Email hoặc mật khẩu không đúng');
      } else if (error.code === 'auth/user-not-found') {
        showToast('Tài khoản không tồn tại');
      } else if (error.code === 'auth/too-many-requests') {
        showToast('Quá nhiều lần thử. Vui lòng thử lại sau');
      } else {
        showToast('Đăng nhập thất bại. Vui lòng thử lại');
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
        <Text style={styles.logo}>🎬 MovieTix</Text>
        <Text style={styles.subtitle}>Đặt vé xem phim dễ dàng</Text>

        <View style={styles.card}>
          <Text style={styles.title}>Đăng nhập</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Chưa có tài khoản? <Text style={styles.linkBold}>Đăng ký</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#a0b4d0', textAlign: 'center', marginBottom: 32, fontSize: 14 },
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
