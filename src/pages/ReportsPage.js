// ===================================
// src/pages/ReportsPage.js
// ===================================
import React from 'react';

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Generate and export audit reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Export
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <span className="flex items-center">
                <span className="text-xl mr-3">📄</span>
                <span className="font-medium">Export to PDF</span>
              </span>
              <span className="text-gray-500">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <span className="flex items-center">
                <span className="text-xl mr-3">📊</span>
                <span className="font-medium">Export to Excel</span>
              </span>
              <span className="text-gray-500">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Report Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Reports Generated</span>
              <span className="font-semibold text-gray-900 dark:text-white">23</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">This Month</span>
              <span className="font-semibold text-gray-900 dark:text-white">7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Export</span>
              <span className="font-semibold text-gray-900 dark:text-white">2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}