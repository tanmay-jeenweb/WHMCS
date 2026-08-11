import React from "react";

const FIELD_TYPES = [
  "Text Box",
  "Password",
  "Drop Down",
  "Check Box",
  "Text Area"
];

export default function CustomFieldsTab({
  customFields = [],
  setCustomFields
}) {
  const handleAddField = () => {
    const newField = {
      id: Date.now(),
      field_name: "",
      display_order: 0,
      field_type: "Text Box",
      description: "",
      validation: "",
      select_options: "",
      admin_only: false,
      required_field: false,
      show_on_order: true,
      show_on_invoice: false
    };
    setCustomFields((prev) => [...prev, newField]);
  };

  const handleUpdateField = (index, updates) => {
    setCustomFields((prevFields) =>
      prevFields.map((field, idx) => {
        if (idx === index) {
          return { ...field, ...updates };
        }
        return field;
      })
    );
  };

  const handleDeleteField = (index) => {
    setCustomFields((prevFields) => prevFields.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider m-0">
            Custom Fields Configuration
          </h3>
          <p className="text-slate-500 text-xs mt-0.5 mb-0">
            Configure product-specific input fields required during checkout or client area management.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddField}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#0056cf] hover:bg-[#0040a1] text-white transition-all cursor-pointer shadow-sm border-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Custom Field
        </button>
      </div>

      {/* Empty State */}
      {customFields.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
          <p className="text-slate-500 text-xs font-medium m-0">
            No custom fields configured for this product.
          </p>
          <button
            type="button"
            onClick={handleAddField}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            + Add New Custom Field
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {customFields.map((field, idx) => {
            const fieldName = field.field_name ?? field.name ?? "";
            const displayOrder = field.field_order ?? field.display_order ?? 0;
            const fieldType = field.field_type ?? field.type ?? "Text Box";
            const description = field.description ?? "";
            const validation = field.validation ?? field.regex ?? "";
            const selectOptions = field.select_options ?? field.options ?? "";
            const adminOnly = !!(field.admin_only ?? field.adminOnly);
            const requiredField = !!(field.required_field ?? field.required);
            const showOnOrder = field.show_on_order ?? field.showOnOrder ?? true;
            const showOnInvoice = !!(field.show_on_invoice ?? field.showOnInvoice);

            return (
              <div key={field.id || idx} className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm bg-white shadow-sm relative">
                
                {/* Field Card Title Bar */}
                <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                  <span className="font-bold text-slate-700 text-xs">
                    Custom Field #{idx + 1}: <span className="text-blue-600">{fieldName || "(Unnamed Field)"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteField(idx)}
                    className="text-rose-600 hover:text-rose-800 bg-transparent border-none cursor-pointer flex items-center gap-1 text-xs font-medium"
                    title="Remove Custom Field"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete Field
                  </button>
                </div>

                {/* Field Name */}
                <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
                  <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
                    Field Name
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="e.g. Operating System, Server Location"
                      value={fieldName}
                      onChange={(e) => handleUpdateField(idx, { field_name: e.target.value, name: e.target.value })}
                      className="w-full sm:w-80 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Display Order */}
                <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
                  <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
                    Display Order
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="number"
                      min="0"
                      value={displayOrder}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        handleUpdateField(idx, { field_order: val, display_order: val });
                      }}
                      className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Field Type */}
                <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
                  <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
                    Field Type
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={fieldType}
                      onChange={(e) => handleUpdateField(idx, { field_type: e.target.value, type: e.target.value })}
                      className="block w-64 px-3 py-1.5 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-xs"
                    >
                      {FIELD_TYPES.map((ft) => (
                        <option key={ft} value={ft}>
                          {ft}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
                  <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
                    Description
                  </div>
                  <div className="sm:col-span-4 space-y-1">
                    <input
                      type="text"
                      placeholder="The explanation to show users"
                      value={description}
                      onChange={(e) => handleUpdateField(idx, { description: e.target.value })}
                      className="w-full sm:w-96 px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-slate-500 text-xs font-medium">
                      The explanation to show users
                    </p>
                  </div>
                </div>

                {/* Validation */}
                <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
                  <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
                    Validation
                  </div>
                  <div className="sm:col-span-4 space-y-1">
                    <input
                      type="text"
                      placeholder="/^[a-z0-9]+$/i"
                      value={validation}
                      onChange={(e) => handleUpdateField(idx, { validation: e.target.value, regex: e.target.value })}
                      className="w-full sm:w-96 px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <p className="text-slate-500 text-xs font-medium">
                      Regular Expression Validation String
                    </p>
                  </div>
                </div>

                {/* Select Options */}
                <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
                  <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
                    Select Options
                  </div>
                  <div className="sm:col-span-4 space-y-1">
                    <input
                      type="text"
                      placeholder="Option 1, Option 2, Option 3"
                      value={selectOptions}
                      onChange={(e) => handleUpdateField(idx, { select_options: e.target.value, options: e.target.value })}
                      className="w-full sm:w-96 px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-slate-500 text-xs font-medium">
                      For Dropdowns Only - Comma Seperated List
                    </p>
                  </div>
                </div>

                {/* Checkboxes Row */}
                <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
                  <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
                    Field Access Options
                  </div>
                  <div className="sm:col-span-4 flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={adminOnly}
                        onChange={(e) => handleUpdateField(idx, { admin_only: e.target.checked, adminOnly: e.target.checked })}
                        className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf]"
                      />
                      <span className="text-slate-700 font-medium">Admin Only</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={requiredField}
                        onChange={(e) => handleUpdateField(idx, { required_field: e.target.checked, required: e.target.checked })}
                        className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf]"
                      />
                      <span className="text-slate-700 font-medium">Required Field</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showOnOrder}
                        onChange={(e) => handleUpdateField(idx, { show_on_order: e.target.checked, showOnOrder: e.target.checked })}
                        className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf]"
                      />
                      <span className="text-slate-700 font-medium">Show on Order Form</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showOnInvoice}
                        onChange={(e) => handleUpdateField(idx, { show_on_invoice: e.target.checked, showOnInvoice: e.target.checked })}
                        className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf]"
                      />
                      <span className="text-slate-700 font-medium">Show on Invoice</span>
                    </label>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
