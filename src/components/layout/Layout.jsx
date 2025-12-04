import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import GlobalChatButton from './GlobalChatButton';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-72 overflow-x-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 lg:p-6 pb-24 lg:pb-6 overflow-x-hidden max-w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Global Ask AuditHub Button */}
      <GlobalChatButton />
    </div>
  );
}
