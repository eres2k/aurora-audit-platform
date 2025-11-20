import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Building2, CheckCircle2 } from 'lucide-react';

const StationSelector = () => {
  const { user, stations, selectedStation, selectStation } = useAuth();

  // Station metadata
  const stationDetails = {
    DVI1: { name: 'DVI1', fullName: 'Distribution Center 1', color: 'bg-blue-500' },
    DVI2: { name: 'DVI2', fullName: 'Distribution Center 2', color: 'bg-indigo-500' },
    DVI3: { name: 'DVI3', fullName: 'Distribution Center 3', color: 'bg-purple-500' },
    DAP5: { name: 'DAP5', fullName: 'Delivery Station 5', color: 'bg-green-500' },
    DAP8: { name: 'DAP8', fullName: 'Delivery Station 8', color: 'bg-teal-500' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Station</h1>
          <p className="text-gray-600">
            Welcome, {user?.user_metadata?.full_name || user?.email}
          </p>
          <p className="text-gray-500 text-sm mt-1">Choose a station to begin your audit session</p>
        </div>

        {/* Station Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {stations.map((station) => {
            const details = stationDetails[station];
            const isSelected = selectedStation === station;

            return (
              <button
                key={station}
                onClick={() => selectStation(station)}
                className={`
                  relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 text-left
                  ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : 'hover:scale-105'}
                `}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                )}

                {/* Station Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 ${details.color} rounded-lg mb-4`}>
                  <MapPin className="w-7 h-7 text-white" />
                </div>

                {/* Station Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{details.name}</h3>
                <p className="text-gray-600 text-sm">{details.fullName}</p>

                {/* Status Badge */}
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        {selectedStation && (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-gray-700 mb-4">
              You have selected: <span className="font-bold text-blue-600">{selectedStation}</span>
            </p>
            <p className="text-sm text-gray-500">
              Click anywhere outside this panel or the logo to continue to your dashboard
            </p>
          </div>
        )}

        {/* Info Card */}
        {!selectedStation && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-blue-800 text-sm">
              Select a station to access audit templates and begin your safety inspections
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationSelector;
