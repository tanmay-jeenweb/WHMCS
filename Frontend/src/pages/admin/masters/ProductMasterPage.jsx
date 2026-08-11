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
import ProductConfigForm from "./ProductConfigForm";

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

// ─── Simple Create/Edit Form Component ─────────────────────────────────────────
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
    <div className="flex-1 font-sans text-slate-900">
      {/* Form Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? "Edit Product/Service" : "Create Product/Service"}
          </h1>
          <p className="text-slate-500 mt-1">
            Configure product details, product type, group assignment, store link, and module integration.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 font-medium text-sm flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Directory
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Starter Shared Plan, Deluxe cPanel"
                value={productName}
                onChange={handleNameChange}
                required
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none"
              />
            </div>

            {/* Product Group Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
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
                  className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="" disabled>-- Select Product Group --</option>
                  {productGroups.map((group) => (
                    <option key={group.id} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                Populated from Product/Service Group Master
              </p>
            </div>

            {/* Product Type (Radio Buttons) */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Product Type <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRODUCT_TYPES.map((type) => {
                  const isSelected = productType === type.label;
                  return (
                    <label
                      key={type.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
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

            {/* URL */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Store URL Link <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="https://.../index.php?rp=/store/group-name/product-name"
                value={url}
                onChange={handleUrlChange}
                required
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Module
              </label>
              <select
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {MODULE_OPTIONS.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Select server provisioning module (e.g. cPanel)
              </p>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 font-semibold text-sm cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#0056cf] hover:bg-[#0040a1] focus:ring-2 focus:ring-offset-2 focus:ring-[#0056cf] disabled:opacity-50 transition-colors cursor-pointer"
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
  const [configuringRow, setConfiguringRow] = useState(null);
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
        minWidth: "160px",
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
              onClick={() => setConfiguringRow(row)}
              style={{ display: "flex", width: 32, height: 32, alignItems: "center", justifyCenter: "center", borderRadius: 8, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#16a34a", cursor: "pointer", padding: 0 }}
              className="hover:bg-green-100/50 flex items-center justify-center"
              title="Configure Options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 15, height: 15 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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
  }, [items]); // Add items to dependencies

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "#f8fafc", fontFamily: "'Inter',sans-serif" }}>
      <Navbar title="CRM Admin" />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", margin: "0 auto", padding: "32px 30px" }}>
        
        {/* View Routing */}
        {configuringRow ? (
          <ProductConfigForm
            row={configuringRow}
            productGroups={productGroups}
            items={items}
            onClose={() => setConfiguringRow(null)}
          />
        ) : editingRow ? (
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
                    justifyCenter: "center",
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
