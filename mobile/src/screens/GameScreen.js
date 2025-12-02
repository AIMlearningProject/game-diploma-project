import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pelilauta</Text>
      <Text style={styles.subtitle}>
        Pelilaudan visualisointi toteutettaisiin tässä käyttäen React Native Canvasia tai WebView-komponenttia Phaserin kanssa
      </Text>
      <Text style={styles.note}>
        Täyden pelikokemuksen saamiseksi käytä verkkoversion
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
