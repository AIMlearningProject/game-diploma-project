import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

export default function StudentDashboardScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const [gameState, setGameState] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [stateRes, historyRes] = await Promise.all([
        api.get(`/students/${user.id}/state`),
        api.get(`/students/${user.id}/history?limit=5`),
      ]);

      setGameState(stateRes.data.gameState);
      setRecentBooks(historyRes.data.logs);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Tervetuloa takaisin, {user?.name}!</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{gameState?.boardPosition || 0}</Text>
          <Text style={styles.statLabel}>Sijaintisi</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#22c55e' }]}>
            {gameState?.streak || 0}
          </Text>
          <Text style={styles.statLabel}>Putki</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#8b5cf6' }]}>
            {gameState?.level || 1}
          </Text>
          <Text style={styles.statLabel}>Taso</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.navigate('Game')}
        >
          <Text style={styles.actionButtonText}>Jatka pelaamista</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('LogBook')}
        >
          <Text style={[styles.actionButtonText, { color: '#374151' }]}>
            Kirjaa kirja
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Viimeisimmät kirjat</Text>
        {recentBooks.length === 0 ? (
          <Text style={styles.emptyText}>Ei vielä kirjattuja kirjoja</Text>
        ) : (
          recentBooks.map((log) => (
            <View key={log.id} style={styles.bookCard}>
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{log.book.title}</Text>
                <Text style={styles.bookAuthor}>{log.book.author}</Text>
                <Text style={styles.bookPages}>{log.pagesRead} sivua</Text>
              </View>
              <View style={styles.bookRewards}>
                <Text style={styles.rewardText}>+{log.stepsAwarded} askelta</Text>
                <Text style={styles.rewardText}>+{log.pointsAwarded} XP</Text>
                {log.verifiedByTeacher ? (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Vahvistettu</Text>
                  </View>
                ) : (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Odottaa</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0ea5e9',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  bookPages: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  bookRewards: {
    alignItems: 'flex-end',
  },
  rewardText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: '#065f46',
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  pendingText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '600',
  },
});
