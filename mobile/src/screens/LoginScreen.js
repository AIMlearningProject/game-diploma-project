import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Virhe', 'Syötä sähköposti ja salasana');
      return;
    }

    const result = await login(email, password);

    if (!result.success) {
      Alert.alert('Kirjautuminen epäonnistui', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lukudiplomi</Text>
      <Text style={styles.subtitle}>Lukupeli</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Sähköposti"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Salasana"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Kirjaudu sisään</Text>
          )}
        </TouchableOpacity>

        <View style={styles.oauthContainer}>
          <Text style={styles.oauthText}>Tai kirjaudu:</Text>
          <View style={styles.oauthButtons}>
            <TouchableOpacity style={styles.oauthButton}>
              <Text style={styles.oauthButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.oauthButton}>
              <Text style={styles.oauthButtonText}>Microsoft</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  oauthContainer: {
    marginTop: 24,
  },
  oauthText: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 12,
  },
  oauthButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  oauthButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  oauthButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});
