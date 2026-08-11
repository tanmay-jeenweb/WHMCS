import React from "react";
import toast from "react-hot-toast";

export default function LinksTab({ row, url }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const productId = row?.id || 1;
  const groupSlug = (row?.product_group_name || "store").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const productSlug = (row?.product_name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const directCartLink = url || `${origin}/index.php?rp=/store/${groupSlug}/${productSlug}`;
  const directTemplateLink = `${origin}/cart.php?a=add&pid=${productId}&carttpl=standard_cart`;
  const directDomainLink = `${origin}/cart.php?a=add&pid=${productId}&sld=whmcs&tld=.com`;
  const productGroupLink = `${origin}/index.php?rp=/store/${groupSlug}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied link to clipboard!");
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
        
        {/* Direct Shopping Cart Link */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Direct Shopping Cart Link
          </div>
          <div className="sm:col-span-4 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={directCartLink}
              className="w-full sm:w-[500px] px-3 py-1.5 border border-slate-300 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(directCartLink)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Direct Shopping Cart Link Specifying Template */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Direct Shopping Cart Link Specifying Template
          </div>
          <div className="sm:col-span-4 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={directTemplateLink}
              className="w-full sm:w-[500px] px-3 py-1.5 border border-slate-300 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(directTemplateLink)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Direct Shopping Cart Link Including Domain */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Direct Shopping Cart Link Including Domain
          </div>
          <div className="sm:col-span-4 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={directDomainLink}
              className="w-full sm:w-[500px] px-3 py-1.5 border border-slate-300 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(directDomainLink)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Product Group Cart Link */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Product Group Cart Link
          </div>
          <div className="sm:col-span-4 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={productGroupLink}
              className="w-full sm:w-[500px] px-3 py-1.5 border border-slate-300 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(productGroupLink)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Copy
            </button>
          </div>
        </div>

      </div>

      {/* Product URLs Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0">
          Product URLs
        </h4>
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-4">URL</th>
                <th className="py-2.5 px-4 w-32 text-center">Visits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="py-2.5 px-4 font-mono text-slate-600 break-all">
                  {directCartLink}
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-slate-700">
                  0
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
