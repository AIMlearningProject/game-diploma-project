import React from 'react';
import { useAuthStore } from '../stores/authStore';

function Profile() {
  const { user } = useAuthStore();

  const roleNames = {
    STUDENT: 'Oppilas',
    TEACHER: 'Opettaja',
    ADMIN: 'Pääkäyttäjä'
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="mb-8">Profiili</h1>

      <div className="card">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-primary-200 rounded-full flex items-center justify-center">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profiilikuva"
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <span className="text-4xl font-bold text-primary-700">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <h2>{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-md text-sm font-medium">
              {roleNames[user?.role] || user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nimi</label>
            <input
              type="text"
              className="input"
              value={user?.name || ''}
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sähköposti</label>
            <input
              type="email"
              className="input"
              value={user?.email || ''}
              readOnly
            />
          </div>

          {user?.studentProfile && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Luokka-aste</label>
                <input
                  type="number"
                  className="input"
                  value={user.studentProfile.gradeLevel || ''}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Lukutavoite</label>
                <input
                  type="number"
                  className="input"
                  value={user.studentProfile.readingGoal || ''}
                  readOnly
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
