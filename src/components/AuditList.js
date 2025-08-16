import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Button } from '@mui/material';
import { getAudits } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { hasRole } from '../services/auth';

const AuditList = () => {
  const [audits, setAudits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAudits = async () => {
      const data = await getAudits();
      setAudits(data);
    };
    fetchAudits();
  }, []);

  return (
    <List>
      {audits.map((audit) => (
        <ListItem key={audit.id}>
          <ListItemText primary={audit.title} secondary={audit.status} />
          <Button onClick={() => navigate(`/audit/${audit.id}`)}>View</Button>
          {hasRole('admin') && <Button>Delete</Button>}
        </ListItem>
      ))}
    </List>
  );
};

export default AuditList;
