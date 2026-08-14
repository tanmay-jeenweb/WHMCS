import React, { useEffect, useState, useRef } from "react";
import { getAllProducts } from "../../../../api/productMasterApi";

export default function CrossSellsTab({
  items = [],
  row,
  crossSells = [],
  setCrossSells
}) {
  const [productList, setProductList] = useState(items || []);
  const [loading, setLoading] = useState(false);
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

  // Fetch all products directly from Product Master API
  useEffect(() => {
    setLoading(true);
    getAllProducts()
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setProductList(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch products for cross-sells:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Sync if items prop updates
  useEffect(() => {
    if (items && items.length > 0) {
      setProductList(items);
    }
  }, [items]);

  // Available products in Product Master (excluding current product being configured)
  const displayProducts = productList.filter((item) => {
    return !(row?.id && (item.id === row.id || String(item.id) === String(row.id)));
  });

  const handleToggleProduct = (productId) => {
    const numericId = parseInt(productId);
    const idToUse = isNaN(numericId) ? productId : numericId;
    
    let updated;
    if (crossSells.includes(idToUse)) {
      updated = crossSells.filter((id) => id !== idToUse);
    } else {
      updated = [...crossSells, idToUse];
    }
    setCrossSells && setCrossSells(updated);
  };

  // Get selected product names for display text
  const selectedProductNames = displayProducts
    .filter((item) => crossSells.includes(item.id))
    .map((item) => item.product_name);

  const selectedProducts = displayProducts.filter((item) => crossSells.includes(item.id));

  const getDropdownLabel = () => {
    if (selectedProductNames.length === 0) {
      return "Select products...";
    }
    if (selectedProductNames.length <= 2) {
      return selectedProductNames.join(", ");
    }
    return `${selectedProductNames.length} products selected`;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="border border-slate-200 rounded-xl overflow-visible divide-y divide-slate-100 text-xs sm:text-sm">
        
        {/* Product Cross-sells Row */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-center gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700">
            Product Cross-sells
          </div>
          <div className="sm:col-span-4 space-y-1">
            
            {/* Custom Multi-select Dropdown */}
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
                  {displayProducts.length === 0 ? (
                    <div className="p-3 text-slate-500 text-center sm:text-xs">
                      {loading ? "Loading products..." : "No products available"}
                    </div>
                  ) : (
                    displayProducts.map((item) => {
                      const isChecked = crossSells.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer select-none transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProduct(item.id)}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 font-medium sm:text-xs truncate">
                            {item.product_group_name
                              ? `${item.product_group_name} - ${item.product_name}`
                              : item.product_name}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Selected Products Pills */}
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 w-full sm:w-80">
                {selectedProducts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-800 rounded-md font-medium text-[11px] border border-slate-200 shadow-sm"
                  >
                    <span className="truncate max-w-[200px]">
                      {item.product_group_name
                        ? `${item.product_group_name} - ${item.product_name}`
                        : item.product_name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleProduct(item.id)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      title="Remove product"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Explanatory Help Text */}
            <p className="text-slate-500 text-xs font-medium m-0 pt-1">
              Select products to display as recommendations during checkout.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
