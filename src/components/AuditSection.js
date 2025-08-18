import React, { useState } from 'react';

const AuditSection = ({ section, onChange }) => {
  const [open, setOpen] = useState(false);

  const handleItemChange = (itemId, field, value) => {
    onChange(section.id, itemId, field, value);
  };

  return (
    <div className="border rounded mb-4">
      <button
        type="button"
        className="w-full text-left px-4 py-2 bg-blue-100 font-semibold"
        onClick={() => setOpen(!open)}
      >
        {section.title}
      </button>
      {open && (
        <div className="p-4 space-y-4">
          {section.items.map((item) => (
            <div key={item.id} className="border-b pb-4">
              <div className="flex items-center justify-between">
                <span className="font-medium" title={item.aschg}>{item.text}</span>
                <div className="flex gap-2">
                  <label>
                    <input
                      type="radio"
                      name={`${section.id}-${item.id}`}
                      onChange={() => handleItemChange(item.id, 'answer', 'yes')}
                    />
                    <span className="ml-1">Yes</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`${section.id}-${item.id}`}
                      onChange={() => handleItemChange(item.id, 'answer', 'no')}
                    />
                    <span className="ml-1">No</span>
                  </label>
                </div>
              </div>
              <div className="mt-2">
                <textarea
                  placeholder="Notes"
                  className="w-full border p-2 rounded"
                  onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                />
              </div>
              <div className="mt-2 flex gap-2">
                <label className="flex items-center gap-1">
                  Severity:
                  <select
                    className="border p-1 rounded"
                    onChange={(e) => handleItemChange(item.id, 'severity', e.target.value)}
                  >
                    <option value="">-</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleItemChange(item.id, 'photo', reader.result);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditSection;
