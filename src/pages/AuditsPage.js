import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateAuditDialog from '../components/audit/CreateAuditDialog';

const AuditsPage = () => {
  // // const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [audits] = useState([]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Audits</h2>
        <button onClick={() => setCreateDialogOpen(true)} style={{ padding: '10px 20px' }}>
          New Audit
        </button>
      </div>

      {audits.length === 0 ? (
        <p>No audits found. Create your first audit!</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Title</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((audit) => (
              <tr key={audit.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{audit.title}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{audit.status}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{audit.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CreateAuditDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </div>
  );
};

export default AuditsPage;
