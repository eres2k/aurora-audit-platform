//  ===================================
// src/pages/QuestionsPage.js
// ===================================
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function QuestionsPage() {
  const { hasPermission } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Questions</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage audit questions and categories
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Questions Library
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Question management coming soon
          </p>
          {hasPermission('create') && (
            <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Import Questions
            </button>
          )}
        </div>
      </div>
    </div>
  );
}