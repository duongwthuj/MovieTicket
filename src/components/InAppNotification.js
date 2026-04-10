import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

export default function InAppNotification({ visible, title, body, onHide }) {
  const translateY = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80 }),
        Animated.delay(4000),
        Animated.timing(translateY, { toValue: -120, duration: 300, useNativeDriver: true }),
      ]).start(() => onHide && onHide());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>🎬</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body} numberOfLines={2}>{body}</Text>
      </View>
      <TouchableOpacity onPress={onHide} style={styles.close}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 50, left: 12, right: 12, zIndex: 9999,
    backgroundColor: '#1e293b', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, elevation: 20,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#1d4ed8',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  icon: { fontSize: 22 },
  content: { flex: 1 },
  title: { color: '#fff', fontWeight: '800', fontSize: 14, marginBottom: 3 },
  body: { color: '#94a3b8', fontSize: 12, lineHeight: 17 },
  close: { padding: 4, marginLeft: 8 },
  closeText: { color: '#475569', fontSize: 16 },
});
