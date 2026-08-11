import React from "react";

export default function PricingTab({
  paymentType,
  setPaymentType,
  monthlyPrice,
  setMonthlyPrice,
  monthlySetup,
  setMonthlySetup,
  quarterlyPrice,
  setQuarterlyPrice,
  quarterlySetup,
  setQuarterlySetup,
  semiannuallyPrice,
  setSemiannuallyPrice,
  semiannuallySetup,
  setSemiannuallySetup,
  annuallyPrice,
  setAnnuallyPrice,
  annuallySetup,
  setAnnuallySetup,
  bienniallyPrice,
  setBienniallyPrice,
  bienniallySetup,
  setBienniallySetup,
  trienniallyPrice,
  setTrienniallyPrice,
  trienniallySetup,
  setTrienniallySetup,
  fixedTerm,
  setFixedTerm
}) {
  return (
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
  );
}
