import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Audit } from '@/types';

export default function CompletedAudits() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAudits = async () => {
    try {
      const data = await api.getAudits({
        siteId: user?.siteIds[0]
      });
      setAudits(data);
    } catch (error) {
      console.error('Failed to load audits', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (auditId: string) => {
    try {
      const blob = await api.exportPdf(auditId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-${auditId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Completed Audits</h1>

      {audits.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No completed audits yet</Card>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => (
            <Card key={audit.auditId} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{audit.siteName}</h3>
                  {audit.completedAt && (
                    <p className="text-sm text-gray-600">{formatDate(audit.completedAt)}</p>
                  )}
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex px-2 py-1 rounded text-sm font-medium ${
                      (audit.score?.percent || 0) >= 80
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {audit.score?.percent ?? 0}%
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">Auditor: {audit.auditor.name}</p>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport(audit.auditId)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
