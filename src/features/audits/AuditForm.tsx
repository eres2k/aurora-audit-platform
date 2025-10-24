import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { Template, Audit, AuditItem } from '@/types';
import { compressImage } from '@/lib/utils';
import { auditDB } from '@/lib/db';

interface AuditFormProps {
  template: Template;
  audit: Audit;
  onSave: (audit: Audit) => void;
  onComplete: (audit: Audit) => void;
}

export default function AuditForm({ template, audit, onSave, onComplete }: AuditFormProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);
  const [responses, setResponses] = useState<Record<string, AuditItem>>({});
  const [photos, setPhotos] = useState<Record<string, string[]>>({});

  const section = template.sections[currentSection];
  const item = section?.items[currentItem];

  useEffect(() => {
    if (audit?.items) {
      const responsesMap = audit.items.reduce((acc, auditItem) => {
        acc[auditItem.id] = auditItem;
        return acc;
      }, {} as Record<string, AuditItem>);
      setResponses(responsesMap);
    }
  }, [audit]);

  const persistDraft = (updatedResponses: Record<string, AuditItem>) => {
    const updatedAudit: Audit = {
      ...audit,
      items: Object.values(updatedResponses)
    };
    onSave(updatedAudit);
  };

  const handleResponse = (itemId: string, responseValue: 'YES' | 'NO' | 'NA') => {
    setResponses((prev) => {
      const updated = {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          id: itemId,
          title: item?.title || '',
          response: responseValue
        }
      };
      persistDraft(updated);
      return updated;
    });
  };

  const handleNotes = (itemId: string, notes: string) => {
    setResponses((prev) => {
      const updated = {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          id: itemId,
          title: item?.title || '',
          notes
        }
      };
      persistDraft(updated);
      return updated;
    });
  };

  const handlePhoto = async (itemId: string, file: File) => {
    const compressed = await compressImage(file);
    const mediaId = await auditDB.queueMedia(audit.auditId || 'temp', compressed);

    setPhotos((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), mediaId]
    }));

    setResponses((prev) => {
      const updated = {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          id: itemId,
          title: item?.title || '',
          photos: [...(prev[itemId]?.photos || []), mediaId]
        }
      };
      persistDraft(updated);
      return updated;
    });
  };

  const handleNext = () => {
    if (!item) return;

    if (currentItem < section.items.length - 1) {
      setCurrentItem((prev) => prev + 1);
    } else if (currentSection < template.sections.length - 1) {
      setCurrentSection((prev) => prev + 1);
      setCurrentItem(0);
    } else {
      const auditData: Audit = {
        ...audit,
        items: Object.values(responses),
        status: 'DRAFT'
      };
      onComplete(auditData);
    }
  };

  const handlePrevious = () => {
    if (currentItem > 0) {
      setCurrentItem((prev) => prev - 1);
    } else if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
      const prevSection = template.sections[currentSection - 1];
      setCurrentItem(prevSection.items.length - 1);
    }
  };

  const progress = {
    total: template.sections.reduce((acc, s) => acc + s.items.length, 0),
    current:
      template.sections.slice(0, currentSection).reduce((acc, s) => acc + s.items.length, 0) +
      currentItem +
      1
  };

  if (!item) return null;

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{section.title}</span>
          <span>
            {progress.current} / {progress.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-600 h-2 rounded-full transition-all"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>
      </div>

      <Card className="flex-1 p-6 mb-4">
        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
        {item.guidance && <p className="text-sm text-gray-600 mb-4">{item.guidance}</p>}

        <RadioGroup
          value={responses[item.id]?.response || ''}
          onValueChange={(value: 'YES' | 'NO' | 'NA') => handleResponse(item.id, value)}
          className="space-y-2 mb-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="YES" id={`${item.id}-yes`} />
            <Label htmlFor={`${item.id}-yes`} className="text-green-600 font-medium">
              Yes / Pass
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="NO" id={`${item.id}-no`} />
            <Label htmlFor={`${item.id}-no`} className="text-red-600 font-medium">
              No / Fail
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="NA" id={`${item.id}-na`} />
            <Label htmlFor={`${item.id}-na`} className="text-gray-600">
              Not Applicable
            </Label>
          </div>
        </RadioGroup>

        <Textarea
          placeholder="Add notes..."
          value={responses[item.id]?.notes || ''}
          onChange={(e) => handleNotes(item.id, e.target.value)}
          className="mb-4"
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => document.getElementById(`photo-${item.id}`)?.click()}
          >
            <Camera className="h-4 w-4 mr-2" />
            Add Photo
          </Button>
          <input
            id={`photo-${item.id}`}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhoto(item.id, file);
            }}
          />
        </div>

        {photos[item.id] && (
          <div className="flex gap-2 mt-4">
            {photos[item.id].map((photo, idx) => (
              <div key={photo + idx} className="w-16 h-16 bg-gray-200 rounded" />
            ))}
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSection === 0 && currentItem === 0}
        >
          Previous
        </Button>
        <Button className="flex-1" onClick={handleNext}>
          {currentSection === template.sections.length - 1 && currentItem === section.items.length - 1
            ? 'Review & Complete'
            : 'Next'}
        </Button>
      </div>
    </div>
  );
}
