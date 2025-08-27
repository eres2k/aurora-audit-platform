import React from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';

export function HomePage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Aurora Audit Platform
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Professional auditing system for managing templates, questions and audit reports.
      </Typography>
      <List>
        <ListItem><ListItemText primary="Multi-User authentication with role support" /></ListItem>
        <ListItem><ListItemText primary="Dynamic audit and question management" /></ListItem>
        <ListItem><ListItemText primary="Import and export via Excel" /></ListItem>
        <ListItem><ListItemText primary="Professional PDF reporting" /></ListItem>
        <ListItem><ListItemText primary="Mobile ready user experience" /></ListItem>
      </List>
    </Container>
  );
}
