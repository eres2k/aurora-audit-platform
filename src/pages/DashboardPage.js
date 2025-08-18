import React, { useEffect, useState } from 'react';
import { auditService } from '../services/auditService';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardPage = () => {
  const [audits, setAudits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    auditService.getAll().then(setAudits);
  }, []);

  const compliance = audits.reduce((acc, audit) => {
    let total = 0;
    let yes = 0;
    Object.values(audit.responses || {}).forEach((sec) => {
      Object.values(sec).forEach((item) => {
        total++;
        if (item.answer === 'yes') yes++;
      });
    });
    const rate = total ? (yes / total) * 100 : 0;
    acc[audit.station] = acc[audit.station]
      ? [...acc[audit.station], rate]
      : [rate];
    return acc;
  }, {});

  const stations = Object.keys(compliance);
  const data = {
    labels: stations,
    datasets: [
      {
        label: 'Average Compliance %',
        data: stations.map((s) =>
          compliance[s].reduce((a, b) => a + b, 0) / compliance[s].length
        ),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {stations.length > 0 && (
        <div className="mb-8">
          <Bar data={data} />
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2">Audit History</h2>
      <ul className="space-y-2">
        {audits.map((a) => (
          <li key={a.id} className="border p-2 rounded flex justify-between">
            <span>
              {new Date(a.date).toLocaleDateString()} - {a.station}
            </span>
            <div className="space-x-4">
              <button
                className="text-blue-600 underline"
                onClick={() => navigate(`/audit/${a.id}`)}
              >
                View
              </button>
              <button
                className="text-red-600 underline"
                onClick={async () => {
                  await auditService.remove(a.id);
                  setAudits(await auditService.getAll());
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardPage;
