import React, { useState, useEffect, useRef } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const otherProducts = items.filter((item) => item.id !== row?.id);

  const handleTogglePackage = (packageId) => {
    const strId = String(packageId);
    let updated;
    const currentStrings = upgradePackages.map(String);
    if (currentStrings.includes(strId)) {
      updated = currentStrings.filter((id) => id !== strId);
    } else {
      updated = [...currentStrings, strId];
    }
    setUpgradePackages && setUpgradePackages(updated);
  };

  // Selected packages helpers
  const selectedPackages = otherProducts.filter((item) => 
    upgradePackages.map(String).includes(String(item.id))
  );

  const selectedPackageNames = selectedPackages.map((item) => item.product_name);

  const getDropdownLabel = () => {
    if (selectedPackageNames.length === 0) {
      return "Select packages...";
    }
    if (selectedPackageNames.length <= 2) {
      return selectedPackageNames.join(", ");
    }
    return `${selectedPackageNames.length} packages selected`;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="border border-slate-200 rounded-xl overflow-visible divide-y divide-slate-100 text-xs sm:text-sm">

        {/* Packages Upgrades Dynamic Checkbox Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Packages Upgrades
          </div>
          <div className="sm:col-span-4 space-y-1">
            {otherProducts.length === 0 ? (
              <div className="p-3 bg-slate-50 text-slate-500 text-xs rounded-lg border border-slate-200 w-full sm:w-80">
                No other packages available for upgrades.
              </div>
            ) : (
              <div className="relative w-full sm:w-80" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center justify-between w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-xs text-left text-slate-700 font-medium shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <span className="truncate pr-4">{getDropdownLabel()}</span>
                  <svg
                    className={`w-4 h-4 text-slate-500 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div
                    className="absolute w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-50"
                    style={{ zIndex: 99999 }}
                  >
                    {otherProducts.map((item) => {
                      const isChecked = upgradePackages.map(String).includes(String(item.id));
                      return (
                        <label
                          key={item.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer select-none transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePackage(item.id)}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 font-medium sm:text-xs truncate">
                            {item.product_name} - {item.product_group_name || "Package"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Selected Packages Pills */}
            {selectedPackages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 w-full sm:w-80">
                {selectedPackages.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-800 rounded-md font-medium text-[11px] border border-slate-200 shadow-sm"
                  >
                    <span className="truncate max-w-[200px]">
                      {item.product_name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePackage(item.id)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      title="Remove package"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-slate-500 text-xs font-medium m-0 pt-1">
              Select packages that clients can upgrade or downgrade to from this product.
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
