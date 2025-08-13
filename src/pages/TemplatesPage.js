// ===================================
// src/pages/TemplatesPage.js
// ===================================
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function TemplatesPage() {
  const { hasPermission } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Templates</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create and manage audit templates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample template cards */}
        {['Safety Audit', 'Quality Control', 'Compliance Check'].map((template) => (
          <div key={template} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">📄</span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                Template
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {template}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Standard template for {template.toLowerCase()}
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Use Template →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
