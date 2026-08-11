import React, { useState } from "react";

export default function CrossSellsTab({
  items = [],
  row,
  crossSells = [],
  setCrossSells
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Available products to cross-sell (excluding current product)
  const availableProducts = items.filter((item) => item.id !== row?.id);

  // Filter products by search term
  const filteredProducts = availableProducts.filter((item) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    const pName = (item.product_name || "").toLowerCase();
    const gName = (item.product_group_name || "").toLowerCase();
    return pName.includes(query) || gName.includes(query);
  });

  const handleSelectProduct = (productId) => {
    const numericId = parseInt(productId) || productId;
    if (!crossSells.includes(numericId)) {
      setCrossSells && setCrossSells([...crossSells, numericId]);
    }
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleRemoveProduct = (productId) => {
    setCrossSells && setCrossSells(crossSells.filter((id) => id !== productId && String(id) !== String(productId)));
  };

  // Get selected product objects
  const selectedProductObjects = crossSells.map((id) => {
    return availableProducts.find((item) => String(item.id) === String(id)) || { id, product_name: `Product #${id}` };
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
        
        {/* Product Cross-sells Row */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-start gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700 pt-1.5">
            Product Cross-sells
          </div>
          <div className="sm:col-span-4 space-y-3">
            
            {/* Search Input Box */}
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Start typing to search for products."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* Autocomplete Dropdown List */}
              {isDropdownOpen && searchTerm.trim() !== "" && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <div className="p-2.5 text-xs text-slate-400 text-center">
                      No matching products found
                    </div>
                  ) : (
                    filteredProducts.map((item) => {
                      const isAlreadySelected = crossSells.includes(item.id) || crossSells.includes(String(item.id));
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={isAlreadySelected}
                          onClick={() => handleSelectProduct(item.id)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors border-none bg-transparent cursor-pointer ${
                            isAlreadySelected
                              ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                              : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                          }`}
                        >
                          <div>
                            <span className="font-semibold">{item.product_name}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({item.product_group_name || "Group"})</span>
                          </div>
                          {isAlreadySelected && <span className="text-[10px] italic">Added</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Selected Products Tags or Empty Message */}
            <div className="min-h-[40px] p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg">
              {selectedProductObjects.length === 0 ? (
                <p className="text-slate-500 text-xs font-medium italic m-0">
                  You have not selected any cross-sells (recommendations).
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedProductObjects.map((prod) => (
                    <span
                      key={prod.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 shadow-2xs"
                    >
                      {prod.product_name}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(prod.id)}
                        className="text-slate-400 hover:text-rose-600 bg-transparent border-none cursor-pointer text-xs font-bold leading-none p-0"
                        title="Remove product"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Explanatory Help Text */}
            <p className="text-slate-500 text-xs font-medium m-0">
              This list controls the products that display as cross-sells (recommendations) when ordering this product.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
