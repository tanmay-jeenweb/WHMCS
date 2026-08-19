import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import DataTable from '../../../components/DataTable';
import {
  getResellerConfig,
  updateResellerConfig,
  getAllResellerAccounts,
  createResellerAccount,
  deleteResellerAccount,
  getResellerProductPricing,
  setResellerProductPricing,
  getResellerClientOrders
} from '../../../api/resellerMasterApi';
import toast from 'react-hot-toast';

export default function ResellerMasterPage() {
  const navigate = useNavigate();

  // Settings Modal Toggle
  const [showConfigModal, setShowConfigModal] = useState(false);

  // General Reseller Config State
  const [config, setConfig] = useState({
    allow_whitelabel_branding: 'enabled',
    allow_subaccount_creation: 'enabled',
    max_subaccounts_per_reseller: '',
    default_commission_rate: '',
    allow_custom_nameservers: 'enabled',
    allow_api_access: 'enabled',
    reseller_tier_levels: 'Silver,Gold,Platinum',
    allowed_reseller_actions: 'create_subaccount,manage_pricing,custom_dns,payout_request'
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // DataTable State for Reseller Accounts Directory
  const [resellerAccounts, setResellerAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReseller, setNewReseller] = useState({
    reseller_code: '',
    reseller_name: '',
    email: '',
    password: '',
    tier_level: 'Silver Tier',
    commission_rate: '',
    subaccount_count: '',
    status: 'active'
  });
  const [creatingReseller, setCreatingReseller] = useState(false);

  // Per-Reseller Custom Product Pricing Modal State
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPricingReseller, setSelectedPricingReseller] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [resellerPrices, setResellerPrices] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [pricingForm, setPricingForm] = useState({
    monthly_price: '',
    annually_price: '',
    triennially_price: ''
  });
  const [savingPricing, setSavingPricing] = useState(false);

  // Reseller Order History & Subscriptions Modal State
  const [selectedResellerOrdersModal, setSelectedResellerOrdersModal] = useState(null);
  const [resellerOrdersList, setResellerOrdersList] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const handleOpenResellerOrders = async (reseller) => {
    setSelectedResellerOrdersModal(reseller);
    setOrdersLoading(true);
    try {
      const res = await getResellerClientOrders(reseller.email);
      if (res.data?.success) {
        setResellerOrdersList(res.data.data || []);
      } else {
        setResellerOrdersList([]);
      }
    } catch (err) {
      console.error("Failed to load reseller orders", err);
      setResellerOrdersList([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await getResellerConfig();
      if (res.data?.success && res.data.data) {
        setConfig(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load reseller config", err);
    }
  };

  const fetchResellerAccounts = async () => {
    setAccountsLoading(true);
    try {
      const res = await getAllResellerAccounts();
      if (res.data?.success) {
        setResellerAccounts(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load reseller accounts", err);
    } finally {
      setAccountsLoading(false);
    }
  };

  const fetchCatalogProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/product-master");
      const json = await res.json();
      if (json.success && json.data) {
        setCatalogProducts(json.data);
      }
    } catch (err) {
      console.error("Failed to load catalog products", err);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchResellerAccounts();
    fetchCatalogProducts();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await updateResellerConfig(config);
      if (res.data?.success) {
        toast.success("Reseller master settings updated successfully!");
        setShowConfigModal(false);
      } else {
        toast.error(res.data?.message || "Failed to update settings.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateResellerSubmit = async (e) => {
    e.preventDefault();
    if (!newReseller.reseller_name.trim() || !newReseller.email.trim()) {
      toast.error("Reseller Name and Email are required.");
      return;
    }
    if (!newReseller.password || newReseller.password.length < 4) {
      toast.error("Please enter a valid password (min 4 chars).");
      return;
    }

    setCreatingReseller(true);
    try {
      const res = await createResellerAccount(newReseller);
      if (res.data?.success) {
        toast.success("Reseller account created successfully!");
        setShowAddModal(false);
        setNewReseller({
          reseller_code: '',
          reseller_name: '',
          email: '',
          password: '',
          tier_level: 'Silver Tier',
          commission_rate: '',
          subaccount_count: '',
          status: 'active'
        });
        fetchResellerAccounts();
      } else {
        toast.error(res.data?.message || "Failed to create reseller account.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create reseller account.");
    } finally {
      setCreatingReseller(false);
    }
  };

  const handleDeleteReseller = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reseller account?")) return;
    try {
      const res = await deleteResellerAccount(id);
      if (res.data?.success) {
        toast.success("Reseller account deleted successfully!");
        fetchResellerAccounts();
      } else {
        toast.error(res.data?.message || "Failed to delete reseller.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete reseller account.");
    }
  };

  // Open Per-Reseller Pricing Modal
  const handleOpenPricingModal = async (reseller) => {
    setSelectedPricingReseller(reseller);
    setShowPricingModal(true);
    try {
      const res = await getResellerProductPricing(reseller.email);
      if (res.data?.success) {
        setResellerPrices(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load reseller custom pricing", err);
    }
  };

  // When a catalog product is selected in pricing modal
  const handleSelectProduct = (prodId) => {
    setSelectedProductId(prodId);
    if (!prodId) {
      setPricingForm({ monthly_price: '', annually_price: '', triennially_price: '' });
      return;
    }
    const foundCustom = resellerPrices.find(p => p.product_id.toString() === prodId.toString());
    const foundCatalog = catalogProducts.find(p => p.id.toString() === prodId.toString());

    if (foundCustom) {
      setPricingForm({
        monthly_price: foundCustom.monthly_price || '',
        annually_price: foundCustom.annually_price || '',
        triennially_price: foundCustom.triennially_price || ''
      });
    } else if (foundCatalog) {
      setPricingForm({
        monthly_price: foundCatalog.monthly_price || '',
        annually_price: foundCatalog.annually_price || '',
        triennially_price: foundCatalog.triennially_price || ''
      });
    }
  };

  // Save Custom Product Pricing for Reseller
  const handleSaveProductPricing = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error("Please select a product from the dropdown.");
      return;
    }
    const targetProd = catalogProducts.find(p => p.id.toString() === selectedProductId.toString());
    if (!targetProd) return;

    setSavingPricing(true);
    try {
      const payload = {
        reseller_email: selectedPricingReseller.email,
        product_id: targetProd.id,
        product_name: targetProd.product_name,
        monthly_price: pricingForm.monthly_price,
        annually_price: pricingForm.annually_price,
        triennially_price: pricingForm.triennially_price
      };

      const res = await setResellerProductPricing(payload);
      if (res.data?.success) {
        toast.success(`Custom price saved for ${targetProd.product_name}!`);
        // Refresh pricing list for this reseller
        const updatedRes = await getResellerProductPricing(selectedPricingReseller.email);
        if (updatedRes.data?.success) {
          setResellerPrices(updatedRes.data.data || []);
        }
      } else {
        toast.error(res.data?.message || "Failed to save pricing.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save reseller pricing.");
    } finally {
      setSavingPricing(false);
    }
  };

  // DataTable Columns definition
  const resellerColumns = [
    { key: 'id', label: 'ID', minWidth: '80px', sortable: true },
    { key: 'reseller_code', label: 'Reseller ID', minWidth: '160px', sortable: true, render: row => <span className="font-bold font-mono text-[#0056cf]">{row.reseller_code}</span> },
    { key: 'reseller_name', label: 'Reseller Name', minWidth: '200px', sortable: true, render: row => <span className="font-bold text-slate-900">{row.reseller_name}</span> },
    { key: 'email', label: 'Email Address', minWidth: '220px', sortable: true, render: row => <span className="font-mono text-xs text-slate-700">{row.email}</span> },
    { key: 'tier_level', label: 'Tier Level', minWidth: '160px', sortable: true, render: row => <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">{row.tier_level}</span> },
    { key: 'commission_rate', label: 'Commission Rate', minWidth: '150px', sortable: true, render: row => <span className="font-mono font-bold text-slate-900">{parseFloat(row.commission_rate || 0).toFixed(2)}%</span> },
    { key: 'subaccount_count', label: 'Sub-Accounts', minWidth: '130px', sortable: true, render: row => <span className="font-mono font-bold text-slate-700">{row.subaccount_count || 0}</span> },
    {
      key: 'status', label: 'Status', minWidth: '120px', sortable: true, render: row => (
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
          row.status === 'active'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : row.status === 'pending'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions', label: 'Actions', minWidth: '150px', sortable: false, render: row => (
        <div className="flex items-center space-x-2">
          {/* Blue Edit Button */}
          <button
            onClick={() => {
              setNewReseller({
                reseller_code: row.reseller_code || '',
                reseller_name: row.reseller_name || '',
                email: row.email || '',
                password: row.password || '',
                tier_level: row.tier_level || 'Silver Tier',
                commission_rate: row.commission_rate || '',
                subaccount_count: row.subaccount_count || '',
                status: row.status || 'active'
              });
              setShowAddModal(true);
            }}
            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0056cf] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Edit Reseller Account Details"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Purple ShoppingBag Order History Icon Button */}
          <button
            onClick={() => handleOpenResellerOrders(row)}
            className="w-8 h-8 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="View Reseller Order History & Client Subscriptions"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>

          {/* Green Gear Settings Icon Button for Per-Reseller Custom Pricing */}
          <button
            onClick={() => handleOpenPricingModal(row)}
            className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Configure Custom Product Pricing for Reseller"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Red Trash Delete Icon Button */}
          <button
            onClick={() => handleDeleteReseller(row.id)}
            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Delete Reseller Account"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Universal Header (Navbar) */}
      <Navbar title="CRM Reseller Master" />

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Page Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')} className="text-xs font-semibold text-slate-500 hover:text-[#0056cf] flex items-center gap-1 cursor-pointer">
              <span>←</span> Dashboard
            </button>
            <span className="text-slate-300">|</span>
            <h1 className="text-xl font-bold text-slate-900">Reseller Master</h1>
          </div>

          {/* Setting Gear & Add Reseller Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:text-[#0056cf] hover:border-blue-300 hover:bg-blue-50/50 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              title="Reseller Configuration & Tier Permissions"
            >
              <span>⚙️ Settings & Permissions</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#0056cf] hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs"
            >
              + Add Reseller
            </button>
          </div>
        </div>

        {/* Reseller Accounts Directory DataTable */}
        <DataTable
          tableId="reseller_master_accounts_table"
          title="Reseller Accounts Directory"
          columns={resellerColumns}
          data={resellerAccounts}
          loading={accountsLoading}
          searchKey="reseller_name"
        />

      </main>

      {/* MODAL 1: ADD / EDIT RESELLER ACCOUNT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Add New Reseller Account</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Create a reseller account to grant reseller portal access.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateResellerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reseller Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Reseller Solutions"
                  value={newReseller.reseller_name}
                  onChange={(e) => setNewReseller({ ...newReseller, reseller_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0056cf]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reseller Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="reseller@company.com"
                  value={newReseller.email}
                  onChange={(e) => setNewReseller({ ...newReseller, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0056cf]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Set account password"
                  value={newReseller.password}
                  onChange={(e) => setNewReseller({ ...newReseller, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf]"
                />
              </div>



              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingReseller}
                  className="px-5 py-2.5 rounded-xl bg-[#0056cf] hover:bg-blue-700 text-white font-extrabold transition cursor-pointer disabled:opacity-50"
                >
                  {creatingReseller ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOM RESELLER PRODUCT PRICING SETTINGS */}
      {showPricingModal && selectedPricingReseller && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-extrabold text-[#0056cf] uppercase tracking-wider block">Custom Product Pricing Settings</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Set Custom Rates for {selectedPricingReseller.reseller_name} ({selectedPricingReseller.email})
                </h3>
              </div>
              <button onClick={() => setShowPricingModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-lg">✕</button>
            </div>

            {/* Form to Select Product & Set Custom Prices */}
            <form onSubmit={handleSaveProductPricing} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 text-xs font-sans">
              <div>
                <label className="block font-extrabold text-slate-800 mb-1">Select Catalog Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf] cursor-pointer"
                >
                  <option value="">-- Choose a Product from Catalog --</option>
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} ({p.product_group_name || 'Business Email'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProductId && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Custom 1 Month Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 250"
                      value={pricingForm.monthly_price}
                      onChange={(e) => setPricingForm({ ...pricingForm, monthly_price: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Custom 1 Year Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 2700"
                      value={pricingForm.annually_price}
                      onChange={(e) => setPricingForm({ ...pricingForm, annually_price: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Custom 3 Years Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 7200"
                      value={pricingForm.triennially_price}
                      onChange={(e) => setPricingForm({ ...pricingForm, triennially_price: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={savingPricing || !selectedProductId}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {savingPricing ? "Saving Price..." : "Save Product Price Override"}
                </button>
              </div>
            </form>

            {/* List of Current Saved Custom Pricing Overrides */}
            <div className="space-y-3 font-sans">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Configured Price Overrides for this Reseller ({resellerPrices.length})
              </h4>

              {resellerPrices.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 p-4 text-center rounded-xl text-xs text-slate-500 font-medium">
                  No custom product prices configured for this reseller yet. Standard catalog prices apply.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">1 Month Custom Price</th>
                        <th className="py-2.5 px-3">1 Year Custom Price</th>
                        <th className="py-2.5 px-3">3 Years Custom Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {resellerPrices.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{p.product_name}</td>
                          <td className="py-2.5 px-3 font-extrabold text-[#0056cf]">₹{parseFloat(p.monthly_price || 0).toFixed(2)}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{p.annually_price ? `₹${parseFloat(p.annually_price).toFixed(2)}` : 'Standard'}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-700">{p.triennially_price ? `₹${parseFloat(p.triennially_price).toFixed(2)}` : 'Standard'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowPricingModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close Settings
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: RESELLER MASTER CONFIGURATION & TIER PERMISSIONS */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Reseller Master Settings & Permissions</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Configure global reseller privileges, whitelabel options, and tier levels.</p>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Whitelabel Branding</label>
                  <select
                    value={config.allow_whitelabel_branding}
                    onChange={(e) => setConfig({ ...config, allow_whitelabel_branding: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-[#0056cf]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sub-Account Creation</label>
                  <select
                    value={config.allow_subaccount_creation}
                    onChange={(e) => setConfig({ ...config, allow_subaccount_creation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-[#0056cf]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Sub-Accounts per Reseller</label>
                  <input
                    type="number"
                    placeholder="e.g. 50 (leave empty for unlimited)"
                    value={config.max_subaccounts_per_reseller}
                    onChange={(e) => setConfig({ ...config, max_subaccounts_per_reseller: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-[#0056cf]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15.00"
                    value={config.default_commission_rate}
                    onChange={(e) => setConfig({ ...config, default_commission_rate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-[#0056cf]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reseller Tier Levels (Comma Separated)</label>
                <input
                  type="text"
                  value={config.reseller_tier_levels}
                  onChange={(e) => setConfig({ ...config, reseller_tier_levels: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-[#0056cf]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2.5 rounded-xl bg-[#0056cf] hover:bg-blue-700 text-white font-extrabold transition cursor-pointer disabled:opacity-50"
                >
                  {savingConfig ? "Saving..." : "Save Master Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESELLER ORDERS & SUBSCRIPTIONS HISTORY MODAL */}
      {selectedResellerOrdersModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Reseller Account Orders & Subscription History
                </h3>
                <p className="text-xs font-semibold text-[#0056cf] mt-0.5 font-mono">
                  {selectedResellerOrdersModal.reseller_name} ({selectedResellerOrdersModal.email}) • Code: {selectedResellerOrdersModal.reseller_code}
                </p>
              </div>
              <button
                onClick={() => setSelectedResellerOrdersModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Reseller Stats Bar */}
            <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs font-sans">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tier Level</span>
                <span className="font-extrabold text-slate-900">{selectedResellerOrdersModal.tier_level || 'Silver Tier'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sub-Accounts Count</span>
                <span className="font-extrabold text-[#0056cf]">{selectedResellerOrdersModal.subaccount_count || 0} Clients</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Client Orders</span>
                <span className="font-extrabold text-emerald-700">{resellerOrdersList.length} Orders</span>
              </div>
            </div>

            {/* Orders Data Table */}
            {ordersLoading ? (
              <div className="p-8 text-center text-xs font-semibold text-slate-500">
                Loading Reseller Client Orders...
              </div>
            ) : resellerOrdersList.length === 0 ? (
              <div className="p-8 text-center text-xs font-semibold text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                No orders recorded for this reseller partner account yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Client Email</th>
                      <th className="p-3">Domain Name</th>
                      <th className="p-3">Product Plan</th>
                      <th className="p-3">Term</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {resellerOrdersList.map((ord, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-bold text-[#0056cf]">{ord.invoice_number}</td>
                        <td className="p-3 font-semibold text-slate-900">{ord.client_email}</td>
                        <td className="p-3 font-bold text-[#0056cf]">{ord.domain_name || 'N/A'}</td>
                        <td className="p-3 font-extrabold text-slate-900">{ord.product_name}</td>
                        <td className="p-3 font-semibold">{ord.billing_cycle || '1 Month'}</td>
                        <td className="p-3 font-black text-slate-900">₹{parseFloat(ord.amount || 0).toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`font-black text-[10px] px-2 py-0.5 rounded uppercase border ${
                            (ord.status || 'Paid').toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {ord.status || 'Paid'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(ord.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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

    </div>
  );
}
