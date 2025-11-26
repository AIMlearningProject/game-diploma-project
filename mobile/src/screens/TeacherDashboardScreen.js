import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

export default function TeacherDashboardScreen() {
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const alertsRes = await api.get(`/teachers/${user.id}/alerts`);
      setAlerts(alertsRes.data.alerts);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeacherData();
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
        <Text style={styles.welcomeText}>Opettajan työpöytä</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>
            {alerts.length}
          </Text>
          <Text style={styles.statLabel}>Hälytyksiä yhteensä</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#f97316' }]}>
            {alerts.filter(a => a.severity === 'high').length}
          </Text>
          <Text style={styles.statLabel}>Korkea prioriteetti</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#eab308' }]}>
            {alerts.filter(a => a.severity === 'medium').length}
          </Text>
          <Text style={styles.statLabel}>Keskitaso</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Oppilashälytykset</Text>
        {alerts.length === 0 ? (
          <Text style={styles.emptyText}>Ei hälytyksiä. Kaikki oppilaat ovat aktiivisia!</Text>
        ) : (
          alerts.map((alert, index) => (
            <View
              key={index}
              style={[
                styles.alertCard,
                alert.severity === 'high'
                  ? styles.alertCardHigh
                  : styles.alertCardMedium,
              ]}
            >
              <View style={styles.alertInfo}>
                <Text style={styles.alertStudent}>{alert.student.name}</Text>
                <Text style={styles.alertClass}>{alert.className}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
              <View
                style={[
                  styles.alertBadge,
                  alert.severity === 'high'
                    ? styles.alertBadgeHigh
                    : styles.alertBadgeMedium,
                ]}
              >
                <Text style={styles.alertBadgeText}>
                  {alert.type === 'INACTIVE' ? 'PASSIIVINEN' :
                   alert.type === 'LOW_ENGAGEMENT' ? 'VÄHÄN AKTIIVISUUTTA' : alert.type}
                </Text>
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
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
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
  alertCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertCardHigh: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  alertCardMedium: {
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  alertInfo: {
    flex: 1,
  },
  alertStudent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  alertClass: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: '#374151',
    marginTop: 6,
  },
  alertBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  alertBadgeHigh: {
    backgroundColor: '#fecaca',
  },
  alertBadgeMedium: {
    backgroundColor: '#fef08a',
  },
  alertBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
});
