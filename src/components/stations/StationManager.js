// src/components/stations/StationManager.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

// Define audit stations
const AUDIT_STATIONS = [
  { 
    id: 'DVI1', 
    name: 'DVI Station 1', 
    description: 'Digital Visual Inspection Station 1',
    color: '#4F46E5',
    icon: '🔍',
    categories: ['Visual Inspection', 'Quality Control', 'Component Check']
  },
  { 
    id: 'DVI2', 
    name: 'DVI Station 2', 
    description: 'Digital Visual Inspection Station 2',
    color: '#7C3AED',
    icon: '🔎',
    categories: ['Visual Inspection', 'Surface Analysis', 'Defect Detection']
  },
  { 
    id: 'DVI3', 
    name: 'DVI Station 3', 
    description: 'Digital Visual Inspection Station 3',
    color: '#EC4899',
    icon: '📋',
    categories: ['Visual Inspection', 'Final Check', 'Documentation']
  },
  { 
    id: 'DAP5', 
    name: 'DAP Station 5', 
    description: 'Digital Audit Platform Station 5',
    color: '#F59E0B',
    icon: '📊',
    categories: ['Process Audit', 'Compliance Check', 'Performance Review']
  },
  { 
    id: 'DAP8', 
    name: 'DAP Station 8', 
    description: 'Digital Audit Platform Station 8',
    color: '#10B981',
    icon: '✅',
    categories: ['Final Audit', 'Sign-off', 'Certification']
  }
];

export default function StationManager() {
  const { user, hasPermission } = useAuth();
  const [selectedStation, setSelectedStation] = useState(null);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    station_id: '',
    template_id: null,
    due_date: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (selectedStation) {
      fetchStationAudits(selectedStation.id);
    }
  }, [selectedStation]);

  const fetchStationAudits = async (stationId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('station_id', stationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      console.error('Error fetching audits:', error);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  const createAudit = async () => {
    if (!hasPermission('create')) {
      alert('You do not have permission to create audits');
      return;
    }

    try {
      const auditData = {
        ...formData,
        station_id: selectedStation.id,
        created_by: user.id,
        status: 'draft',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('audits')
        .insert([auditData])
        .select();

      if (error) throw error;

      setAudits([data[0], ...audits]);
      setShowNewAuditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating audit:', error);
      alert('Failed to create audit. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      station_id: '',
      template_id: null,
      due_date: '',
      priority: 'medium'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600',
      critical: 'text-red-800 font-bold'
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Audit Stations
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Select a station to view and manage audits
          </p>
        </div>

        {/* Station Grid */}
        {!selectedStation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AUDIT_STATIONS.map(station => (
              <div
                key={station.id}
                onClick={() => setSelectedStation(station)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500 overflow-hidden"
              >
                <div 
                  className="h-2"
                  style={{ backgroundColor: station.color }}
                />
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">{station.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {station.name}
                      </h3>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {station.id}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {station.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {station.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Station Detail View */
          <div>
            {/* Back Button and Station Header */}
            <div className="mb-6">
              <button
                onClick={() => setSelectedStation(null)}
                className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Stations
              </button>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-4xl mr-3">{selectedStation.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStation.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedStation.description}
                    </p>
                  </div>
                </div>
                
                {hasPermission('create') && (
                  <button
                    onClick={() => setShowNewAuditModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Audit
                  </button>
                )}
              </div>
            </div>

            {/* Audits List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : audits.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No audits found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create your first audit for this station
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {audits.map(audit => (
                        <tr key={audit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {audit.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {audit.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(audit.status)}`}>
                              {audit.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm ${getPriorityColor(audit.priority)}`}>
                              {audit.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {audit.due_date ? new Date(audit.due_date).toLocaleDateString() : 'No due date'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                              View
                            </button>
                            {hasPermission('update') && (
                              <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* New Audit Modal */}
        {showNewAuditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Create New Audit
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter audit title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Enter audit description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewAuditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createAudit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Audit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}