
// src/pages/AuditsPage.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuditsPage() {
  const { hasPermission } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audits</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage all audits across stations
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Audits Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage audits from the Stations page
          </p>
        </div>
      </div>
    </div>
  );
}