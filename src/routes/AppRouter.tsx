import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { AuditListPage } from '../pages/AuditListPage';
import { AuditFormPage } from '../pages/AuditFormPage';
import { QuestionsPage } from '../pages/QuestionsPage';
import { TemplatesPage } from '../pages/TemplatesPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/audits" element={<AuditListPage />} />
      <Route path="/audits/new" element={<AuditFormPage />} />
      <Route path="/audits/:id" element={<AuditFormPage />} />
      <Route path="/questions" element={<QuestionsPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
    </Routes>
  );
}
