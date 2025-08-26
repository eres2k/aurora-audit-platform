import React from 'react';
import { Routes, Route } from 'react-router-dom';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
    </Routes>
  );
}
