import React from 'react';

const DashboardPage = () => {
  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd' }}>
          <h3>Total Audits</h3>
          <p style={{ fontSize: '24px' }}>0</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd' }}>
          <h3>In Progress</h3>
          <p style={{ fontSize: '24px' }}>0</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd' }}>
          <h3>Completed</h3>
          <p style={{ fontSize: '24px' }}>0</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd' }}>
          <h3>Templates</h3>
          <p style={{ fontSize: '24px' }}>0</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
