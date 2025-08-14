import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to Aurora Audit Platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-2xl font-bold text-primary-600">12</div>
          <div className="text-sm text-gray-600">Active Audits</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-green-600">8</div>
          <div className="text-sm text-gray-600">Completed This Month</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-blue-600">156</div>
          <div className="text-sm text-gray-600">Total Questions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Audits</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Safety Inspection - Building A</span>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Equipment Check - Floor 2</span>
              <span className="text-sm text-yellow-600">In Progress</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Monthly Review - Kitchen</span>
              <span className="text-sm text-blue-600">Scheduled</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="btn btn-primary w-full">Start New Audit</button>
            <button className="btn btn-secondary w-full">View Templates</button>
            <button className="btn btn-secondary w-full">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}
