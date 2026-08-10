import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import DataTable from '../../../components/DataTable';
import {
  getDomainConfig,
  updateDomainConfig,
  getAllDomainRecords,
  createDomainRecord,
  deleteDomainRecord
} from '../../../api/domainMasterApi';
import toast from 'react-hot-toast';

export default function DomainMasterPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'records'

  // General Domain Config State (Clean empty strings so transparent placeholders show)
  const [config, setConfig] = useState({
    allow_register: 'enabled',
    allow_transfer: 'enabled',
    allow_own_domain: 'enabled',
    enable_renewal_orders: 'enabled',
    auto_renew_on_payment: 'enabled',
    auto_renew_requires_product: 'disabled',
    default_auto_renewal: 'enabled',
    create_todo_entries: 'enabled',
    allow_idn_domains: 'disabled',
    grace_redemption_fees: 'disabled',
    default_ns1: '',
    default_ns2: '',
    default_ns3: '',
    default_ns4: '',
    default_ns5: '',
    use_client_details: 'enabled',
    contact_first_name: '',
    contact_last_name: '',
    contact_company_name: '',
    contact_email: '',
    contact_address1: '',
    contact_address2: '',
    contact_city: '',
    contact_state: '',
    contact_postcode: '',
    contact_country: 'United States',
    contact_phone: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // DataTable State for Tab 2
  const [domainRecords, setDomainRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomain, setNewDomain] = useState({
    domain_name: '',
    registrar: 'eNom Registrar',
    registration_date: '',
    expiry_date: '',
    auto_renew: 'enabled',
    status: 'active',
    client_name: ''
  });
  const [creatingDomain, setCreatingDomain] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await getDomainConfig();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setConfig({
          allow_register: data.allow_register || 'enabled',
          allow_transfer: data.allow_transfer || 'enabled',
          allow_own_domain: data.allow_own_domain || 'enabled',
          enable_renewal_orders: data.enable_renewal_orders || 'enabled',
          auto_renew_on_payment: data.auto_renew_on_payment || 'enabled',
          auto_renew_requires_product: data.auto_renew_requires_product || 'disabled',
          default_auto_renewal: data.default_auto_renewal || 'enabled',
          create_todo_entries: data.create_todo_entries || 'enabled',
          allow_idn_domains: data.allow_idn_domains || 'disabled',
          grace_redemption_fees: data.grace_redemption_fees || 'disabled',
          default_ns1: data.default_ns1 || '',
          default_ns2: data.default_ns2 || '',
          default_ns3: data.default_ns3 || '',
          default_ns4: data.default_ns4 || '',
          default_ns5: data.default_ns5 || '',
          use_client_details: data.use_client_details || 'enabled',
          contact_first_name: data.contact_first_name || '',
          contact_last_name: data.contact_last_name || '',
          contact_company_name: data.contact_company_name || '',
          contact_email: data.contact_email || '',
          contact_address1: data.contact_address1 || '',
          contact_address2: data.contact_address2 || '',
          contact_city: data.contact_city || '',
          contact_state: data.contact_state || '',
          contact_postcode: data.contact_postcode || '',
          contact_country: data.contact_country || 'United States',
          contact_phone: data.contact_phone || ''
        });
      }
    } catch (err) {
      console.error("Failed to load domain config", err);
    }
  };

  const fetchRecords = async () => {
    setRecordsLoading(true);
    try {
      const res = await getAllDomainRecords();
      if (res.data?.success) {
        setDomainRecords(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load domain records", err);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchRecords();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateDomainConfig(config);
      toast.success("Domain configuration saved to database!");
    } catch (err) {
      toast.error("Failed to save domain configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateDomain = async (e) => {
    e.preventDefault();
    if (!newDomain.domain_name || !newDomain.client_name) {
      toast.error("Please fill in Domain Name and Client Name.");
      return;
    }
    setCreatingDomain(true);
    try {
      await createDomainRecord(newDomain);
      toast.success("Domain record created successfully!");
      setShowAddModal(false);
      setNewDomain({
        domain_name: '',
        registrar: 'eNom Registrar',
        registration_date: '',
        expiry_date: '',
        auto_renew: 'enabled',
        status: 'active',
        client_name: ''
      });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create domain record.");
    } finally {
      setCreatingDomain(false);
    }
  };

  const handleDeleteDomain = async (id) => {
    if (!window.confirm("Are you sure you want to delete this domain record?")) return;
    try {
      await deleteDomainRecord(id);
      toast.success("Domain record deleted successfully!");
      fetchRecords();
    } catch (err) {
      toast.error("Failed to delete domain record.");
    }
  };

  // DataTable Columns definition for Tab 2
  const domainColumns = [
    { key: 'id', label: 'ID', minWidth: '80px', sortable: true },
    { key: 'domain_name', label: 'Domain Name', minWidth: '220px', sortable: true, render: row => <span className="font-bold font-mono text-blue-900">{row.domain_name}</span> },
    { key: 'client_name', label: 'Client Name', minWidth: '200px', sortable: true },
    { key: 'registrar', label: 'Registrar', minWidth: '160px', sortable: true, render: row => <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700">{row.registrar}</span> },
    { key: 'registration_date', label: 'Reg Date', minWidth: '140px', sortable: true, render: row => row.registration_date ? new Date(row.registration_date).toLocaleDateString() : 'N/A' },
    { key: 'expiry_date', label: 'Expiry Date', minWidth: '140px', sortable: true, render: row => row.expiry_date ? new Date(row.expiry_date).toLocaleDateString() : 'N/A' },
    { key: 'auto_renew', label: 'Auto Renew', minWidth: '130px', sortable: true, render: row => <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.auto_renew === 'enabled' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>{row.auto_renew}</span> },
    {
      key: 'status', label: 'Status', minWidth: '130px', sortable: true, render: row => (
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
          onClick={() => handleDeleteDomain(row.id)}
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
            <h1 className="text-xl font-bold text-slate-900">Domain Master</h1>
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
              🌐 Domain Configuration & Contact Defaults
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'records'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 Registered Domains & Registrars
            </button>
          </div>
        </div>

        {/* TAB 1: DOMAIN CONFIGURATION FORM */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">

            {/* Section 1: Domain Registration Options */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    🌐
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Domain Registration Options</h2>
                    <p className="text-xs text-slate-500">Configure client domain registration, transfer, and ownership options.</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_register === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_register: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Allow Registration</p>
                    <p className="text-[11px] text-slate-500">Allow clients to register domains with you.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_transfer === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_transfer: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Allow Transfer</p>
                    <p className="text-[11px] text-slate-500">Allow clients to transfer a domain to you.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_own_domain === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_own_domain: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Use Own Domain</p>
                    <p className="text-[11px] text-slate-500">Allow clients to use their existing domain.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: Domain Renewals & Auto-Renew Settings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                  🔄
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Domain Renewals & Auto-Renew Rules</h2>
                  <p className="text-xs text-slate-500">Set up automatic renewals, To-Do list triggers, and redemption fee rules.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enable_renewal_orders === 'enabled'}
                    onChange={e => setConfig({ ...config, enable_renewal_orders: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Enable Renewal Orders</p>
                    <p className="text-[11px] text-slate-500">Show Domain Renewals category in cart.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.auto_renew_on_payment === 'enabled'}
                    onChange={e => setConfig({ ...config, auto_renew_on_payment: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Auto Renew on Payment</p>
                    <p className="text-[11px] text-slate-500">Automatically renew domains upon payment.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.auto_renew_requires_product === 'enabled'}
                    onChange={e => setConfig({ ...config, auto_renew_requires_product: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Auto Renew Requires Product</p>
                    <p className="text-[11px] text-slate-500">Only auto renew free domains with active service.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.default_auto_renewal === 'enabled'}
                    onChange={e => setConfig({ ...config, default_auto_renewal: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Default Auto Renewal Setting</p>
                    <p className="text-[11px] text-slate-500">Default invoice auto-generation for expiring domains.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.create_todo_entries === 'enabled'}
                    onChange={e => setConfig({ ...config, create_todo_entries: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Create To-Do List Entries</p>
                    <p className="text-[11px] text-slate-500">Create To-Do tasks for failed domain actions.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_idn_domains === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_idn_domains: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Allow IDN Domains</p>
                    <p className="text-[11px] text-slate-500">Enable Internationalized Domain Names (IDN).</p>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Domain Grace and Redemption Fees</h4>
                    <p className="text-xs text-slate-500">Enable fee collection for domains in grace or redemption period.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.grace_redemption_fees === 'enabled'}
                      onChange={e => setConfig({ ...config, grace_redemption_fees: e.target.checked ? 'enabled' : 'disabled' })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 3: Default Nameservers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Default Nameservers</h2>
                  <p className="text-xs text-slate-500">Primary and secondary nameservers assigned to new domain registrations.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Default Nameserver 1</label>
                  <input
                    type="text"
                    value={config.default_ns1}
                    onChange={e => setConfig({ ...config, default_ns1: e.target.value })}
                    placeholder="ns1.example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Default Nameserver 2</label>
                  <input
                    type="text"
                    value={config.default_ns2}
                    onChange={e => setConfig({ ...config, default_ns2: e.target.value })}
                    placeholder="ns2.example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Default Nameserver 3</label>
                  <input
                    type="text"
                    value={config.default_ns3}
                    onChange={e => setConfig({ ...config, default_ns3: e.target.value })}
                    placeholder="ns3.example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Default Nameserver 4</label>
                  <input
                    type="text"
                    value={config.default_ns4}
                    onChange={e => setConfig({ ...config, default_ns4: e.target.value })}
                    placeholder="ns4.example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Default Nameserver 5</label>
                  <input
                    type="text"
                    value={config.default_ns5}
                    onChange={e => setConfig({ ...config, default_ns5: e.target.value })}
                    placeholder="ns5.example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Default Billing/Admin/Tech Contact Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                    👤
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Default Billing/Admin/Tech Contact Details</h2>
                    <p className="text-xs text-slate-500">Default registrant WHOIS contact information used for domain registrations.</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">Use Client Details</span>
                  <input
                    type="checkbox"
                    checked={config.use_client_details === 'enabled'}
                    onChange={e => setConfig({ ...config, use_client_details: e.target.checked ? 'enabled' : 'disabled' })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">First Name</label>
                  <input
                    type="text"
                    value={config.contact_first_name}
                    onChange={e => setConfig({ ...config, contact_first_name: e.target.value })}
                    placeholder="First Name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    value={config.contact_last_name}
                    onChange={e => setConfig({ ...config, contact_last_name: e.target.value })}
                    placeholder="Last Name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Company Name</label>
                  <input
                    type="text"
                    value={config.contact_company_name}
                    onChange={e => setConfig({ ...config, contact_company_name: e.target.value })}
                    placeholder="Company Name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={config.contact_email}
                    onChange={e => setConfig({ ...config, contact_email: e.target.value })}
                    placeholder="admin@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Address 1</label>
                  <input
                    type="text"
                    value={config.contact_address1}
                    onChange={e => setConfig({ ...config, contact_address1: e.target.value })}
                    placeholder="123 Corporate Blvd"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Address 2</label>
                  <input
                    type="text"
                    value={config.contact_address2}
                    onChange={e => setConfig({ ...config, contact_address2: e.target.value })}
                    placeholder="Suite 400"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={config.contact_city}
                    onChange={e => setConfig({ ...config, contact_city: e.target.value })}
                    placeholder="New York"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">State / Region</label>
                  <input
                    type="text"
                    value={config.contact_state}
                    onChange={e => setConfig({ ...config, contact_state: e.target.value })}
                    placeholder="NY"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Postcode</label>
                  <input
                    type="text"
                    value={config.contact_postcode}
                    onChange={e => setConfig({ ...config, contact_postcode: e.target.value })}
                    placeholder="10001"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Country</label>
                  <select
                    value={config.contact_country}
                    onChange={e => setConfig({ ...config, contact_country: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="United States">United States</option>
                    <option value="India">India</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={config.contact_phone}
                    onChange={e => setConfig({ ...config, contact_phone: e.target.value })}
                    placeholder="+1 201-555-0123"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
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
                {savingConfig ? <><span>⏳</span> Saving Configuration...</> : <><span>💾</span> Save Domain Configuration</>}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: REGISTERED DOMAINS & REGISTRARS HISTORY (DataTable.jsx) */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <DataTable
              tableId="domain_master_records"
              title="Registered Domains & Registrars History"
              data={domainRecords}
              columns={domainColumns}
              loading={recordsLoading}
              searchPlaceholder="Search domains, clients, registrars..."
              actionButton={
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-800 shadow-md"
                >
                  <span>+</span> Register New Domain
                </button>
              }
            />
          </div>
        )}

        {/* Add Domain Record Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Register New Domain Record</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleCreateDomain} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-slate-700">Domain Name *</label>
                    <input
                      type="text"
                      required
                      value={newDomain.domain_name}
                      onChange={e => setNewDomain({ ...newDomain, domain_name: e.target.value })}
                      placeholder="example-domain.com"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={newDomain.client_name}
                      onChange={e => setNewDomain({ ...newDomain, client_name: e.target.value })}
                      placeholder="Acme Corporation"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Registrar</label>
                    <input
                      type="text"
                      value={newDomain.registrar}
                      onChange={e => setNewDomain({ ...newDomain, registrar: e.target.value })}
                      placeholder="eNom Registrar"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Registration Date</label>
                    <input
                      type="date"
                      value={newDomain.registration_date}
                      onChange={e => setNewDomain({ ...newDomain, registration_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Expiry Date</label>
                    <input
                      type="date"
                      value={newDomain.expiry_date}
                      onChange={e => setNewDomain({ ...newDomain, expiry_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Auto Renew</label>
                    <select
                      value={newDomain.auto_renew}
                      onChange={e => setNewDomain({ ...newDomain, auto_renew: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={newDomain.status}
                      onChange={e => setNewDomain({ ...newDomain, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="expired">Expired</option>
                      <option value="transferred">Transferred</option>
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
                    disabled={creatingDomain}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800"
                  >
                    {creatingDomain ? 'Registering...' : 'Register Domain Record'}
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
