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
  allowMultipleQuantities,
  setAllowMultipleQuantities,
  recurringCyclesLimit,
  setRecurringCyclesLimit,
  fixedTerm,
  setFixedTerm,
  terminationEmail,
  setTerminationEmail,
  prorataBilling,
  setProrataBilling,
  prorataDate,
  setProrataDate,
  chargeNextMonth,
  setChargeNextMonth,
  onDemandRenewals,
  setOnDemandRenewals,
  allowEarlyRenewals,
  setAllowEarlyRenewals,
  earlyRenewalMonthly,
  setEarlyRenewalMonthly,
  earlyRenewalQuarterly,
  setEarlyRenewalQuarterly,
  earlyRenewalSemiannually,
  setEarlyRenewalSemiannually,
  earlyRenewalAnnually,
  setEarlyRenewalAnnually,
  earlyRenewalBiennially,
  setEarlyRenewalBiennially,
  earlyRenewalTriennially,
  setEarlyRenewalTriennially
}) {
  return (
    <div className="space-y-6 font-sans">
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
        
        {/* Payment Type */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Payment Type
          </div>
          <div className="sm:col-span-4 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="paymentType"
                value="free"
                checked={paymentType === "free"}
                onChange={() => setPaymentType("free")}
                className="h-4 w-4 text-[#0056cf] accent-[#0056cf]"
              />
              <span className="text-slate-700 font-medium">Free</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="paymentType"
                value="one-time"
                checked={paymentType === "one-time"}
                onChange={() => setPaymentType("one-time")}
                className="h-4 w-4 text-[#0056cf] accent-[#0056cf]"
              />
              <span className="text-slate-700 font-medium">One Time</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="paymentType"
                value="recurring"
                checked={paymentType === "recurring"}
                onChange={() => setPaymentType("recurring")}
                className="h-4 w-4 text-[#0056cf] accent-[#0056cf]"
              />
              <span className="text-slate-700 font-medium">Recurring</span>
            </label>
          </div>
        </div>

        {/* Pricing Matrix if Not Free */}
        {paymentType !== "free" && (
          <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-start gap-2 sm:gap-4">
            <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700 pt-1.5">
              Pricing Details
            </div>
            <div className="sm:col-span-4 space-y-3">
              {paymentType === "one-time" ? (
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium text-xs">One Time Price ($):</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(e.target.value)}
                      className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium text-xs">Setup Fee ($):</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={monthlySetup}
                      onChange={(e) => setMonthlySetup(e.target.value)}
                      className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-2.5">Billing Cycle</th>
                        <th className="p-2.5">Price ($)</th>
                        <th className="p-2.5">Setup Fee ($)</th>
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
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-medium text-slate-800">{item.cycle}</td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={item.price}
                              onChange={(e) => item.setPrice(e.target.value)}
                              className="w-28 px-2.5 py-1 border border-slate-300 rounded-md text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={item.setup}
                              onChange={(e) => item.setSetup(e.target.value)}
                              className="w-28 px-2.5 py-1 border border-slate-300 rounded-md text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Allow Multiple Quantities */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-start gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700 pt-0.5">
            Allow Multiple Quantities
          </div>
          <div className="sm:col-span-4 space-y-2">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="allowMultipleQuantities"
                value="no"
                checked={allowMultipleQuantities === "no"}
                onChange={() => setAllowMultipleQuantities("no")}
                className="h-4 w-4 mt-0.5 text-[#0056cf] accent-[#0056cf]"
              />
              <span className="text-slate-700 font-medium">No</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="allowMultipleQuantities"
                value="multiple_services"
                checked={allowMultipleQuantities === "multiple_services"}
                onChange={() => setAllowMultipleQuantities("multiple_services")}
                className="h-4 w-4 mt-0.5 text-[#0056cf] accent-[#0056cf]"
              />
              <span className="text-slate-700 font-medium">
                Yes - Multiple Services: <span className="font-normal text-slate-500">Each unit represents its own individual service instance</span>
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="allowMultipleQuantities"
                value="scaling_service"
                checked={allowMultipleQuantities === "scaling_service"}
                onChange={() => setAllowMultipleQuantities("scaling_service")}
                className="h-4 w-4 mt-0.5 text-[#0056cf] accent-[#0056cf]"
              />
              <span className="text-slate-700 font-medium">
                Yes - Scaling Service: <span className="font-normal text-slate-500">Each service instance allows a quantity to be defined</span>
              </span>
            </label>
          </div>
        </div>

        {/* Recurring Cycles Limit */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Recurring Cycles Limit
          </div>
          <div className="sm:col-span-4 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min="0"
              value={recurringCyclesLimit}
              onChange={(e) => setRecurringCyclesLimit(parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-500 text-xs font-medium">
              To limit this product to only recur a fixed number of times, enter the total number of times to invoice (0 = Unlimited)
            </span>
          </div>
        </div>

        {/* Auto Terminate/Fixed Term */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Auto Terminate/Fixed Term
          </div>
          <div className="sm:col-span-4 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min="0"
              value={fixedTerm}
              onChange={(e) => setFixedTerm(parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-500 text-xs font-medium">
              Enter the number of days after activation to automatically terminate (eg. free trials, time limited products, etc...)
            </span>
          </div>
        </div>

        {/* Termination Email */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Termination Email
          </div>
          <div className="sm:col-span-4 space-y-1">
            <select
              value={terminationEmail}
              onChange={(e) => setTerminationEmail(e.target.value)}
              className="block w-64 px-3 py-1.5 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-xs"
            >
              <option value="None">None</option>
              <option value="Service Termination Notification">Service Termination Notification</option>
              <option value="Trial Expired Email">Trial Expired Email</option>
              <option value="Hosting Account Welcome Email">Hosting Account Welcome Email</option>
            </select>
            <p className="text-slate-500 text-xs font-medium">
              Choose the email template to send when the fixed term comes to an end
            </p>
          </div>
        </div>

        {/* Prorata Billing */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Prorata Billing
          </div>
          <div className="sm:col-span-4 flex items-center gap-2">
            <input
              id="prorataBilling"
              type="checkbox"
              checked={prorataBilling}
              onChange={(e) => setProrataBilling(e.target.checked)}
              className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf] cursor-pointer"
            />
            <label htmlFor="prorataBilling" className="text-slate-600 cursor-pointer font-medium select-none">
              Check to enable
            </label>
          </div>
        </div>

        {/* Prorata Date */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Prorata Date
          </div>
          <div className="sm:col-span-4 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min="0"
              max="31"
              value={prorataDate}
              onChange={(e) => setProrataDate(parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-500 text-xs font-medium">
              Enter the day of the month you want to charge on
            </span>
          </div>
        </div>

        {/* Charge Next Month */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Charge Next Month
          </div>
          <div className="sm:col-span-4 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min="0"
              max="31"
              value={chargeNextMonth}
              onChange={(e) => setChargeNextMonth(parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-500 text-xs font-medium">
              Enter the day of the month after which the following month will also be included on the first invoice
            </span>
          </div>
        </div>

        {/* On-Demand Renewals */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-start gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700 pt-0.5">
            On-Demand Renewals
          </div>
          <div className="sm:col-span-4 space-y-3">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="onDemandRenewals"
                  value="system_default"
                  checked={onDemandRenewals === "system_default"}
                  onChange={() => setOnDemandRenewals("system_default")}
                  className="h-4 w-4 text-[#0056cf] accent-[#0056cf]"
                />
                <span className="text-slate-700 font-medium">Use System Default</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="onDemandRenewals"
                  value="product_specific"
                  checked={onDemandRenewals === "product_specific"}
                  onChange={() => setOnDemandRenewals("product_specific")}
                  className="h-4 w-4 text-[#0056cf] accent-[#0056cf]"
                />
                <span className="text-slate-700 font-medium">Use Product-Specific Configuration</span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="allowEarlyRenewals"
                type="checkbox"
                checked={allowEarlyRenewals}
                onChange={(e) => setAllowEarlyRenewals(e.target.checked)}
                className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf] cursor-pointer"
              />
              <label htmlFor="allowEarlyRenewals" className="text-slate-600 cursor-pointer font-medium select-none">
                Check to allow clients to place renewal orders early.
              </label>
            </div>

            {/* Renewal Days Grid */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-w-2xl">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 border-r border-slate-200">Monthly</th>
                    <th className="p-2 border-r border-slate-200">Quarterly</th>
                    <th className="p-2 border-r border-slate-200">Semi-Annually</th>
                    <th className="p-2 border-r border-slate-200">Annually</th>
                    <th className="p-2 border-r border-slate-200">Biennially</th>
                    <th className="p-2">Triennially</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-r border-slate-200">
                      <input
                        type="number"
                        value={earlyRenewalMonthly}
                        onChange={(e) => setEarlyRenewalMonthly(parseInt(e.target.value) || 0)}
                        className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <input
                        type="number"
                        value={earlyRenewalQuarterly}
                        onChange={(e) => setEarlyRenewalQuarterly(parseInt(e.target.value) || 0)}
                        className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <input
                        type="number"
                        value={earlyRenewalSemiannually}
                        onChange={(e) => setEarlyRenewalSemiannually(parseInt(e.target.value) || 0)}
                        className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <input
                        type="number"
                        value={earlyRenewalAnnually}
                        onChange={(e) => setEarlyRenewalAnnually(parseInt(e.target.value) || 0)}
                        className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <input
                        type="number"
                        value={earlyRenewalBiennially}
                        onChange={(e) => setEarlyRenewalBiennially(parseInt(e.target.value) || 0)}
                        className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={earlyRenewalTriennially}
                        onChange={(e) => setEarlyRenewalTriennially(parseInt(e.target.value) || 0)}
                        className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-500 text-xs font-medium">
              The period (in days) during which clients can place early renewal orders before the service's due date.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
