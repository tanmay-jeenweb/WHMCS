import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../../../components/Navbar";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../../../api/productMasterApi";
import { getAllProductServices } from "../../../api/productServiceMasterApi";
import DataTable from "../../../components/DataTable";
import toast from "react-hot-toast";

const BASE_STORE_PREFIX = "https://8eb806de-74b5-4eff-ad59-147bf43e9700.package.webpros.cloud/index.php?rp=/store/";

// Helper to slugify text for store URLs
const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
};

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

// ─── Create/Edit Form Component ──────────────────────────────────────────────
function ProductForm({ row, productGroups, onClose, onSave, saving }) {
  const isEdit = !!row;

  const [productName, setProductName] = useState(row?.product_name || "");
  const [productType, setProductType] = useState(row?.product_type || "Shared hosting");
  
  // Set default group if editing or pick first available group
  const initialGroup = row?.product_group_name || (productGroups.length > 0 ? productGroups[0].name : "");
  const initialGroupId = row?.product_group_id || (productGroups.length > 0 ? productGroups[0].id : 0);
  
  const [productGroupName, setProductGroupName] = useState(initialGroup);
  const [productGroupId, setProductGroupId] = useState(initialGroupId);

  const [url, setUrl] = useState(row?.url || "");
  const [moduleName, setModuleName] = useState(row?.module_name || "No Module");
  const [isUrlDirty, setIsUrlDirty] = useState(isEdit);

  // Compute standard auto-generated URL based on group + name
  const computeAutoUrl = (group, name) => {
    const groupSlug = slugify(group) || "group";
    const nameSlug = slugify(name) || "product";
    return `${BASE_STORE_PREFIX}${groupSlug}/${nameSlug}`;
  };

  // Initialize auto URL on new form load if empty
  useEffect(() => {
    if (!isEdit && !isUrlDirty) {
      setUrl(computeAutoUrl(productGroupName, productName));
    }
  }, []);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setProductName(newName);
    if (!isUrlDirty) {
      setUrl(computeAutoUrl(productGroupName, newName));
    }
  };

  const handleGroupChange = (e) => {
    const selectedName = e.target.value;
    setProductGroupName(selectedName);

    const foundGroup = productGroups.find(g => g.name === selectedName);
    if (foundGroup) {
      setProductGroupId(foundGroup.id);
    } else {
      setProductGroupId(0);
    }

    if (!isUrlDirty) {
      setUrl(computeAutoUrl(selectedName, productName));
    }
  };

  const handleUrlChange = (e) => {
    setIsUrlDirty(true);
    setUrl(e.target.value);
  };

  const handleResetUrl = () => {
    setIsUrlDirty(false);
    setUrl(computeAutoUrl(productGroupName, productName));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!productGroupName.trim()) {
      toast.error("Please select a Product Group");
      return;
    }
    if (!url.trim()) {
      toast.error("URL is required");
      return;
    }

    onSave({
      product_name: productName.trim(),
      product_type: productType,
      product_group_id: productGroupId,
      product_group_name: productGroupName.trim(),
      url: url.trim(),
      module_name: moduleName
    });
  };

  return (
    <div className="flex flex-col flex-1 font-sans" style={{ background: "linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)" }}>
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md w-full mx-auto my-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 m-0">
              {isEdit ? "Edit Product/Service" : "Create Product/Service"}
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Configure product details, product type, group assignment, store link, and module integration.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-slate-500 bg-transparent border-none cursor-pointer text-sm font-medium hover:text-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Directory
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Product Core Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Core Info</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-700">
                  Product Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Starter Shared Plan, Deluxe cPanel"
                  value={productName}
                  onChange={handleNameChange}
                  required
                  className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Product Group Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-700">
                  Product Group <span className="text-rose-600">*</span>
                </label>
                {productGroups.length === 0 ? (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    No product groups found. Please create a Product/Service Group first.
                  </div>
                ) : (
                  <select
                    value={productGroupName}
                    onChange={handleGroupChange}
                    required
                    className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 bg-white transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="" disabled>-- Select Product Group --</option>
                    {productGroups.map((group) => (
                      <option key={group.id} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] text-slate-500">
                  Populated from Product/Service Group Master
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Product Type (Radio Buttons) */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block text-[13px] font-semibold text-slate-700">
              Product Type <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRODUCT_TYPES.map((type) => {
                const isSelected = productType === type.label;
                return (
                  <label
                    key={type.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-2 ring-blue-100"
                        : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="product_type"
                      value={type.label}
                      checked={isSelected}
                      onChange={() => setProductType(type.label)}
                      className="w-4 h-4 text-blue-600 accent-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <i className={`fa-solid ${type.icon} text-sm ${isSelected ? "text-blue-600" : "text-slate-400"}`}></i>
                      <span className="text-xs font-semibold">{type.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Store URL & Module Integration */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Store Link & Module</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* URL */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[13px] font-semibold text-slate-700">
                  URL <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://.../index.php?rp=/store/group-name/product-name"
                  value={url}
                  onChange={handleUrlChange}
                  required
                  className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm font-mono outline-none text-slate-800 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <p className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>
                    {!isUrlDirty ? "⚡ Auto-formatted from Product Group and Product Name." : "✏️ Custom URL entered."}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetUrl}
                    className="text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer text-[11px] font-medium"
                  >
                    Reset to Auto
                  </button>
                </p>
              </div>

              {/* Module */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-700">
                  Module
                </label>
                <select
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  className="w-full box-border border-[1.5px] border-slate-300 rounded-xl py-3 px-4 text-sm outline-none text-slate-800 bg-white transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  {MODULE_OPTIONS.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Select server provisioning module (e.g. cPanel)
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl border-none bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main ProductMasterPage Component ──────────────────────────────────────────
export default function ProductMasterPage() {
  const [items, setItems] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resProducts, resGroups] = await Promise.all([
        getAllProducts(),
        getAllProductServices()
      ]);

      if (resProducts.data?.success) {
        setItems(resProducts.data.data || []);
      }
      if (resGroups.data?.success) {
        setProductGroups(resGroups.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load Product Master data", err);
      toast.error("Failed to load product data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingRow) {
        await updateProduct(editingRow.id, formData);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(formData);
        toast.success("Product created successfully!");
      }
      setEditingRow(null);
      setShowAddForm(false);
      await loadData();
    } catch (err) {
      console.error("Failed to save product", err);
      toast.error(err?.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      await loadData();
    } catch (err) {
      console.error("Failed to delete product", err);
      toast.error(err?.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("Copied to clipboard!");
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case "Shared hosting":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Reseller hosting":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Server/VPS":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Email":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Domains":
        return "bg-teal-50 text-teal-700 border-teal-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const columns = useMemo(() => {
    return [
      { key: "id", label: "ID", minWidth: "60px", sortable: true },
      {
        key: "product_name",
        label: "Product Name",
        minWidth: "180px",
        sortable: true,
        render: (row) => <span className="font-bold text-slate-800">{row.product_name}</span>
      },
      {
        key: "product_type",
        label: "Product Type",
        minWidth: "150px",
        sortable: true,
        render: (row) => (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getTypeBadgeStyle(row.product_type)}`}>
            {row.product_type}
          </span>
        )
      },
      {
        key: "product_group_name",
        label: "Product Group",
        minWidth: "160px",
        sortable: true,
        render: (row) => (
          <span className="font-medium text-slate-700 bg-slate-100/70 px-2.5 py-1 rounded-md text-xs border border-slate-200">
            {row.product_group_name}
          </span>
        )
      },
      {
        key: "url",
        label: "Store URL Link",
        minWidth: "280px",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2 group max-w-xs">
            <span className="font-mono text-xs text-blue-800 truncate block flex-1" title={row.url}>
              {row.url}
            </span>
            <button
              onClick={() => handleCopyLink(row.url)}
              title="Copy URL"
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25v1.5a2.25 2.25 0 0 0 2.25 2.25H15a2.25 2.25 0 0 0 2.25-2.25v-1.5a2.25 2.25 0 0 0-.25-1.014ZM18 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            </button>
            <a
              href={row.url}
              target="_blank"
              rel="noreferrer"
              title="Visit store link"
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        )
      },
      {
        key: "module_name",
        label: "Module",
        minWidth: "120px",
        sortable: true,
        render: (row) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            row.module_name === "cPanel"
              ? "bg-orange-100 text-orange-800 border border-orange-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}>
            {row.module_name || "No Module"}
          </span>
        )
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        minWidth: "120px",
        render: (row) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setEditingRow(row)}
              style={{ display: "flex", width: 32, height: 32, alignItems: "center", justifyCenter: "center", borderRadius: 8, border: "1px solid #bcdbff", background: "#f0f7ff", color: "#0056cf", cursor: "pointer", padding: 0 }}
              className="hover:bg-blue-100/50 flex items-center justify-center"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 15, height: 15 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931Z" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(row.id)}
              style={{ display: "flex", width: 32, height: 32, alignItems: "center", justifyCenter: "center", borderRadius: 8, border: "1px solid #fecdd3", background: "#fff1f2", color: "#be123c", cursor: "pointer", padding: 0 }}
              className="hover:bg-rose-100/50 flex items-center justify-center"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 15, height: 15 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h12m-1.5 0-.563 12.375A2.25 2.25 0 0113.693 21H10.307a2.25 2.25 0 01-2.244-2.125L7.5 7.5m3-3h3A1.5 1.5 0 0115 6v1.5H9V6a1.5 1.5 0 011.5-1.5Z" />
              </svg>
            </button>
          </div>
        )
      }
    ];
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "#f8fafc", fontFamily: "'Inter',sans-serif" }}>
      <Navbar title="CRM Admin" />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", margin: "0 auto", padding: "32px 30px" }}>
        
        {/* View Routing */}
        {editingRow ? (
          <ProductForm
            row={editingRow}
            productGroups={productGroups}
            onClose={() => setEditingRow(null)}
            onSave={handleSave}
            saving={saving}
          />
        ) : showAddForm ? (
          <ProductForm
            productGroups={productGroups}
            onClose={() => setShowAddForm(false)}
            onSave={handleSave}
            saving={saving}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            <DataTable
              tableId="product_master"
              title="Product/Service Master Directory"
              data={items}
              columns={columns}
              loading={loading}
              searchPlaceholder="Search products, types, group links, modules..."
              actionButton={
                <button
                  onClick={() => setShowAddForm(true)}
                  style={{
                    display: "flex",
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 9,
                    background: "linear-gradient(135deg,#0056cf,#0040a1)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0, 86, 207,0.35)",
                    padding: "0 16px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    gap: "6px"
                  }}
                  title="Create Product"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 16, height: 16 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}
