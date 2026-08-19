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

  // Settings Modal Toggle
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Customer Details & Order History Modal State
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);

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

  // DataTable State for Customer Accounts Directory
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
      toast.success("Customer configuration saved successfully!");
      setShowConfigModal(false);
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
      toast.success("Customer account created successfully!");
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

  // Helper for portal views checkboxes
  const handleTogglePortalView = (viewKey) => {
    const list = config.allowed_portal_views ? config.allowed_portal_views.split(',').map(s => s.trim()).filter(Boolean) : [];
    const newList = list.includes(viewKey) ? list.filter(i => i !== viewKey) : [...list, viewKey];
    setConfig({ ...config, allowed_portal_views: newList.join(',') });
  };

  const isPortalViewEnabled = (viewKey) => {
    if (!config.allowed_portal_views) return false;
    return config.allowed_portal_views.split(',').map(s => s.trim()).includes(viewKey);
  };

  // Customer Details & Order History Modal State
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const handleOpenCustomerDetails = async (customerRow) => {
    setSelectedCustomerDetails(customerRow);
    setOrdersLoading(true);
    try {
      // 1. Fetch live orders from backend MySQL customer_orders table
      const res = await fetch(`http://localhost:5000/api/orders/user/${encodeURIComponent(customerRow.email)}`);
      const json = await res.json();
      
      let fetchedDbOrders = [];
      if (json.success && json.data) {
        fetchedDbOrders = json.data.map(o => ({
          id: o.invoice_number,
          date: new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          productName: o.product_name,
          groupName: o.group_name || 'Business Emails',
          domain: o.domain_name || 'N/A',
          cycle: o.billing_cycle,
          amount: `$${parseFloat(o.amount).toFixed(2)}`,
          status: o.status
        }));
      }

      // 2. Also check local storage orders STRICTLY matching this customer's email
      const localOrders = JSON.parse(localStorage.getItem("user_order_history") || "[]").filter(
        o => o.clientEmail && o.clientEmail.trim().toLowerCase() === customerRow.email.trim().toLowerCase()
      );

      // 3. Combine unique orders by invoice number (id)
      const combinedMap = new Map();
      fetchedDbOrders.forEach(o => combinedMap.set(o.id, o));
      localOrders.forEach(o => combinedMap.set(o.id, o));

      setCustomerOrders(Array.from(combinedMap.values()));
    } catch (err) {
      console.error("Failed to load customer orders:", err);
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // DataTable Columns definition
  const customerColumns = [
    { key: 'id', label: 'ID', minWidth: '70px', sortable: true },
    { key: 'customer_code', label: 'Customer ID', minWidth: '150px', sortable: true, render: row => <span className="font-bold font-mono text-[#0056cf]">{row.customer_code}</span> },
    { key: 'full_name', label: 'Full Name', minWidth: '180px', sortable: true, render: row => <span className="font-bold text-slate-900">{row.full_name}</span> },
    { key: 'email', label: 'Email Address', minWidth: '200px', sortable: true, render: row => <span className="font-mono text-xs text-blue-700">{row.email}</span> },
    { key: 'company_name', label: 'Company', minWidth: '160px', sortable: true, render: row => <span className="text-xs text-slate-700">{row.company_name || 'N/A'}</span> },
    { key: 'customer_group', label: 'Group', minWidth: '150px', sortable: true, render: row => <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0056cf] border border-blue-100">{row.customer_group}</span> },
    {
      key: 'status', label: 'Status', minWidth: '110px', sortable: true, render: row => (
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
      key: 'actions', label: 'Actions', minWidth: '190px', sortable: false, render: row => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCustomerDetails(row)}
            className="text-xs font-bold text-[#0056cf] hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            title="View Customer Profile & Order History"
          >
            Orders & Details
          </button>
          <button
            onClick={() => handleDeleteCustomer(row.id)}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Universal Header (Navbar) */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Page Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')} className="text-xs font-semibold text-slate-500 hover:text-[#0056cf] flex items-center gap-1 cursor-pointer">
              <span>←</span> Dashboard
            </button>
            <span className="text-slate-300">|</span>
            <h1 className="text-xl font-bold text-slate-900">Customer Master</h1>
          </div>

          {/* Setting Gear Icon Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:text-[#0056cf] hover:border-blue-300 hover:bg-blue-50/50 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              title="Customer Configuration & Action Permissions"
            >
              <span className="text-base leading-none">⚙️</span>
              <span className="hidden sm:inline">Settings & Permissions</span>
            </button>
          </div>
        </div>

        {/* CUSTOMER ACCOUNTS DIRECTORY TABLE */}
        <div className="space-y-6">
          <DataTable
            tableId="customer_master_accounts"
            title="Customer Accounts Directory (IDs)"
            data={customerAccounts}
            columns={customerColumns}
            loading={accountsLoading}
            searchPlaceholder="Search customers by ID, name, email, company..."
            actionButton={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0056cf] hover:bg-blue-700 px-4 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                >
                  <span>+</span> Create New Customer ID
                </button>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-700 hover:text-[#0056cf] hover:bg-blue-50 transition-all shadow-2xs cursor-pointer"
                  title="Customer Configuration & Action Permissions"
                >
                  <span className="text-base">⚙️</span>
                </button>
              </div>
            }
          />
        </div>

        {/* CUSTOMER DETAILS & ORDER HISTORY MODAL */}
        {selectedCustomerDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200/90 my-6 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[88vh]">
              
              {/* Header with WHMCS Gradient */}
              <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:px-8 bg-gradient-to-r from-[#0052cc] to-[#0a2540] text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-extrabold text-xl shadow-inner backdrop-blur-xs">
                    👤
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{selectedCustomerDetails.full_name}</h3>
                    <p className="text-xs text-sky-200 font-mono mt-0.5">
                      ID: {selectedCustomerDetails.customer_code} • {selectedCustomerDetails.email}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCustomerDetails(null)} 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-sm transition-all cursor-pointer border border-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">

                {/* Customer Profile Quick Overview */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Customer Code</span>
                    <span className="text-sm font-bold font-mono text-[#0056cf]">{selectedCustomerDetails.customer_code}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                    <span className="text-sm font-bold font-mono text-slate-800 truncate block">{selectedCustomerDetails.email}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Company / Org</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedCustomerDetails.company_name || 'Individual Client'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Customer Group</span>
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0056cf] border border-blue-100 mt-0.5">
                      {selectedCustomerDetails.customer_group}
                    </span>
                  </div>
                </div>

                {/* Orders & Invoice History Section */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">Purchased Orders & Invoices</h4>
                      <p className="text-xs text-slate-500">Order receipts and active subscriptions placed by this customer account.</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                      ● Active Account
                    </span>
                  </div>

                  {ordersLoading ? (
                    <div className="text-center py-10 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-3 border-[#0056cf] border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-slate-500 text-xs font-semibold">Loading orders for {selectedCustomerDetails.email}...</p>
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                      <p className="text-slate-600 font-semibold text-sm">No Orders Found</p>
                      <p className="text-slate-400 text-xs mt-1">This customer account has not placed any storefront hosting orders yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                            <th className="py-3 px-3">Invoice #</th>
                            <th className="py-3 px-3">Date</th>
                            <th className="py-3 px-3">Product / Plan</th>
                            <th className="py-3 px-3">Domain</th>
                            <th className="py-3 px-3">Billing Cycle</th>
                            <th className="py-3 px-3">Amount</th>
                            <th className="py-3 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {customerOrders.map((ord, i) => (
                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-[#0056cf]">{ord.id}</td>
                              <td className="py-3 px-3 text-slate-500 text-xs">{ord.date}</td>
                              <td className="py-3 px-3 font-semibold text-slate-900">
                                {ord.productName}
                                <span className="block text-[11px] font-normal text-slate-400">{ord.groupName}</span>
                              </td>
                              <td className="py-3 px-3 font-mono text-xs text-slate-600">{ord.domain}</td>
                              <td className="py-3 px-3 text-xs text-slate-600">{ord.cycle}</td>
                              <td className="py-3 px-3 font-extrabold text-slate-900">{ord.amount}</td>
                              <td className="py-3 px-3 text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ● {ord.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:px-8 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setSelectedCustomerDetails(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs"
                >
                  Close Window
                </button>
              </div>

            </div>
          </div>
        )}

        {/* SETTINGS MODAL: CUSTOMER CONFIGURATION & ACTION PERMISSIONS */}
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200/90 my-8 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[85vh]">
              
              {/* Modal Header with WHMCS Gradient */}
              <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:px-8 bg-gradient-to-r from-[#0052cc] to-[#0a2540] text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-lg shadow-inner backdrop-blur-xs">
                    ⚙️
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Customer Configuration & Action Permissions</h3>
                    <p className="text-xs text-sky-200 mt-0.5">Manage client signup rules, default customer groups, and portal action visibility.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowConfigModal(false)} 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-sm transition-all cursor-pointer border border-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
                <form onSubmit={handleSaveConfig} className="space-y-6">

                  {/* Section 1: Signup & Profile Controls */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs">
                    <h4 className="text-xs font-extrabold text-[#0056cf] uppercase tracking-wider">Registration & Group Rules</h4>

                    <div className="space-y-1.5 max-w-md">
                      <label className="text-xs font-bold text-slate-700">Default Customer Group</label>
                      <select
                        value={config.default_customer_group}
                        onChange={e => setConfig({ ...config, default_customer_group: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-[#0056cf] outline-none cursor-pointer"
                      >
                        <option value="Standard Client">Standard Client</option>
                        <option value="VIP Client">VIP Client</option>
                        <option value="Enterprise Client">Enterprise Client</option>
                      </select>
                      <p className="text-[11px] text-slate-500">Group assigned to newly registered customer IDs.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                      <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.allow_self_registration === 'enabled'}
                          onChange={e => setConfig({ ...config, allow_self_registration: e.target.checked ? 'enabled' : 'disabled' })}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0056cf] focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Allow Self-Registration</p>
                          <p className="text-[10px] text-slate-500">Allow new customers to sign up online.</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.require_email_verification === 'enabled'}
                          onChange={e => setConfig({ ...config, require_email_verification: e.target.checked ? 'enabled' : 'disabled' })}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0056cf] focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Require Email Verification</p>
                          <p className="text-[10px] text-slate-500">Customers verify email before access.</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.allow_profile_edit === 'enabled'}
                          onChange={e => setConfig({ ...config, allow_profile_edit: e.target.checked ? 'enabled' : 'disabled' })}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0056cf] focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Allow Profile Edits</p>
                          <p className="text-[10px] text-slate-500">Allow customer profile updates.</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.allow_subcontacts === 'enabled'}
                          onChange={e => setConfig({ ...config, allow_subcontacts: e.target.checked ? 'enabled' : 'disabled' })}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0056cf] focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Allow Sub-Contacts</p>
                          <p className="text-[10px] text-slate-500">Add secondary contacts.</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.allow_cancellation_requests === 'enabled'}
                          onChange={e => setConfig({ ...config, allow_cancellation_requests: e.target.checked ? 'enabled' : 'disabled' })}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0056cf] focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Cancellation Requests</p>
                          <p className="text-[10px] text-slate-500">Allow cancellation requests.</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.allow_credit_card_removal === 'enabled'}
                          onChange={e => setConfig({ ...config, allow_credit_card_removal: e.target.checked ? 'enabled' : 'disabled' })}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0056cf] focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Payment Card Removal</p>
                          <p className="text-[10px] text-slate-500">Allow deleting saved cards.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Section 2: What Customers Can See & Do */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs">
                    <h4 className="text-xs font-extrabold text-[#0056cf] uppercase tracking-wider">Visible Client Portal Navigation Modules</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { id: 'dashboard', label: 'Overview Dashboard' },
                        { id: 'invoices', label: 'Invoices & Payment History' },
                        { id: 'services', label: 'My Active Services & Hosting' },
                        { id: 'domains', label: 'My Registered Domains' },
                        { id: 'tickets', label: 'Support Tickets Desk' },
                        { id: 'affiliates', label: 'Affiliate Commissions Portal' }
                      ].map(item => (
                        <label key={item.id} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPortalViewEnabled(item.id)}
                            onChange={() => handleTogglePortalView(item.id)}
                            className="h-4 w-4 rounded border-slate-300 text-[#0056cf] focus:ring-blue-500"
                          />
                          <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowConfigModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingConfig}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#0056cf] hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {savingConfig ? <><span>⏳</span> Saving...</> : <><span>💾</span> Save Customer Configuration</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Customer Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200/90 my-6 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:px-8 bg-gradient-to-r from-[#0052cc] to-[#0a2540] text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-lg shadow-inner backdrop-blur-xs">
                    👤
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Create New Customer ID Account</h3>
                    <p className="text-xs text-sky-200 mt-0.5">Fill in mandatory customer credentials, target domain, and business contact details.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-sm transition-all cursor-pointer border border-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
                <form onSubmit={handleCreateCustomer} className="space-y-6">

                  {/* Section 1: Mandatory Credentials */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs">
                    <h4 className="text-xs font-extrabold text-[#0056cf] uppercase tracking-wider">Mandatory Credentials & Target Domain</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Customer ID / Code *</label>
                        <input
                          type="text"
                          required
                          value={newCustomer.customer_code}
                          onChange={e => setNewCustomer({ ...newCustomer, customer_code: e.target.value })}
                          placeholder="CUST-1004"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 focus:border-[#0056cf] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Target Business Domain *</label>
                        <input
                          type="text"
                          required
                          value={newCustomer.domain_name}
                          onChange={e => setNewCustomer({ ...newCustomer, domain_name: e.target.value })}
                          placeholder="mycompany.com"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono text-blue-700 focus:border-[#0056cf] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Full Name (Admin Name) *</label>
                        <input
                          type="text"
                          required
                          value={newCustomer.full_name}
                          onChange={e => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
                          placeholder="Jane Doe"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-[#0056cf] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Primary Email (Login ID) *</label>
                        <input
                          type="email"
                          required
                          value={newCustomer.email}
                          onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                          placeholder="jane@company.com"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 focus:border-[#0056cf] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Set Account Password *</label>
                        <input
                          type="text"
                          required
                          value={newCustomer.password}
                          onChange={e => setNewCustomer({ ...newCustomer, password: e.target.value })}
                          placeholder="Set account password"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 focus:border-[#0056cf] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Mobile / Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={newCustomer.phone}
                          onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                          placeholder="+91 98244 66017"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 focus:border-[#0056cf] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Organization & Address Details */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs">
                    <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Organization & Location Details (Optional)</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Company / Organization Name</label>
                        <input
                          type="text"
                          value={newCustomer.company_name}
                          onChange={e => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
                          placeholder="Acme Technologies Pvt Ltd"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-[#0056cf] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Alternative Contact Email</label>
                        <input
                          type="email"
                          value={newCustomer.alt_email}
                          onChange={e => setNewCustomer({ ...newCustomer, alt_email: e.target.value })}
                          placeholder="billing@company.com"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 focus:border-[#0056cf] outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Address Line</label>
                      <input
                        type="text"
                        value={newCustomer.address}
                        onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                        placeholder="123 Business Tower, Tech Park"
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-[#0056cf] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">City</label>
                        <input
                          type="text"
                          value={newCustomer.city}
                          onChange={e => setNewCustomer({ ...newCustomer, city: e.target.value })}
                          placeholder="Mumbai"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-[#0056cf] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">State</label>
                        <input
                          type="text"
                          value={newCustomer.state}
                          onChange={e => setNewCustomer({ ...newCustomer, state: e.target.value })}
                          placeholder="Maharashtra"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-[#0056cf] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">ZIP / PIN Code</label>
                        <input
                          type="text"
                          value={newCustomer.zip}
                          onChange={e => setNewCustomer({ ...newCustomer, zip: e.target.value })}
                          placeholder="400001"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono text-slate-900 focus:border-[#0056cf] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Licensing & Group Settings */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs">
                    <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Licensing & Group Settings</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Customer Group</label>
                        <select
                          value={newCustomer.customer_group}
                          onChange={e => setNewCustomer({ ...newCustomer, customer_group: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-[#0056cf] outline-none cursor-pointer"
                        >
                          <option value="Standard Client">Standard Client</option>
                          <option value="VIP Client">VIP Client</option>
                          <option value="Enterprise Client">Enterprise Client</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Account Status</label>
                        <select
                          value={newCustomer.status}
                          onChange={e => setNewCustomer({ ...newCustomer, status: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-[#0056cf] outline-none cursor-pointer"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Mailbox Seats Quantity</label>
                        <input
                          type="number"
                          value={newCustomer.user_count}
                          onChange={e => setNewCustomer({ ...newCustomer, user_count: e.target.value })}
                          placeholder="5"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 focus:border-[#0056cf] outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Special Notes & Requirements</label>
                      <textarea
                        rows={2}
                        value={newCustomer.notes}
                        onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                        placeholder="Additional setup notes, migration preferences, or custom requirements..."
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-[#0056cf] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingCustomer}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#0056cf] hover:bg-blue-700 text-white cursor-pointer shadow-md transition-all flex items-center gap-2"
                    >
                      {creatingCustomer ? <><span>⏳</span> Creating...</> : <><span>👤</span> Create Customer ID Account</>}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
