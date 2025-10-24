import { useAuth } from '@/features/auth/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card className="p-4 space-y-2">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium">{user?.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-medium">{user?.role}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Sites</p>
          <p className="font-medium">{user?.siteIds.join(', ') || 'None'}</p>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div>
          <p className="font-semibold">Session</p>
          <p className="text-sm text-gray-600">
            Sign out of the application. You will need to authenticate again to regain access.
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
