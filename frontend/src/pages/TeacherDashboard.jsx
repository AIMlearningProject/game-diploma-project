import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuthStore } from '../stores/authStore';

function TeacherDashboard() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classData, setClassData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const alertsRes = await api.get(`/teachers/${user.id}/alerts`);
      setAlerts(alertsRes.data.alerts);
    } catch (error) {
      console.error('Virhe haettaessa opettajan tietoja:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyLog = async (logId, verified) => {
    try {
      await api.post(`/teachers/${user.id}/verify-log`, { logId, verified });
      if (selectedClass) {
        fetchClassOverview(selectedClass);
      }
    } catch (error) {
      console.error('Virhe vahvistettaessa kirjausta:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Ladataan...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="mb-8">Opettajan työpöytä</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-600 mb-2">Hälytyksiä yhteensä</h3>
          <p className="text-3xl font-bold text-red-600">
            {alerts.length}
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 mb-2">Korkea prioriteetti</h3>
          <p className="text-3xl font-bold text-orange-600">
            {alerts.filter(a => a.severity === 'high').length}
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 mb-2">Keskitason prioriteetti</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {alerts.filter(a => a.severity === 'medium').length}
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="mb-4">Oppilashälytykset</h2>
        {alerts.length === 0 ? (
          <p className="text-gray-600">Ei hälytyksiä. Kaikki oppilaat ovat aktiivisia!</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{alert.student.name}</p>
                    <p className="text-sm text-gray-600">{alert.className}</p>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      alert.severity === 'high'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}
                  >
                    {alert.type === 'INACTIVE' ? 'PASSIIVINEN' :
                     alert.type === 'LOW_ENGAGEMENT' ? 'VÄHÄN AKTIIVISUUTTA' : alert.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-4">Luokan hallinta</h2>
        <p className="text-gray-600">
          Valitse luokka nähdäksesi yksityiskohtaisen oppilaiden edistymisen ja vahvistaaksesi lukupäiväkirjat.
        </p>
        <div className="mt-4">
          <button className="btn btn-primary">
            Näytä luokan yhteenveto
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
