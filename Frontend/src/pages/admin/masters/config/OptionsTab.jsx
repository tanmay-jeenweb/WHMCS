import React from "react";

export default function OptionsTab({
  configurableOptions,
  setConfigurableOptions
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Configurable Options</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 mb-0">Let clients customize the product resources (like memory, CPU, bandwidth).</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setConfigurableOptions([
              ...configurableOptions,
              { id: Date.now(), name: "", type: "Dropdown", choices: "" }
            ]);
          }}
          className="px-3.5 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
        >
          + Add Config Option
        </button>
      </div>

      {configurableOptions.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          No configurable options set yet. Click "Add Config Option" above.
        </div>
      ) : (
        <div className="space-y-4">
          {configurableOptions.map((opt, idx) => (
            <div key={opt.id} className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl space-y-3 relative">
              <button
                type="button"
                onClick={() => {
                  setConfigurableOptions(configurableOptions.filter(o => o.id !== opt.id));
                }}
                className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 bg-transparent border-none cursor-pointer flex items-center justify-center"
                title="Delete Option"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-1.5 12h-12L4.5 8.25m-1.5-1.5h18" />
                </svg>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Option Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Memory Size"
                    value={opt.name}
                    onChange={(e) => {
                      const newList = configurableOptions.map((o, i) => i === idx ? { ...o, name: e.target.value } : o);
                      setConfigurableOptions(newList);
                    }}
                    className="w-full box-border border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Option Type</label>
                  <select
                    value={opt.type}
                    onChange={(e) => {
                      const newList = configurableOptions.map((o, i) => i === idx ? { ...o, type: e.target.value } : o);
                      setConfigurableOptions(newList);
                    }}
                    className="w-full box-border border border-slate-300 bg-white rounded-lg py-1.5 px-2.5 text-xs outline-none focus:border-blue-600"
                  >
                    <option value="Dropdown">Dropdown</option>
                    <option value="Radio">Radio Buttons</option>
                    <option value="Checkbox">Yes/No Checkbox</option>
                    <option value="Quantity">Quantity Field</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 pr-8">
                <label className="text-[11px] font-bold text-slate-600">Option Choices (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 1 GB RAM, 2 GB RAM, 4 GB RAM"
                  value={opt.choices}
                  onChange={(e) => {
                    const newList = configurableOptions.map((o, i) => i === idx ? { ...o, choices: e.target.value } : o);
                    setConfigurableOptions(newList);
                  }}
                  className="w-full box-border border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
