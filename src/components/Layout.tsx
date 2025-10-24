import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ClipboardCheck, FileText, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout() {
  const location = useLocation();

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/audit/new', icon: ClipboardCheck, label: 'Audit' },
    { path: '/completed', icon: FileText, label: 'Completed' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="border-t bg-white safe-area-inset">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  'flex flex-col items-center py-2 px-3 text-xs',
                  isActive ? 'text-orange-600' : 'text-gray-600'
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
