import React from "react";

export default function ModuleTab({
  moduleName,
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-[13px] font-semibold text-slate-700">
            Module Name
          </label>
          <select
            value={moduleName}
            disabled
            className="w-full box-border border-[1.5px] border-slate-200 bg-slate-50 text-slate-500 rounded-xl py-3 px-4 text-sm outline-none cursor-not-allowed"
          >
            <option value={moduleName}>{moduleName}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[13px] font-semibold text-slate-700">
            Server Group
          </label>
          <select
            value={serverGroup}
            onChange={(e) => setServerGroup(e.target.value)}
            className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 bg-white transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="None">None</option>
            <option value="US Servers Group">US Servers Group</option>
            <option value="EU Servers Group">EU Servers Group</option>
          </select>
        </div>
      </div>

      {moduleName === "cPanel" && (
        <div className="border-t border-slate-100 pt-4 space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">cPanel Provisioning Package Details</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-slate-700">
                WHM Package Name
              </label>
              <input
                type="text"
                placeholder="e.g. standard_hosting_plan"
                value={cpanelPackage}
                onChange={(e) => setCpanelPackage(e.target.value)}
                className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-slate-700">
                Web Space Quota (MB)
              </label>
              <input
                type="text"
                placeholder="e.g. 5000"
                value={cpanelQuota}
                onChange={(e) => setCpanelQuota(e.target.value)}
                className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-slate-700">
                Bandwidth Limit (MB)
              </label>
              <input
                type="text"
                placeholder="e.g. 50000"
                value={cpanelBandwidth}
                onChange={(e) => setCpanelBandwidth(e.target.value)}
                className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-slate-700">
                Max FTP Accounts
              </label>
              <input
                type="text"
                placeholder="e.g. 5"
                value={cpanelMaxFtp}
                onChange={(e) => setCpanelMaxFtp(e.target.value)}
                className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <label className="block text-[13px] font-semibold text-slate-700">
          Automatically Provisioning Settings
        </label>
        
        <div className="space-y-2.5">
          {[
            { id: "manual", text: "Do not automatically setup this product" },
            { id: "immediate", text: "Automatically setup the product as soon as an order is placed" },
            { id: "payment", text: "Automatically setup the product as soon as the first payment is received" },
            { id: "accept", text: "Automatically setup the product when you manually accept a pending order" }
          ].map((opt) => (
            <label key={opt.id} className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="provisionType"
                value={opt.id}
                checked={provisionType === opt.id}
                onChange={() => setProvisionType(opt.id)}
                className="mt-0.5 w-4 h-4 text-blue-600 accent-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700">{opt.text}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
