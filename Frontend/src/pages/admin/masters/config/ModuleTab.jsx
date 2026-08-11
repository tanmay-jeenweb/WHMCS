import React from "react";

const MODULE_OPTIONS = [
  "No Module",
  "cPanel",
  "Plesk",
  "DirectAdmin",
  "VirtualMin",
  "Custom"
];

const SERVER_GROUP_OPTIONS = [
  "None"
];

export default function ModuleTab({
  moduleName,
  setModuleName,
  serverGroup,
  setServerGroup,
  cpanelPackage,
  setCpanelPackage,
  cpanelQuota,
  setCpanelQuota,
  cpanelBandwidth,
  setCpanelBandwidth,
  cpanelMaxFtp,
  setCpanelMaxFtp,
  provisionType,
  setProvisionType
}) {
  return (
    <div className="space-y-6 font-sans">
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
        
        {/* Module Name Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Module Name
          </div>
          <div className="sm:col-span-4 space-y-1">
            <select
              value={moduleName}
              onChange={(e) => setModuleName && setModuleName(e.target.value)}
              className="block w-64 px-3 py-1.5 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-xs"
            >
              {MODULE_OPTIONS.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
            <p className="text-slate-500 text-xs font-medium">
              Select server provisioning module (e.g. cPanel)
            </p>
          </div>
        </div>

        {/* Server Group Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Server Group
          </div>
          <div className="sm:col-span-4 space-y-1">
            <select
              value={serverGroup}
              onChange={(e) => setServerGroup(e.target.value)}
              className="block w-64 px-3 py-1.5 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-xs"
            >
              {SERVER_GROUP_OPTIONS.map((grp) => (
                <option key={grp} value={grp}>
                  {grp}
                </option>
              ))}
            </select>
            <p className="text-slate-500 text-xs font-medium">
              Select server group for automatic server assignment
            </p>
          </div>
        </div>

        {/* cPanel Specific Package Options */}
        {moduleName === "cPanel" && (
          <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-start gap-2 sm:gap-4">
            <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700 pt-1.5">
              cPanel Settings
            </div>
            <div className="sm:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">WHM Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. standard_hosting_plan"
                  value={cpanelPackage}
                  onChange={(e) => setCpanelPackage(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Web Space Quota (MB)</label>
                <input
                  type="text"
                  placeholder="e.g. 5000"
                  value={cpanelQuota}
                  onChange={(e) => setCpanelQuota(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Bandwidth Limit (MB)</label>
                <input
                  type="text"
                  placeholder="e.g. 50000"
                  value={cpanelBandwidth}
                  onChange={(e) => setCpanelBandwidth(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Max FTP Accounts</label>
                <input
                  type="text"
                  placeholder="e.g. 5"
                  value={cpanelMaxFtp}
                  onChange={(e) => setCpanelMaxFtp(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Automatic Setup */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-start gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700 pt-0.5">
            Automatic Setup
          </div>
          <div className="sm:col-span-4 space-y-2">
            {[
              { id: "manual", text: "Do not automatically setup this product" },
              { id: "immediate", text: "Automatically setup the product as soon as an order is placed" },
              { id: "payment", text: "Automatically setup the product as soon as the first payment is received" },
              { id: "accept", text: "Automatically setup the product when you manually accept a pending order" }
            ].map((opt) => (
              <label key={opt.id} className="flex items-start gap-2.5 cursor-not-allowed opacity-60 select-none">
                <input
                  type="radio"
                  name="provisionType"
                  value={opt.id}
                  disabled
                  checked={provisionType === opt.id}
                  onChange={() => {}}
                  className="mt-0.5 h-4 w-4 text-slate-400 cursor-not-allowed"
                />
                <span className="text-slate-600 font-medium">{opt.text}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
