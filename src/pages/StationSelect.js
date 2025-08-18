import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const stations = ['DVI1', 'DVI2', 'DVI3', 'DAP5', 'DAP8'];

const StationSelect = () => {
  const [station, setStation] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (!station) return;
    localStorage.setItem('aurora_station', station);
    navigate('/audit');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <h2 className="text-2xl font-semibold mb-4">Select Station</h2>
      <select
        className="border p-2 rounded mb-4 w-64"
        value={station}
        onChange={(e) => setStation(e.target.value)}
      >
        <option value="">Choose station</option>
        {stations.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        onClick={handleStart}
        className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        disabled={!station}
      >
        Start Audit
      </button>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-4 text-blue-600 underline"
      >
        View Dashboard
      </button>
    </div>
  );
};

export default StationSelect;
