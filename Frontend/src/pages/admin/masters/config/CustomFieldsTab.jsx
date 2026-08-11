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
  // Take the first custom field object or default to a blank field structure
  const currentField = customFields[0] || {
    id: 1,
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

  const handleUpdate = (updates) => {
    const updatedField = { ...currentField, ...updates };
    setCustomFields([updatedField]);
  };

  const fieldName = currentField.field_name ?? currentField.name ?? "";
  const displayOrder = currentField.field_order ?? currentField.display_order ?? 0;
  const fieldType = currentField.field_type ?? currentField.type ?? "Text Box";
  const description = currentField.description ?? "";
  const validation = currentField.validation ?? currentField.regex ?? "";
  const selectOptions = currentField.select_options ?? currentField.options ?? "";
  const adminOnly = !!(currentField.admin_only ?? currentField.adminOnly);
  const requiredField = !!(currentField.required_field ?? currentField.required);
  const showOnOrder = currentField.show_on_order ?? currentField.showOnOrder ?? true;
  const showOnInvoice = !!(currentField.show_on_invoice ?? currentField.showOnInvoice);

  return (
    <div className="space-y-6 font-sans">
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm bg-white shadow-2xs">
        
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
              onChange={(e) => handleUpdate({ field_name: e.target.value, name: e.target.value })}
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
                handleUpdate({ field_order: val, display_order: val });
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
              onChange={(e) => handleUpdate({ field_type: e.target.value, type: e.target.value })}
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
              onChange={(e) => handleUpdate({ description: e.target.value })}
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
              onChange={(e) => handleUpdate({ validation: e.target.value, regex: e.target.value })}
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
              onChange={(e) => handleUpdate({ select_options: e.target.value, options: e.target.value })}
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
                onChange={(e) => handleUpdate({ admin_only: e.target.checked, adminOnly: e.target.checked })}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf]"
              />
              <span className="text-slate-700 font-medium">Admin Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requiredField}
                onChange={(e) => handleUpdate({ required_field: e.target.checked, required: e.target.checked })}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf]"
              />
              <span className="text-slate-700 font-medium">Required Field</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnOrder}
                onChange={(e) => handleUpdate({ show_on_order: e.target.checked, showOnOrder: e.target.checked })}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf]"
              />
              <span className="text-slate-700 font-medium">Show on Order Form</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnInvoice}
                onChange={(e) => handleUpdate({ show_on_invoice: e.target.checked, showOnInvoice: e.target.checked })}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf]"
              />
              <span className="text-slate-700 font-medium">Show on Invoice</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
