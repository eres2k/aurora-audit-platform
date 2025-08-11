import React from 'react';
import { useParams } from 'react-router-dom';

const AuditDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h2>Audit Detail</h2>
      <p>Audit ID: {id}</p>
      <p>Details will be implemented here</p>
    </div>
  );
};

export default AuditDetailPage;
