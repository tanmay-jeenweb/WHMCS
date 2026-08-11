import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const PRODUCT_TYPES = [
  { id: "Shared hosting", label: "Shared hosting", icon: "fa-server" },
  { id: "Reseller hosting", label: "Reseller hosting", icon: "fa-users-gear" },
  { id: "Server/VPS", label: "Server/VPS", icon: "fa-network-wired" },
  { id: "Email", label: "Email", icon: "fa-envelope" },
  { id: "Domains", label: "Domains", icon: "fa-globe" },
  { id: "Other", label: "Other", icon: "fa-cubes" }
];

const MODULE_OPTIONS = [
  "No Module",
  "cPanel"
];

export default function ProductConfigForm({ row, productGroups, items = [], onClose }) {
  const [activeTab, setActiveTab] = useState("details");

  // Tab 1: Details
  const [productName, setProductName] = useState(row?.product_name || "");
  const [productType, setProductType] = useState(row?.product_type || "Shared hosting");
  const [productGroupName, setProductGroupName] = useState(row?.product_group_name || "");

  const [productTagline, setProductTagline] = useState("");
  const [description, setDescription] = useState("");
  const [welcomeEmail, setWelcomeEmail] = useState("Hosting Account Welcome Email");
  const [applyTax, setApplyTax] = useState(false);
  const [showDomainOptions, setShowDomainOptions] = useState(false);
  const [enableStock, setEnableStock] = useState(false);
  const [stockQty, setStockQty] = useState(0);

  // Tab 2: Pricing
  const [paymentType, setPaymentType] = useState("recurring");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [monthlySetup, setMonthlySetup] = useState("");
  const [quarterlyPrice, setQuarterlyPrice] = useState("");
  const [quarterlySetup, setQuarterlySetup] = useState("");
  const [semiannuallyPrice, setSemiannuallyPrice] = useState("");
  const [semiannuallySetup, setSemiannuallySetup] = useState("");
  const [annuallyPrice, setAnnuallyPrice] = useState("");
  const [annuallySetup, setAnnuallySetup] = useState("");
  const [bienniallyPrice, setBienniallyPrice] = useState("");
  const [bienniallySetup, setBienniallySetup] = useState("");
  const [trienniallyPrice, setTrienniallyPrice] = useState("");
  const [trienniallySetup, setTrienniallySetup] = useState("");
  const [fixedTerm, setFixedTerm] = useState(0);

  // Tab 3: Module Settings
  const [moduleName, setModuleName] = useState(row?.module_name || "No Module");
  const [serverGroup, setServerGroup] = useState("None");
  const [cpanelPackage, setCpanelPackage] = useState("");
  const [cpanelQuota, setCpanelQuota] = useState("");
  const [cpanelBandwidth, setCpanelBandwidth] = useState("");
  const [cpanelMaxFtp, setCpanelMaxFtp] = useState("");
  const [provisionType, setProvisionType] = useState("manual");

  // Tab 4: Custom Fields
  const [customFields, setCustomFields] = useState([
    { id: 1, name: "OS Version", type: "Dropdown", description: "Select operating system", regex: "", required: true, showOnOrder: true }
  ]);

  // Tab 5: Configurable Options
  const [configurableOptions, setConfigurableOptions] = useState([
    { id: 1, name: "Extra RAM", type: "Dropdown", choices: "1 GB, 2 GB, 4 GB" }
  ]);

  // Tab 6: Upgrades
  const [upgrades, setUpgrades] = useState([]);

  // Tab 7: Cross-sells
  const [crossSells, setCrossSells] = useState([]);

  // Tab 8: Links
  const [url, setUrl] = useState(row?.url || "");
  const [customCheckoutUrl, setCustomCheckoutUrl] = useState("");

  const TABS = [
    { id: "details", label: "Details" },
    { id: "pricing", label: "Pricing" },
    { id: "module", label: "Module Settings" },
    { id: "customFields", label: "Custom Fields" },
    { id: "configurableOptions", label: "Configurable Options" },
    { id: "upgrades", label: "Upgrades" },
    { id: "crossSells", label: "Cross-sells" },
    { id: "links", label: "Links" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Product configuration saved successfully!");
    onClose();
  };

  return (
    <div className="flex-1 font-sans text-slate-900">
      {/* Form Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Configure Product Options - {productName}
          </h1>
          <p className="text-slate-500 mt-1">
            Setup custom pricing, custom fields, module logic, and client upgrade routes.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 font-medium text-sm flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Directory
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1 mb-[-1px] relative z-10">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-blue-600 border-slate-200 border-b-white shadow-sm"
                  : "bg-slate-50/50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
              }`}
              style={{ borderBottomColor: isActive ? '#ffffff' : undefined }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Container */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 rounded-tl-none">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="min-h-[350px]">
            {/* 1. DETAILS TAB */}
            {activeTab === "details" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700">
                      Product Type
                    </label>
                    <select
                      value={productType}
                      disabled
                      className="w-full box-border border-[1.5px] border-slate-200 bg-slate-50 text-slate-500 rounded-xl py-3 px-4 text-sm outline-none cursor-not-allowed"
                    >
                      {PRODUCT_TYPES.map((type) => (
                        <option key={type.id} value={type.label}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700">
                      Product Group
                    </label>
                    <select
                      value={productGroupName}
                      disabled
                      className="w-full box-border border-[1.5px] border-slate-200 bg-slate-50 text-slate-500 rounded-xl py-3 px-4 text-sm outline-none cursor-not-allowed"
                    >
                      <option value="">{productGroupName || "-- None --"}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700">
                      Product Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={productName}
                      className="w-full box-border border-[1.5px] border-slate-200 bg-slate-50 text-slate-500 rounded-xl py-3 px-4 text-sm outline-none cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700">
                      Product Tagline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Best choice for small websites"
                      value={productTagline}
                      onChange={(e) => setProductTagline(e.target.value)}
                      className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter product description (HTML or text)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700">
                      Welcome Email
                    </label>
                    <select
                      value={welcomeEmail}
                      onChange={(e) => setWelcomeEmail(e.target.value)}
                      className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 bg-white transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="None">None</option>
                      <option value="Hosting Account Welcome Email">Hosting Account Welcome Email</option>
                      <option value="Reseller Account Welcome Email">Reseller Account Welcome Email</option>
                      <option value="VPS/Server Welcome Email">VPS/Server Welcome Email</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-center space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={applyTax}
                        onChange={(e) => setApplyTax(e.target.checked)}
                        className="w-4 h-4 text-blue-600 accent-blue-600 rounded"
                      />
                      Apply Tax (Check to apply tax to invoices generated for this product)
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={showDomainOptions}
                        onChange={(e) => setShowDomainOptions(e.target.checked)}
                        className="w-4 h-4 text-blue-600 accent-blue-600 rounded"
                      />
                      Show Domain Options (Show domain registration options during order)
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center gap-6">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={enableStock}
                      onChange={(e) => setEnableStock(e.target.checked)}
                      className="w-4 h-4 text-blue-600 accent-blue-600 rounded"
                    />
                    Enable Stock Control (Limit quantity of product available)
                  </label>

                  {enableStock && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Quantity in Stock:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stockQty}
                        onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                        className="w-24 box-border border-[1.5px] border-slate-300 rounded-lg py-1.5 px-3 text-xs outline-none text-slate-800 transition-all focus:border-blue-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. PRICING TAB */}
            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-slate-700">
                    Payment Type
                  </label>
                  <div className="flex gap-4">
                    {["free", "one-time", "recurring"].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          value={type}
                          checked={paymentType === type}
                          onChange={() => setPaymentType(type)}
                          className="w-4 h-4 text-blue-600 accent-blue-600"
                        />
                        <span className="text-xs font-semibold text-slate-700 capitalize">
                          {type === "free" ? "Free" : type === "one-time" ? "One Time" : "Recurring"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {paymentType === "free" && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 font-medium">
                    ⚡ This product/service will be free of charge. No payment cycle configuration is required.
                  </div>
                )}

                {paymentType === "one-time" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-4">
                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-slate-700">
                        One Time Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(e.target.value)}
                        className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-slate-700">
                        One Time Setup Fee ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={monthlySetup}
                        onChange={(e) => setMonthlySetup(e.target.value)}
                        className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                )}

                {paymentType === "recurring" && (
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Recurring Cycle Pricing Grid</h4>
                    
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full border-collapse text-left text-xs font-sans">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                            <th className="p-3">Billing Cycle</th>
                            <th className="p-3">Price ($)</th>
                            <th className="p-3">Setup Fee ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { cycle: "Monthly", price: monthlyPrice, setPrice: setMonthlyPrice, setup: monthlySetup, setSetup: setMonthlySetup },
                            { cycle: "Quarterly", price: quarterlyPrice, setPrice: setQuarterlyPrice, setup: quarterlySetup, setSetup: setQuarterlySetup },
                            { cycle: "Semi-Annually", price: semiannuallyPrice, setPrice: setSemiannuallyPrice, setup: semiannuallySetup, setSetup: setSemiannuallySetup },
                            { cycle: "Annually", price: annuallyPrice, setPrice: setAnnuallyPrice, setup: annuallySetup, setSetup: setAnnuallySetup },
                            { cycle: "Biennially", price: bienniallyPrice, setPrice: setBienniallyPrice, setup: bienniallySetup, setSetup: setBienniallySetup },
                            { cycle: "Triennially", price: trienniallyPrice, setPrice: setTrienniallyPrice, setup: trienniallySetup, setSetup: setTrienniallySetup },
                          ].map((itemRow, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-slate-700">{itemRow.cycle}</td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={itemRow.price}
                                  onChange={(e) => itemRow.setPrice(e.target.value)}
                                  className="w-32 box-border border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs outline-none focus:border-blue-600"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={itemRow.setup}
                                  onChange={(e) => itemRow.setSetup(e.target.value)}
                                  className="w-32 box-border border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs outline-none focus:border-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700">
                      Auto Terminate / Fixed Term (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={fixedTerm}
                      onChange={(e) => setFixedTerm(parseInt(e.target.value) || 0)}
                      className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="text-[11px] text-slate-500 m-0">
                      Enter number of days to automatically terminate this product after signup (e.g. trial products). 0 to disable.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. MODULE SETTINGS TAB */}
            {activeTab === "module" && (
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
            )}

            {/* 4. CUSTOM FIELDS TAB */}
            {activeTab === "customFields" && (
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
            )}

            {/* 5. CONFIGURABLE OPTIONS TAB */}
            {activeTab === "configurableOptions" && (
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
            )}

            {/* 6. UPGRADES TAB */}
            {activeTab === "upgrades" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Upgrade/Downgrade Path</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 mb-0">Select products that clients can upgrade or downgrade to from this package.</p>
                </div>

                {items.length <= 1 ? (
                  <div className="p-4 bg-slate-50 text-slate-500 text-xs rounded-xl text-center">
                    No other products in directory to offer upgrade paths.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border border-slate-200 p-4 rounded-xl max-h-60 overflow-y-auto">
                    {items
                      .filter(item => item.id !== row?.id)
                      .map(item => {
                        const isChecked = upgrades.includes(item.id);
                        return (
                          <label key={item.id} className="flex items-center gap-2 p-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setUpgrades([...upgrades, item.id]);
                                } else {
                                  setUpgrades(upgrades.filter(id => id !== item.id));
                                }
                              }}
                              className="w-4 h-4 accent-blue-600 text-blue-600 cursor-pointer"
                            />
                            <div className="flex flex-col text-xs">
                              <span className="font-bold text-slate-800">{item.product_name}</span>
                              <span className="text-[10px] text-slate-500">{item.product_group_name} ({item.product_type})</span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* 7. CROSS-SELLS TAB */}
            {activeTab === "crossSells" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Product Cross-selling Recommendations</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 mb-0">Select products that will be suggested as cross-sells to the client in the shopping cart.</p>
                </div>

                {items.length <= 1 ? (
                  <div className="p-4 bg-slate-50 text-slate-500 text-xs rounded-xl text-center">
                    No other products in directory to recommend for cross-selling.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border border-slate-200 p-4 rounded-xl max-h-60 overflow-y-auto">
                    {items
                      .filter(item => item.id !== row?.id)
                      .map(item => {
                        const isChecked = crossSells.includes(item.id);
                        return (
                          <label key={item.id} className="flex items-center gap-2 p-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCrossSells([...crossSells, item.id]);
                                } else {
                                  setCrossSells(crossSells.filter(id => id !== item.id));
                                }
                              }}
                              className="w-4 h-4 accent-blue-600 text-blue-600 cursor-pointer"
                            />
                            <div className="flex flex-col text-xs">
                              <span className="font-bold text-slate-800">{item.product_name}</span>
                              <span className="text-[10px] text-slate-500">{item.product_group_name} ({item.product_type})</span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* 8. LINKS TAB */}
            {activeTab === "links" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Store & Order Links</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 mb-0 font-sans">Use these URLs to link directly to this product checkout.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700">
                      Direct Store Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={url}
                        className="flex-1 box-border border-[1.5px] border-slate-200 bg-slate-50 font-mono rounded-xl py-3 px-4 text-xs outline-none text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(url);
                          toast.success("Copied to clipboard!");
                        }}
                        className="px-4 py-2.5 text-xs font-bold bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                      >
                        Copy Link
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 m-0">
                      Generated automatically based on Product Group and Product Name.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700">
                      Custom Checkout URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://mycustomportal.com/checkout?plan=starter"
                      value={customCheckoutUrl}
                      onChange={(e) => setCustomCheckoutUrl(e.target.value)}
                      className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 transition-all focus:border-blue-600"
                    />
                    <p className="text-[11px] text-slate-500 m-0 font-sans">
                      Provide an override URL if checkout takes place on an external portal.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 font-semibold text-sm cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#0056cf] hover:bg-[#0040a1] focus:ring-2 focus:ring-offset-2 focus:ring-[#0056cf] transition-colors cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
