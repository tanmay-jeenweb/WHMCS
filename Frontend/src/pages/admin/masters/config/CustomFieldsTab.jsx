import React from "react";

export default function CustomFieldsTab({
  customFields,
  setCustomFields
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Custom Fields List</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 mb-0">Define custom inputs clients must fill during ordering.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCustomFields([
              ...customFields,
              { id: Date.now(), name: "", type: "Text", description: "", regex: "", required: false, showOnOrder: true }
            ]);
          }}
          className="px-3.5 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
        >
          + Add Custom Field
        </button>
      </div>

      {customFields.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          No custom fields defined yet. Click "Add Custom Field" above.
        </div>
      ) : (
        <div className="space-y-4">
          {customFields.map((field, idx) => (
            <div key={field.id} className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl space-y-3 relative">
              <button
                type="button"
                onClick={() => {
                  setCustomFields(customFields.filter(f => f.id !== field.id));
                }}
                className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 bg-transparent border-none cursor-pointer flex items-center justify-center"
                title="Delete Field"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-1.5 12h-12L4.5 8.25m-1.5-1.5h18" />
                </svg>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pr-8">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Field Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Operating System"
                    value={field.name}
                    onChange={(e) => {
                      const newList = customFields.map((f, i) => i === idx ? { ...f, name: e.target.value } : f);
                      setCustomFields(newList);
                    }}
                    className="w-full box-border border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Field Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => {
                      const newList = customFields.map((f, i) => i === idx ? { ...f, type: e.target.value } : f);
                      setCustomFields(newList);
                    }}
                    className="w-full box-border border border-slate-300 bg-white rounded-lg py-1.5 px-2.5 text-xs outline-none focus:border-blue-600"
                  >
                    <option value="Text">Text</option>
                    <option value="Dropdown">Dropdown</option>
                    <option value="Textarea">Textarea</option>
                    <option value="Password">Password</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Validation Regex</label>
                  <input
                    type="text"
                    placeholder="e.g. /^[a-z0-9]+$/i"
                    value={field.regex}
                    onChange={(e) => {
                      const newList = customFields.map((f, i) => i === idx ? { ...f, regex: e.target.value } : f);
                      setCustomFields(newList);
                    }}
                    className="w-full box-border border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Description / Help Text</label>
                  <input
                    type="text"
                    placeholder="Shown to clients during ordering"
                    value={field.description}
                    onChange={(e) => {
                      const newList = customFields.map((f, i) => i === idx ? { ...f, description: e.target.value } : f);
                      setCustomFields(newList);
                    }}
                    className="w-full box-border border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex gap-4 items-end pb-1.5 h-full">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => {
                        const newList = customFields.map((f, i) => i === idx ? { ...f, required: e.target.checked } : f);
                        setCustomFields(newList);
                      }}
                      className="w-3.5 h-3.5 accent-blue-600"
                    />
                    Required
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={field.showOnOrder}
                      onChange={(e) => {
                        const newList = customFields.map((f, i) => i === idx ? { ...f, showOnOrder: e.target.checked } : f);
                        setCustomFields(newList);
                      }}
                      className="w-3.5 h-3.5 accent-blue-600"
                    />
                    Show on Order Form
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
