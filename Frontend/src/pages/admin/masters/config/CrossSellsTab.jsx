import React, { useEffect, useState } from "react";
import { getAllProducts } from "../../../../api/productMasterApi";

export default function CrossSellsTab({
  items = [],
  row,
  crossSells = [],
  setCrossSells
}) {
  const [productList, setProductList] = useState(items || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (row?.id && (item.id === row.id || String(item.id) === String(row.id))) {
      return false;
    }
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    const pName = (item.product_name || "").toLowerCase();
    const gName = (item.product_group_name || "").toLowerCase();
    const pType = (item.product_type || "").toLowerCase();
    return pName.includes(query) || gName.includes(query) || pType.includes(query);
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
        
        {/* Product Cross-sells Row */}
        <div className="grid grid-cols-1 sm:grid-cols-5 py-3.5 px-4 bg-white items-start gap-2 sm:gap-4">
          <div className="sm:col-span-1 sm:text-right font-semibold text-slate-700 pt-1.5">
            Product Cross-sells
          </div>
          <div className="sm:col-span-4 space-y-2.5">
            
            {/* Search Input Box */}
            <div className="w-full sm:w-[450px] space-y-1">
              <input
                type="text"
                placeholder="Start typing to search for products."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-slate-400 text-[11px] italic font-medium m-0">
                Click Save Changes to commit changes.
              </p>
            </div>

            {/* Product Master Dropdown Menu */}
            <div className="w-full sm:w-[450px] space-y-2">
              <select
                multiple
                size={Math.min(8, Math.max(3, displayProducts.length || 3))}
                value={crossSells.map(String)}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.selectedOptions, (opt) => {
                    const num = parseInt(opt.value);
                    return isNaN(num) ? opt.value : num;
                  });
                  setCrossSells && setCrossSells(selectedValues);
                }}
                className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-xs text-slate-700 font-medium"
              >
                {displayProducts.length === 0 ? (
                  <option disabled value="">
                    {loading ? "Loading products..." : "No products available in Product Master"}
                  </option>
                ) : (
                  displayProducts.map((item) => (
                    <option key={item.id} value={item.id} className="py-1">
                      {item.product_group_name ? `${item.product_group_name} - ${item.product_name}` : item.product_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Explanatory Help Text */}
            <p className="text-slate-500 text-xs font-medium m-0 pt-1">
              This list controls the products that display as cross-sells (recommendations) when ordering this product.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
