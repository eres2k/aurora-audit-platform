import React from 'react';
import { Card, CardContent, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';

import { getSafetyCultureTemplate } from '../data/safetyCultureTemplate';

export default function QuestionEditor() {
  const sections = getSafetyCultureTemplate();

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Safety Culture Question Library</Typography>
      <Typography variant="body1" color="text.secondary">
        The Safety Culture template provides a structured set of prompts across leadership, reporting, and engagement. Review the
        prompts below to tailor them to your organisation or export them for workshops.
      </Typography>

      {sections.map((section) => (
        <Card key={section.id} variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {section.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {section.description}
            </Typography>
            <List>
              {section.questions.map((question) => (
                <ListItem key={question.id} alignItems="flex-start">
                  <ListItemText
                    primary={question.prompt}
                    secondary={question.guidance}
                    primaryTypographyProps={{ variant: 'subtitle1' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
