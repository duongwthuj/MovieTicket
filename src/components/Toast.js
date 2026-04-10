import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function Toast({ visible, message, type = 'error', onHide }) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onHide && onHide());
    }
  }, [visible]);

  if (!visible) return null;

  const bg = type === 'success' ? '#22c55e' : type === 'warning' ? '#f5a623' : '#ef4444';
  const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✕';

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: bg }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 60, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, padding: 14, zIndex: 9999,
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8,
  },
  icon: { color: '#fff', fontSize: 16, fontWeight: '900', marginRight: 10 },
  message: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
});
