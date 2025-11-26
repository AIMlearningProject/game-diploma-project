import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Board</Text>
      <Text style={styles.subtitle}>
        Board game visualization would be implemented here using React Native Canvas or WebView with Phaser
      </Text>
      <Text style={styles.note}>
        For full game experience, use the web version
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  note: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
