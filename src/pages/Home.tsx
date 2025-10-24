import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clipboard, ClipboardList, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { auditDB } from '@/lib/db';
import type { Template, Audit, Action } from '@/types';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [drafts, setDrafts] = useState<Audit[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesData, draftsData, actionsData] = await Promise.all([
        api.getTemplates(),
        auditDB.getAllDrafts(),
        api.getActions({ status: 'OPEN', assigneeId: user?.id })
      ]);

      setTemplates(templatesData);
      setDrafts(draftsData);
      setActions(actionsData);

      // Cache templates offline
      templatesData.forEach((template) => auditDB.saveTemplate(template));
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-orange-600 text-white rounded-lg p-4">
        <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
        <p className="text-orange-100">Site: {user?.siteIds[0] || 'Unknown'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card
          className="p-4 flex flex-col items-center cursor-pointer hover:shadow-lg"
          onClick={() => navigate('/audit/new')}
        >
          <Clipboard className="h-8 w-8 text-orange-600 mb-2" />
          <span className="font-medium">Start Audit</span>
        </Card>

        <Card
          className="p-4 flex flex-col items-center cursor-pointer hover:shadow-lg"
          onClick={() => navigate('/completed')}
        >
          <ClipboardList className="h-8 w-8 text-blue-600 mb-2" />
          <span className="font-medium">View Completed</span>
        </Card>
      </div>

      {actions.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
            <h2 className="font-semibold">My Open Actions ({actions.length})</h2>
          </div>
          <div className="space-y-2">
            {actions.slice(0, 3).map((action) => (
              <div key={action.actionId} className="border-l-4 border-orange-500 pl-3 py-2">
                <p className="font-medium text-sm">{action.description}</p>
                <p className="text-xs text-gray-600">
                  Due: {new Date(action.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {drafts.length > 0 && (
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Resume Drafts</h2>
          <div className="space-y-2">
            {drafts.map((draft) => (
              <Button
                key={draft.auditId}
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/audit/${draft.auditId}`)}
              >
                {draft.siteName} - {new Date(draft.startedAt).toLocaleDateString()}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {templates.length > 0 && (
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Available Templates</h2>
          <ul className="space-y-1 text-sm text-gray-600">
            {templates.map((template) => (
              <li key={template.templateId}>• {template.title}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
