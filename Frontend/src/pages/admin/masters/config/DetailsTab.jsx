import React from "react";

const PRODUCT_TYPES = [
  { id: "Shared hosting", label: "Shared hosting", icon: "fa-server" },
  { id: "Reseller hosting", label: "Reseller hosting", icon: "fa-users-gear" },
  { id: "Server/VPS", label: "Server/VPS", icon: "fa-network-wired" },
  { id: "Email", label: "Email", icon: "fa-envelope" },
  { id: "Domains", label: "Domains", icon: "fa-globe" },
  { id: "Other", label: "Other", icon: "fa-cubes" }
];

export default function DetailsTab({
  productType,
  productGroupName,
  productName,
  productTagline,
  setProductTagline,
  url,
  productColor,
  setProductColor,
  welcomeEmail,
  setWelcomeEmail,
  shortDescription,
  setShortDescription,
  description,
  setDescription,
  requireDomain,
  setRequireDomain,
  applyTax,
  setApplyTax,
  featured,
  setFeatured,
  hidden,
  setHidden,
  enableStock,
  setEnableStock,
  stockQty,
  setStockQty,
  retired,
  setRetired
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Product Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Product Type
          </label>
          <input
            type="text"
            disabled
            value={productType}
            className="appearance-none block w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg sm:text-sm outline-none cursor-not-allowed"
          />
        </div>

        {/* Product Group */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Product Group
          </label>
          <input
            type="text"
            disabled
            value={productGroupName || "None"}
            className="appearance-none block w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg sm:text-sm outline-none cursor-not-allowed"
          />
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            disabled
            value={productName}
            className="appearance-none block w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg sm:text-sm outline-none cursor-not-allowed"
          />
        </div>

        {/* Product Tagline */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Product Tagline
          </label>
          <input
            type="text"
            placeholder="e.g. Best choice for small websites"
            value={productTagline}
            onChange={(e) => setProductTagline(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none"
          />
        </div>

        {/* URL */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            URL
          </label>
          <input
            type="text"
            disabled
            value={url}
            className="appearance-none block w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg sm:text-sm font-mono outline-none cursor-not-allowed"
          />
        </div>

        {/* Product Color & Welcome Email */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:col-span-2">
          {/* Product Color */}
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={productColor}
                onChange={(e) => setProductColor(e.target.value)}
                className="w-12 h-9 p-0.5 border border-slate-300 rounded-lg cursor-pointer bg-white"
              />
              <input
                type="text"
                value={productColor}
                onChange={(e) => setProductColor(e.target.value)}
                placeholder="#000000"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono outline-none"
              />
            </div>
          </div>

          {/* Welcome Email */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Welcome Email
            </label>
            <select
              value={welcomeEmail}
              onChange={(e) => setWelcomeEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="none">None</option>
              <option value="hosting account welcome email">Hosting Account Welcome Email</option>
              <option value="reseller account welcome email">Reseller Account Welcome Email</option>
              <option value="Dedicated/VPS server welcome email">Dedicated/VPS Server Welcome Email</option>
              {PRODUCT_TYPES.map((type) => (
                <option key={type.id} value={`${type.label.toLowerCase()} account welcome email`}>
                  {type.label} Account Welcome Email
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Short Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Product Short Description
          </label>
          <textarea
            rows={2}
            placeholder="Enter a brief summary shown in lists..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none"
          />
        </div>

        {/* Product Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Product Description
          </label>
          <textarea
            rows={4}
            placeholder="Enter product description (HTML or text)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none"
          />
        </div>

        {/* Settings Grid (Reference from Image) */}
        <div className="sm:col-span-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 font-sans text-xs sm:text-sm">
          
          {/* Require Domain */}
          <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
            <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
              Require Domain
            </div>
            <div className="sm:col-span-4 flex items-center gap-2">
              <input
                id="requireDomain"
                type="checkbox"
                checked={requireDomain}
                onChange={(e) => setRequireDomain(e.target.checked)}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf] cursor-pointer"
              />
              <label htmlFor="requireDomain" className="text-slate-600 cursor-pointer font-medium select-none">
                Check to show domain registration options
              </label>
            </div>
          </div>

          {/* Stock Control */}
          <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
            <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
              Stock Control
            </div>
            <div className="sm:col-span-4 flex flex-wrap items-center gap-2.5">
              <input
                id="enableStock"
                type="checkbox"
                checked={enableStock}
                onChange={(e) => setEnableStock(e.target.checked)}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf] cursor-pointer"
              />
              <label htmlFor="enableStock" className="text-slate-600 cursor-pointer font-medium select-none flex items-center gap-2">
                Enable - Quantity in Stock:
              </label>
              <input
                type="number"
                min="0"
                disabled={!enableStock}
                value={stockQty}
                onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                className={`w-24 px-3 py-1 border rounded-lg text-xs font-semibold outline-none transition-all ${
                  enableStock 
                    ? "border-slate-300 bg-white text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                    : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* Apply Tax */}
          <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
            <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
              Apply Tax
            </div>
            <div className="sm:col-span-4 flex items-center gap-2">
              <input
                id="applyTax"
                type="checkbox"
                checked={applyTax}
                onChange={(e) => setApplyTax(e.target.checked)}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf] cursor-pointer"
              />
              <label htmlFor="applyTax" className="text-slate-600 cursor-pointer font-medium select-none">
                Check to charge tax for this product
              </label>
            </div>
          </div>

          {/* Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
            <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
              Featured
            </div>
            <div className="sm:col-span-4 flex items-center gap-2">
              <input
                id="featured"
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf] cursor-pointer"
              />
              <label htmlFor="featured" className="text-slate-600 cursor-pointer font-medium select-none">
                Display this product more prominently on supported order forms
              </label>
            </div>
          </div>

          {/* Hidden */}
          <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
            <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
              Hidden
            </div>
            <div className="sm:col-span-4 flex items-center gap-2">
              <input
                id="hidden"
                type="checkbox"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf] cursor-pointer"
              />
              <label htmlFor="hidden" className="text-slate-600 cursor-pointer font-medium select-none">
                Check to hide from order form
              </label>
            </div>
          </div>

          {/* Retired */}
          <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
            <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
              Retired
            </div>
            <div className="sm:col-span-4 flex items-center gap-2">
              <input
                id="retired"
                type="checkbox"
                checked={retired}
                onChange={(e) => setRetired(e.target.checked)}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf] cursor-pointer"
              />
              <label htmlFor="retired" className="text-slate-600 cursor-pointer font-medium select-none">
                Check to hide from admin area product dropdown menus (does not apply to services already with this product)
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
