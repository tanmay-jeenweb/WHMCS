import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import DataTable from '../../../components/DataTable';
import {
  getResellerConfig,
  updateResellerConfig,
  getAllResellerAccounts,
  createResellerAccount,
  deleteResellerAccount
} from '../../../api/resellerMasterApi';
import toast from 'react-hot-toast';

export default function ResellerMasterPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'records'

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

  // DataTable State for Tab 2
  const [resellerAccounts, setResellerAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReseller, setNewReseller] = useState({
    reseller_code: '',
    reseller_name: '',
    email: '',
    tier_level: 'Silver Tier',
    commission_rate: '',
    subaccount_count: '',
    status: 'active'
  });
  const [creatingReseller, setCreatingReseller] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await getResellerConfig();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setConfig({
          allow_whitelabel_branding: data.allow_whitelabel_branding || 'enabled',
          allow_subaccount_creation: data.allow_subaccount_creation || 'enabled',
          max_subaccounts_per_reseller: data.max_subaccounts_per_reseller || '',
          default_commission_rate: data.default_commission_rate || '',
          allow_custom_nameservers: data.allow_custom_nameservers || 'enabled',
          allow_api_access: data.allow_api_access || 'enabled',
          reseller_tier_levels: data.reseller_tier_levels || 'Silver,Gold,Platinum',
          allowed_reseller_actions: data.allowed_reseller_actions || ''
        });
      }
    } catch (err) {
      console.error("Failed to load reseller config", err);
    }
  };

  const fetchAccounts = async () => {
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

  useEffect(() => {
    fetchConfig();
    fetchAccounts();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateResellerConfig(config);
      toast.success("Reseller configuration saved to database!");
    } catch (err) {
      toast.error("Failed to save reseller configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateReseller = async (e) => {
    e.preventDefault();
    if (!newReseller.reseller_code || !newReseller.reseller_name || !newReseller.email) {
      toast.error("Please fill in Reseller ID/Code, Reseller Name, and Email.");
      return;
    }
    setCreatingReseller(true);
    try {
      await createResellerAccount(newReseller);
      toast.success("Reseller ID account created successfully!");
      setShowAddModal(false);
      setNewReseller({
        reseller_code: '',
        reseller_name: '',
        email: '',
        tier_level: 'Silver Tier',
        commission_rate: '',
        subaccount_count: '',
        status: 'active'
      });
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create reseller account.");
    } finally {
      setCreatingReseller(false);
    }
  };

  const handleDeleteReseller = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reseller account?")) return;
    try {
      await deleteResellerAccount(id);
      toast.success("Reseller account deleted successfully!");
      fetchAccounts();
    } catch (err) {
      toast.error("Failed to delete reseller account.");
    }
  };

  // Helper for reseller action checkboxes
  const handleToggleResellerAction = (actionKey) => {
    const list = config.allowed_reseller_actions ? config.allowed_reseller_actions.split(',').map(s => s.trim()).filter(Boolean) : [];
    const newList = list.includes(actionKey) ? list.filter(i => i !== actionKey) : [...list, actionKey];
    setConfig({ ...config, allowed_reseller_actions: newList.join(',') });
  };

  const isResellerActionEnabled = (actionKey) => {
    if (!config.allowed_reseller_actions) return false;
    return config.allowed_reseller_actions.split(',').map(s => s.trim()).includes(actionKey);
  };

  // DataTable Columns definition for Tab 2
  const resellerColumns = [
    { key: 'id', label: 'ID', minWidth: '80px', sortable: true },
    { key: 'reseller_code', label: 'Reseller ID', minWidth: '160px', sortable: true, render: row => <span className="font-bold font-mono text-blue-900">{row.reseller_code}</span> },
    { key: 'reseller_name', label: 'Reseller Name', minWidth: '200px', sortable: true, render: row => <span className="font-bold text-slate-900">{row.reseller_name}</span> },
    { key: 'email', label: 'Email Address', minWidth: '220px', sortable: true, render: row => <span className="font-mono text-xs text-blue-800">{row.email}</span> },
    { key: 'tier_level', label: 'Tier Level', minWidth: '160px', sortable: true, render: row => <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">{row.tier_level}</span> },
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
      key: 'actions', label: 'Actions', minWidth: '110px', sortable: false, render: row => (
        <button
          onClick={() => handleDeleteReseller(row.id)}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all"
        >
          Delete
        </button>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Universal Header (Navbar) */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Tab Navigation Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')} className="text-xs font-semibold text-slate-500 hover:text-blue-900 flex items-center gap-1">
              <span>←</span> Dashboard
            </button>
            <span className="text-slate-300">|</span>
            <h1 className="text-xl font-bold text-slate-900">Reseller Master</h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-xl border border-slate-300">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'config'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏢 Reseller Configuration & Tier Permissions
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'records'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 Reseller Accounts Directory (IDs)
            </button>
          </div>
        </div>

        {/* TAB 1: RESELLER CONFIGURATION & TIER PERMISSIONS */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">

            {/* Section 1: Tier Rules & Limits */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                    🏢
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Reseller Tier Rules & Limits</h2>
                    <p className="text-xs text-slate-500">Configure subaccount creation limits, commission percentages, and reseller tier levels.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-blue-900 text-white hover:bg-blue-800 shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  {savingConfig ? <><span>⏳</span> Saving...</> : <><span>💾</span> Save Config</>}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Max Sub-Accounts per Reseller</label>
                  <input
                    type="number"
                    value={config.max_subaccounts_per_reseller}
                    onChange={e => setConfig({ ...config, max_subaccounts_per_reseller: e.target.value })}
                    placeholder="100"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Maximum customer accounts a reseller can provision.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Default Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.default_commission_rate}
                    onChange={e => setConfig({ ...config, default_commission_rate: e.target.value })}
                    placeholder="15.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Default reseller commission percentage.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reseller Tier Levels</label>
                  <input
                    type="text"
                    value={config.reseller_tier_levels}
                    onChange={e => setConfig({ ...config, reseller_tier_levels: e.target.value })}
                    placeholder="Silver, Gold, Platinum"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Comma-separated reseller tier level titles.</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_whitelabel_branding === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_whitelabel_branding: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">White-label Branding</p>
                    <p className="text-[11px] text-slate-500">Allow resellers to customize portal logo & domain.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_subaccount_creation === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_subaccount_creation: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Sub-account Creation</p>
                    <p className="text-[11px] text-slate-500">Allow resellers to create sub-customer accounts.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_custom_nameservers === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_custom_nameservers: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Custom Nameservers</p>
                    <p className="text-[11px] text-slate-500">Allow resellers to use custom DNS nameservers.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_api_access === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_api_access: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Reseller API Access</p>
                    <p className="text-[11px] text-slate-500">Enable API keys for automated reseller provisioning.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: What Resellers Can Do */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Reseller Privileges & Specific Actions</h2>
                  <p className="text-xs text-slate-500">Select what specific actions resellers can perform independently.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Permitted Reseller Operational Actions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'create_subaccount', label: 'Create Sub-Accounts' },
                    { id: 'manage_pricing', label: 'Set Custom Client Pricing' },
                    { id: 'custom_dns', label: 'Manage Private DNS Records' },
                    { id: 'payout_request', label: 'Request Commission Payouts' }
                  ].map(item => (
                    <label key={item.id} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isResellerActionEnabled(item.id)}
                        onChange={() => handleToggleResellerAction(item.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                      />
                      <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingConfig}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-900 text-white hover:bg-blue-800 shadow-md transition-all flex items-center gap-2"
              >
                {savingConfig ? <><span>⏳</span> Saving Configuration...</> : <><span>💾</span> Save Reseller Configuration</>}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: RESELLER ACCOUNTS DIRECTORY (DataTable.jsx) */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <DataTable
              tableId="reseller_master_accounts"
              title="Reseller Accounts Directory (IDs)"
              data={resellerAccounts}
              columns={resellerColumns}
              loading={accountsLoading}
              searchPlaceholder="Search resellers by ID, name, email, tier..."
              actionButton={
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-800 shadow-md"
                >
                  <span>+</span> Create New Reseller ID
                </button>
              }
            />
          </div>
        )}

        {/* Add Reseller Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Create New Reseller ID Account</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleCreateReseller} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Reseller ID / Code *</label>
                    <input
                      type="text"
                      required
                      value={newReseller.reseller_code}
                      onChange={e => setNewReseller({ ...newReseller, reseller_code: e.target.value })}
                      placeholder="RSL-5004"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Reseller Name *</label>
                    <input
                      type="text"
                      required
                      value={newReseller.reseller_name}
                      onChange={e => setNewReseller({ ...newReseller, reseller_name: e.target.value })}
                      placeholder="Apex Cloud Reseller"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newReseller.email}
                      onChange={e => setNewReseller({ ...newReseller, email: e.target.value })}
                      placeholder="admin@apexreseller.com"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tier Level</label>
                    <select
                      value={newReseller.tier_level}
                      onChange={e => setNewReseller({ ...newReseller, tier_level: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="Silver Tier">Silver Tier</option>
                      <option value="Gold Tier">Gold Tier</option>
                      <option value="Platinum Tier">Platinum Tier</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newReseller.commission_rate}
                      onChange={e => setNewReseller({ ...newReseller, commission_rate: e.target.value })}
                      placeholder="15.00"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={newReseller.status}
                      onChange={e => setNewReseller({ ...newReseller, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingReseller}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800"
                  >
                    {creatingReseller ? 'Creating...' : 'Create Reseller Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
