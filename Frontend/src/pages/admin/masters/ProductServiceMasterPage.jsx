import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../../../components/Navbar";
import {
  getAllProductServices,
  createProductService,
  updateProductService,
  deleteProductService
} from "../../../api/productServiceMasterApi";
import DataTable from "../../../components/DataTable";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BASE_URL_PREFIX = "https://8eb806de-74b5-4eff-ad59-147bf43e9700.package.webpros.cloud/index.php?rp=/store/";

// Helper to slugify product names for store URLs
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');         // Replace multiple - with single -
};

// ─── Create/Edit Form Component ──────────────────────────────────────────────
function ProductServiceForm({ row, onClose, onSave, saving }) {
  const isEdit = !!row;
  const [name, setName] = useState(row?.name || "");
  const [url, setUrl] = useState(row?.url || BASE_URL_PREFIX);
  const [headline, setHeadline] = useState(row?.product_group_headline || "");
  const [tagline, setTagline] = useState(row?.product_group_tagline || "");
  const [isUrlDirty, setIsUrlDirty] = useState(isEdit);

  // Auto-generate URL when Name changes (unless manually overridden by user)
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    if (!isUrlDirty) {
      setUrl(BASE_URL_PREFIX + slugify(newName));
    }
  };

  const handleUrlChange = (e) => {
    setIsUrlDirty(true);
    setUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!url.trim()) {
      toast.error("URL is required");
      return;
    }
    onSave({
      name: name.trim(),
      url: url.trim(),
      product_group_headline: headline.trim(),
      product_group_tagline: tagline.trim()
    });
  };

  return (
    <div className="flex-1 font-sans text-slate-900">
      {/* Form Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? "Edit Product/Service Group" : "Create Product/Service Group"}
          </h1>
          <p className="text-slate-500 mt-1">
            Configure product details, custom store urls, headlines, and client portal taglines.
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product / Service Group Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Web Hosting, VPS, Dedicated Servers"
                value={name}
                onChange={handleNameChange}
                required
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Custom Store URL <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder={BASE_URL_PREFIX + "slug"}
                value={url}
                onChange={handleUrlChange}
                required
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {!isUrlDirty ? "⚡ Auto-calculated from name." : "✏️ Custom URL entered."}{" "}
                <button 
                  type="button" 
                  onClick={() => { setIsUrlDirty(false); setUrl(BASE_URL_PREFIX + slugify(name)); }} 
                  className="text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer text-[11px]"
                >
                  Reset to Auto
                </button>
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Group Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Host Your Brand With Fast SSD Storage Servers"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Group Tagline
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Choose from our premium cloud systems, fully managed by industry experts. Instant setup with 99.9% uptime guarantee."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="py-2 px-4 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 font-semibold text-sm cursor-pointer transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !url.trim()}
              className="flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#0056cf] hover:bg-[#0040a1] focus:ring-2 focus:ring-offset-2 focus:ring-[#0056cf] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main ProductServiceMasterPage Component ──────────────────────────────────
export default function ProductServiceMasterPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getAllProductServices();
      setItems(response.data.data || []);
    } catch (err) {
      console.error("Failed to load products/services", err);
      toast.error("Unable to load Product/Service data.");
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
        // Edit flow
        await updateProductService(editingRow.id, formData);
        toast.success("Product/Service updated successfully!");
        setEditingRow(null);
      } else {
        // Create flow
        await createProductService(formData);
        toast.success("Product/Service created successfully!");
        setShowAddForm(false);
      }
      await loadData();
    } catch (err) {
      console.error("Failed to save product/service", err);
      toast.error(err?.response?.data?.message || "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product/service configuration?")) return;
    try {
      await deleteProductService(id);
      toast.success("Product/Service deleted successfully!");
      await loadData();
    } catch (err) {
      console.error("Failed to delete product/service", err);
      toast.error(err?.response?.data?.message || "Failed to delete product/service.");
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("Copied to clipboard!");
  };

  const columns = useMemo(() => {
    return [
      { key: "id", label: "ID", minWidth: "60px", sortable: true },
      {
        key: "name",
        label: "Product Name",
        minWidth: "160px",
        sortable: true,
        render: (row) => <span className="font-bold text-slate-800">{row.name}</span>
      },
      {
        key: "url",
        label: "Store URL Link",
        minWidth: "300px",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2 group max-w-sm">
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
        key: "product_group_headline",
        label: "Product Group Headline",
        minWidth: "220px",
        sortable: true,
        render: (row) => <span className="text-slate-700 text-sm font-semibold">{row.product_group_headline || "—"}</span>
      },
      {
        key: "product_group_tagline",
        label: "Tagline Description",
        minWidth: "260px",
        sortable: true,
        render: (row) => (
          <span className="text-slate-500 text-xs line-clamp-2" title={row.product_group_tagline}>
            {row.product_group_tagline || "—"}
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
        
        {/* Header Block (Only visible when not displaying a form) */}
        

        {/* View Routing */}
        {editingRow ? (
          <ProductServiceForm
            row={editingRow}
            onClose={() => setEditingRow(null)}
            onSave={handleSave}
            saving={saving}
          />
        ) : showAddForm ? (
          <ProductServiceForm
            onClose={() => setShowAddForm(false)}
            onSave={handleSave}
            saving={saving}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            <DataTable
              tableId="product_service_master"
              title="Product/Service Group Directory"
              data={items}
              columns={columns}
              loading={loading}
              searchPlaceholder="Search products, store links, headlines..."
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
                  title="Create Product/Service"
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
