import React from "react";

export default function OptionsTab({
  assignedOptionGroups = "None",
  setAssignedOptionGroups,
  productGroups = []
}) {
  return (
    <div className="space-y-6 font-sans">
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">

        {/* Assigned Option Groups Select Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Assigned Option Groups
          </div>
          <div className="sm:col-span-4 space-y-1">
            <select
              value={assignedOptionGroups || "None"}
              onChange={(e) => setAssignedOptionGroups && setAssignedOptionGroups(e.target.value)}
              className="block w-full sm:w-80 px-3 py-1.5 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-xs"
            >
              <option value="None">None</option>
              {productGroups.map((group) => (
                <option key={group.id || group.name} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
            <p className="text-slate-500 text-xs font-medium">
              Select configurable option group to assign to this product.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
