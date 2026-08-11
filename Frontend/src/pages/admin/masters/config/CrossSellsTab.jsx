import React from "react";

export default function CrossSellsTab({
  items = [],
  row,
  crossSells = [],
  setCrossSells
}) {
  return (
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
  );
}
