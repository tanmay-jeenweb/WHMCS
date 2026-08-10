import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import DataTable from '../../../components/DataTable';
import {
  getCustomerConfig,
  updateCustomerConfig,
  getAllCustomerAccounts,
  createCustomerAccount,
  deleteCustomerAccount
} from '../../../api/customerMasterApi';
import toast from 'react-hot-toast';

export default function CustomerMasterPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'records'

  // General Customer Config State
  const [config, setConfig] = useState({
    allow_self_registration: 'enabled',
    require_email_verification: 'enabled',
    allow_profile_edit: 'enabled',
    allow_subcontacts: 'enabled',
    allow_cancellation_requests: 'enabled',
    allow_credit_card_removal: 'enabled',
    default_customer_group: 'Standard Client',
    allowed_portal_views: 'dashboard,invoices,services,domains,tickets',
    allowed_customer_actions: 'order,pay,ticket_open,domain_renew'
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // DataTable State for Tab 2
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customer_code: '',
    full_name: '',
    email: '',
    company_name: '',
    customer_group: 'Standard Client',
    status: 'active'
  });
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await getCustomerConfig();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setConfig({
          allow_self_registration: data.allow_self_registration || 'enabled',
          require_email_verification: data.require_email_verification || 'enabled',
          allow_profile_edit: data.allow_profile_edit || 'enabled',
          allow_subcontacts: data.allow_subcontacts || 'enabled',
          allow_cancellation_requests: data.allow_cancellation_requests || 'enabled',
          allow_credit_card_removal: data.allow_credit_card_removal || 'enabled',
          default_customer_group: data.default_customer_group || 'Standard Client',
          allowed_portal_views: data.allowed_portal_views || '',
          allowed_customer_actions: data.allowed_customer_actions || ''
        });
      }
    } catch (err) {
      console.error("Failed to load customer config", err);
    }
  };

  const fetchAccounts = async () => {
    setAccountsLoading(true);
    try {
      const res = await getAllCustomerAccounts();
      if (res.data?.success) {
        setCustomerAccounts(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load customer accounts", err);
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
      await updateCustomerConfig(config);
      toast.success("Customer configuration saved to database!");
    } catch (err) {
      toast.error("Failed to save customer configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.customer_code || !newCustomer.full_name || !newCustomer.email) {
      toast.error("Please fill in Customer ID/Code, Full Name, and Email.");
      return;
    }
    setCreatingCustomer(true);
    try {
      await createCustomerAccount(newCustomer);
      toast.success("Customer ID account created successfully!");
      setShowAddModal(false);
      setNewCustomer({
        customer_code: '',
        full_name: '',
        email: '',
        company_name: '',
        customer_group: 'Standard Client',
        status: 'active'
      });
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create customer account.");
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer account?")) return;
    try {
      await deleteCustomerAccount(id);
      toast.success("Customer account deleted successfully!");
      fetchAccounts();
    } catch (err) {
      toast.error("Failed to delete customer account.");
    }
  };

  // Helper for portal views & action checkboxes
  const handleTogglePortalView = (viewKey) => {
    const list = config.allowed_portal_views ? config.allowed_portal_views.split(',').map(s => s.trim()).filter(Boolean) : [];
    const newList = list.includes(viewKey) ? list.filter(i => i !== viewKey) : [...list, viewKey];
    setConfig({ ...config, allowed_portal_views: newList.join(',') });
  };

  const isPortalViewEnabled = (viewKey) => {
    if (!config.allowed_portal_views) return false;
    return config.allowed_portal_views.split(',').map(s => s.trim()).includes(viewKey);
  };

  // DataTable Columns definition for Tab 2
  const customerColumns = [
    { key: 'id', label: 'ID', minWidth: '80px', sortable: true },
    { key: 'customer_code', label: 'Customer ID', minWidth: '160px', sortable: true, render: row => <span className="font-bold font-mono text-blue-900">{row.customer_code}</span> },
    { key: 'full_name', label: 'Full Name', minWidth: '200px', sortable: true, render: row => <span className="font-bold text-slate-900">{row.full_name}</span> },
    { key: 'email', label: 'Email Address', minWidth: '220px', sortable: true, render: row => <span className="font-mono text-xs text-blue-800">{row.email}</span> },
    { key: 'company_name', label: 'Company', minWidth: '180px', sortable: true, render: row => <span className="text-xs text-slate-700">{row.company_name || 'N/A'}</span> },
    { key: 'customer_group', label: 'Group', minWidth: '160px', sortable: true, render: row => <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">{row.customer_group}</span> },
    {
      key: 'status', label: 'Status', minWidth: '120px', sortable: true, render: row => (
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
          row.status === 'active'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : row.status === 'inactive'
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
          onClick={() => handleDeleteCustomer(row.id)}
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
            <h1 className="text-xl font-bold text-slate-900">Customer Master</h1>
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
              👤 Customer Configuration & Action Permissions
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'records'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 Customer Accounts Directory (IDs)
            </button>
          </div>
        </div>

        {/* TAB 1: CUSTOMER CONFIGURATION & ACTION PERMISSIONS */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">

            {/* Section 1: Signup & Profile Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    👤
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Customer Registration & Profile Rules</h2>
                    <p className="text-xs text-slate-500">Configure client registration toggles, default customer groups, and profile editing permissions.</p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Default Customer Group</label>
                  <select
                    value={config.default_customer_group}
                    onChange={e => setConfig({ ...config, default_customer_group: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="Standard Client">Standard Client</option>
                    <option value="VIP Client">VIP Client</option>
                    <option value="Enterprise Client">Enterprise Client</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Group assigned to newly registered customer IDs.</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_self_registration === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_self_registration: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Allow Self-Registration</p>
                    <p className="text-[11px] text-slate-500">Allow new customers to sign up online.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.require_email_verification === 'enabled'}
                    onChange={e => setConfig({ ...config, require_email_verification: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Require Email Verification</p>
                    <p className="text-[11px] text-slate-500">Customers must verify email before full access.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_profile_edit === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_profile_edit: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Allow Profile Edits</p>
                    <p className="text-[11px] text-slate-500">Allow customers to change name, address, and phone.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_subcontacts === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_subcontacts: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Allow Sub-Contacts</p>
                    <p className="text-[11px] text-slate-500">Customers can add secondary billing/tech contacts.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_cancellation_requests === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_cancellation_requests: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Cancellation Requests</p>
                    <p className="text-[11px] text-slate-500">Customers can request service cancellations.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_credit_card_removal === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_credit_card_removal: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Payment Method Removal</p>
                    <p className="text-[11px] text-slate-500">Customers can delete saved credit cards.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: What Customers Can See & Do */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                  👁️
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Customer Portal Views & Actions Visibility</h2>
                  <p className="text-xs text-slate-500">Select what sections and actions customers can perform individually in their member area.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Visible Client Portal Navigation Modules</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'dashboard', label: 'Overview Dashboard' },
                    { id: 'invoices', label: 'Invoices & Payment History' },
                    { id: 'services', label: 'My Active Services & Hosting' },
                    { id: 'domains', label: 'My Registered Domains' },
                    { id: 'tickets', label: 'Support Tickets Desk' },
                    { id: 'affiliates', label: 'Affiliate Commissions Portal' }
                  ].map(item => (
                    <label key={item.id} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPortalViewEnabled(item.id)}
                        onChange={() => handleTogglePortalView(item.id)}
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
                {savingConfig ? <><span>⏳</span> Saving Configuration...</> : <><span>💾</span> Save Customer Configuration</>}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: CUSTOMER ACCOUNTS DIRECTORY (DataTable.jsx) */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <DataTable
              tableId="customer_master_accounts"
              title="Customer Accounts Directory (IDs)"
              data={customerAccounts}
              columns={customerColumns}
              loading={accountsLoading}
              searchPlaceholder="Search customers by ID, name, email, company..."
              actionButton={
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-800 shadow-md"
                >
                  <span>+</span> Create New Customer ID
                </button>
              }
            />
          </div>
        )}

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Create New Customer ID Account</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Customer ID / Code *</label>
                    <input
                      type="text"
                      required
                      value={newCustomer.customer_code}
                      onChange={e => setNewCustomer({ ...newCustomer, customer_code: e.target.value })}
                      placeholder="CUST-1004"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newCustomer.full_name}
                      onChange={e => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
                      placeholder="Jane Doe"
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
                      value={newCustomer.email}
                      onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Company Name</label>
                    <input
                      type="text"
                      value={newCustomer.company_name}
                      onChange={e => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
                      placeholder="Apex Digital Systems"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Customer Group</label>
                    <select
                      value={newCustomer.customer_group}
                      onChange={e => setNewCustomer({ ...newCustomer, customer_group: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="Standard Client">Standard Client</option>
                      <option value="VIP Client">VIP Client</option>
                      <option value="Enterprise Client">Enterprise Client</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={newCustomer.status}
                      onChange={e => setNewCustomer({ ...newCustomer, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="closed">Closed</option>
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
                    disabled={creatingCustomer}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800"
                  >
                    {creatingCustomer ? 'Creating...' : 'Create Customer Account'}
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
