import React from "react";
import toast from "react-hot-toast";

export default function LinksTab({
  url,
  customCheckoutUrl,
  setCustomCheckoutUrl
}) {
  return (
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
  );
}
