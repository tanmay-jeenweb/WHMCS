import React from "react";

const UPGRADE_EMAIL_OPTIONS = [
  "None"
];

export default function UpgradesTab({
  items = [],
  row,
  upgradePackages = [],
  setUpgradePackages,
  upgradeConfigOptions = false,
  setUpgradeConfigOptions,
  upgradeEmail = "None",
  setUpgradeEmail
}) {
  const otherProducts = items.filter((item) => item.id !== row?.id);

  return (
    <div className="space-y-6 font-sans">
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">

        {/* Packages Upgrades Multi-Select */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-start gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700 pt-1.5">
            Packages Upgrades
          </div>
          <div className="sm:col-span-4 space-y-1.5">
            {otherProducts.length === 0 ? (
              <div className="p-3 bg-slate-50 text-slate-500 text-xs rounded-lg border border-slate-200">
                No other packages available for upgrades.
              </div>
            ) : (
              <select
                multiple
                size={Math.min(6, Math.max(3, otherProducts.length))}
                value={upgradePackages.map(String)}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);
                  setUpgradePackages && setUpgradePackages(selectedValues);
                }}
                className="block w-full sm:w-80 px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-xs"
              >
                {otherProducts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.product_name} - {item.product_group_name || "Package"}
                  </option>
                ))}
              </select>
            )}
            <p className="text-slate-500 text-xs font-medium">
              Use Ctrl+Click to select multiple packages
            </p>
          </div>
        </div>

        {/* Configurable Options Checkbox */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Configurable Options
          </div>
          <div className="sm:col-span-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!upgradeConfigOptions}
                onChange={(e) => setUpgradeConfigOptions && setUpgradeConfigOptions(e.target.checked)}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf] accent-[#0056cf]"
              />
              <span className="text-slate-700 font-medium">
                Check to allow Upgrading/Downgrading of configurable options
              </span>
            </label>
          </div>
        </div>

        {/* Upgrade Email Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Upgrade Email
          </div>
          <div className="sm:col-span-4 space-y-1">
            <select
              value={upgradeEmail || "None"}
              onChange={(e) => setUpgradeEmail && setUpgradeEmail(e.target.value)}
              className="block w-64 px-3 py-1.5 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-xs"
            >
              <option value="None">None</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
