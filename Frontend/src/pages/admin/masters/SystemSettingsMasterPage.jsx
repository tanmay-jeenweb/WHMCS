import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import DataTable from '../../../components/DataTable';
import {
  getGeneralConfig,
  updateGeneralConfig,
  uploadSystemLogo,
  getAllBatches,
  createBatch,
  deleteBatch
} from '../../../api/systemSettingsApi';
import toast from 'react-hot-toast';

export default function SystemSettingsMasterPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'records'
  const [recordsSubTab, setRecordsSubTab] = useState('config_table'); // 'config_table' or 'batches_table'

  // General Config Form State (Clean empty initial values)
  const [config, setConfig] = useState({
    company_name: '',
    email_address: '',
    domain_url: '',
    logo_url: '',
    pay_to_text: '',
    system_url: '',
    system_theme: 'Twenty-One',
    limit_activity_log: '',
    records_per_page: '',
    maintenance_mode: 'disabled',
    maintenance_mode_message: '',
    maintenance_mode_redirect: '',
    friendly_urls: 'enabled'
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // DataTable State for Tab 2
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    batch_name: '',
    migration_path: '',
    migration_endpoint: '',
    user_count: '',
    status: 'scheduled'
  });
  const [creatingBatch, setCreatingBatch] = useState(false);

  const fetchGeneral = async () => {
    try {
      const res = await getGeneralConfig();
      if (res.data?.success && res.data.data) {
        const dbData = res.data.data;
        const isDefaultCompany = dbData.company_name === 'JEEN WEB TECHNOLOGISTS PRIVATE LIMITED';
        const isDefaultEmail = dbData.email_address === 'changeme@example.com';
        const isDefaultDomain = dbData.domain_url === 'http://www.yourdomain.com/';
        const isDefaultSystemUrl = dbData.system_url === 'http://localhost:5000' || dbData.system_url === 'https://8eb806de-74b5-4eff-ad59-147bf43e9700.package.webpros.cloud';
        const isDefaultPayTo = dbData.pay_to_text?.includes('Jeenweb Technologists');

        setConfig({
          company_name: isDefaultCompany ? '' : (dbData.company_name || ''),
          email_address: isDefaultEmail ? '' : (dbData.email_address || ''),
          domain_url: isDefaultDomain ? '' : (dbData.domain_url || ''),
          logo_url: dbData.logo_url || '',
          pay_to_text: isDefaultPayTo ? '' : (dbData.pay_to_text || ''),
          system_url: isDefaultSystemUrl ? '' : (dbData.system_url || ''),
          system_theme: dbData.system_theme || 'Twenty-One',
          limit_activity_log: dbData.limit_activity_log || '',
          records_per_page: dbData.records_per_page || '',
          maintenance_mode: dbData.maintenance_mode || 'disabled',
          maintenance_mode_message: dbData.maintenance_mode_message || '',
          maintenance_mode_redirect: dbData.maintenance_mode_redirect || '',
          friendly_urls: dbData.friendly_urls || 'enabled'
        });
      }
    } catch (err) {
      console.error("Failed to load general config", err);
    }
  };

  const fetchBatchesData = async () => {
    setBatchesLoading(true);
    try {
      const res = await getAllBatches();
      if (res.data?.success) {
        setBatches(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load batches", err);
    } finally {
      setBatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneral();
    fetchBatchesData();
  }, []);

  const handleSaveGeneralConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateGeneralConfig(config);
      toast.success("System configuration saved to database!");
    } catch (err) {
      toast.error("Failed to save system configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  // Handle Logo File Upload from Device
  const handleLogoFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file (.png, .jpg, .svg, .webp).");
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    setUploadingLogo(true);
    try {
      const res = await uploadSystemLogo(formData);
      if (res.data?.success && res.data.url) {
        setConfig(prev => ({ ...prev, logo_url: res.data.url }));
        toast.success("Logo uploaded from device successfully!");
      }
    } catch (err) {
      console.error("Logo upload error", err);
      toast.error("Failed to upload logo image.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!newBatch.batch_name || !newBatch.migration_path) {
      toast.error("Please fill in Batch Name and Migration Path.");
      return;
    }
    setCreatingBatch(true);
    try {
      await createBatch(newBatch);
      toast.success("Migration batch created successfully!");
      setShowAddModal(false);
      setNewBatch({
        batch_name: '',
        migration_path: '',
        migration_endpoint: '',
        user_count: '',
        status: 'scheduled'
      });
      fetchBatchesData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create migration batch.");
    } finally {
      setCreatingBatch(false);
    }
  };

  const handleDeleteBatch = async (id) => {
    if (!window.confirm("Are you sure you want to delete this migration batch?")) return;
    try {
      await deleteBatch(id);
      toast.success("Migration batch deleted successfully!");
      fetchBatchesData();
    } catch (err) {
      toast.error("Failed to delete migration batch.");
    }
  };

  // Construct Saved Settings Rows array for DataTable
  const savedSettingsRows = [
    { id: 1, field_name: 'Company Name', category: 'Branding', value: config.company_name || '(Not Set)', type: 'Text' },
    { id: 2, field_name: 'Email Address', category: 'Branding', value: config.email_address || '(Not Set)', type: 'Email' },
    { id: 3, field_name: 'Domain URL', category: 'Branding', value: config.domain_url || '(Not Set)', type: 'URL' },
    { id: 4, field_name: 'Logo Image URL', category: 'Branding', value: config.logo_url || '(Not Set)', type: 'Image Asset' },
    { id: 5, field_name: 'WHMCS System URL', category: 'URLs & Theme', value: config.system_url || '(Not Set)', type: 'URL' },
    { id: 6, field_name: 'System Theme', category: 'URLs & Theme', value: config.system_theme || 'Twenty-One', type: 'Theme Dropdown' },
    { id: 7, field_name: 'Friendly URLs Mode', category: 'URLs & Theme', value: config.friendly_urls || 'enabled', type: 'SEO Mode' },
    { id: 8, field_name: 'Limit Activity Log Entries', category: 'Pagination & Logs', value: config.limit_activity_log || '10000', type: 'Integer' },
    { id: 9, field_name: 'Records to Display per Page', category: 'Pagination & Logs', value: config.records_per_page || '50', type: 'Integer' },
    { id: 10, field_name: 'Pay To Text (Invoice)', category: 'Invoice & Maintenance', value: config.pay_to_text || '(Not Set)', type: 'Text Block' },
    { id: 11, field_name: 'Maintenance Mode Status', category: 'Invoice & Maintenance', value: config.maintenance_mode || 'disabled', type: 'Toggle Switch' },
    { id: 12, field_name: 'Maintenance Mode Message', category: 'Invoice & Maintenance', value: config.maintenance_mode_message || '(Not Set)', type: 'Text Block' },
    { id: 13, field_name: 'Maintenance Redirect URL', category: 'Invoice & Maintenance', value: config.maintenance_mode_redirect || '(Not Set)', type: 'URL' }
  ];

  const configTableColumns = [
    { key: 'id', label: 'ID', minWidth: '70px', sortable: true },
    { key: 'field_name', label: 'Field Name', minWidth: '220px', sortable: true, render: row => <span className="font-bold text-slate-900">{row.field_name}</span> },
    { key: 'category', label: 'Category', minWidth: '180px', sortable: true, render: row => <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-100 text-blue-700">{row.category}</span> },
    {
      key: 'value', label: 'Saved Value in MySQL', minWidth: '300px', sortable: true, render: row => {
        const valStr = String(row.value || '');
        if (row.field_name === 'Logo Image URL' && valStr.startsWith('http')) {
          return (
            <div className="flex items-center gap-2">
              <img src={valStr} alt="Logo" className="w-8 h-8 object-contain rounded border border-slate-200 bg-white p-0.5" />
              <span className="font-mono text-xs text-blue-900 truncate max-w-xs">{valStr}</span>
            </div>
          );
        }
        return (
          <span className={`font-mono text-xs ${valStr.includes('(Not Set)') ? 'text-slate-400 italic' : 'text-slate-800'}`}>
            {valStr}
          </span>
        );
      }
    },
    { key: 'type', label: 'Field Type', minWidth: '140px', sortable: true, render: row => <span className="text-xs text-slate-500">{row.type}</span> },
    {
      key: 'actions', label: 'Action', minWidth: '100px', sortable: false, render: () => (
        <button
          onClick={() => setActiveTab('config')}
          className="text-xs font-bold text-blue-900 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-all"
        >
          Edit Field
        </button>
      )
    }
  ];

  // DataTable Columns definition for Migration Batches
  const batchColumns = [
    { key: 'id', label: 'ID', minWidth: '80px', sortable: true },
    { key: 'batch_name', label: 'Batch Name', minWidth: '220px', sortable: true, render: row => <span className="font-bold text-blue-900">{row.batch_name}</span> },
    { key: 'migration_path', label: 'Migration Path', minWidth: '220px', sortable: true, render: row => <span className="font-mono text-xs text-slate-700">{row.migration_path}</span> },
    { key: 'migration_endpoint', label: 'Target Endpoint', minWidth: '240px', sortable: true, render: row => <span className="font-mono text-xs text-slate-600 truncate max-w-xs">{row.migration_endpoint || 'N/A'}</span> },
    { key: 'user_count', label: 'Users', minWidth: '100px', sortable: true, render: row => <span className="font-mono font-bold text-slate-800">{row.user_count}</span> },
    {
      key: 'status', label: 'Status', minWidth: '130px', sortable: true, render: row => (
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
          row.status === 'completed'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : row.status === 'scheduled'
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
          onClick={() => handleDeleteBatch(row.id)}
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
            <h1 className="text-xl font-bold text-slate-900">System Settings Master</h1>
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
              ⚙️ General Configuration
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'records'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 System Data & Records History
            </button>
          </div>
        </div>

        {/* TAB 1: 13-FIELD GENERAL CONFIGURATION FORM */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveGeneralConfig} className="space-y-6">

            {/* Section 1: Organization & Branding */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    🏢
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Organization & Branding</h2>
                    <p className="text-xs text-slate-500">Set up your company identity, sender email, domain, and logo image.</p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-blue-900 text-white hover:bg-blue-800 shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  {savingConfig ? <><span>⏳</span> Saving...</> : <><span>💾</span> Save Changes</>}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    value={config.company_name}
                    onChange={e => setConfig({ ...config, company_name: e.target.value })}
                    placeholder="Your Company Name as you want it to appear throughout the system"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-500">Appears on invoices, client portal headers, and email communications.</p>
                </div>

                {/* 2. Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={config.email_address}
                    onChange={e => setConfig({ ...config, email_address: e.target.value })}
                    placeholder="changeme@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-500">The default sender address used for system emails.</p>
                </div>

                {/* 3. Domain */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Domain URL</label>
                  <input
                    type="text"
                    value={config.domain_url}
                    onChange={e => setConfig({ ...config, domain_url: e.target.value })}
                    placeholder="http://www.yourdomain.com/"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-500">The URL to your main corporate website homepage.</p>
                </div>

                {/* 4. Logo File Picker & Image Upload from Device */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">System Logo Image (Select from Device)</label>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 hover:border-blue-500 hover:bg-blue-50/20 transition-all">
                    <div className="w-24 h-24 rounded-xl border border-slate-200 bg-white flex items-center justify-center p-2 shadow-sm shrink-0 relative overflow-hidden group">
                      {config.logo_url ? (
                        <img
                          src={config.logo_url}
                          alt="System Logo Preview"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-2xl text-slate-300">🖼️</span>
                      )}
                      {config.logo_url && (
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, logo_url: '' })}
                          title="Remove Logo"
                          className="absolute inset-0 bg-slate-900/60 text-white font-bold text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 shadow-sm transition-all shrink-0">
                          <span>📁</span>
                          {uploadingLogo ? 'Uploading from Device...' : 'Choose Image from Device'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            disabled={uploadingLogo}
                            className="hidden"
                          />
                        </label>
                        <span className="text-xs text-slate-400 font-semibold">PNG, JPG, SVG, WEBP (Max 10MB)</span>
                      </div>

                      <input
                        type="text"
                        value={config.logo_url}
                        onChange={e => setConfig({ ...config, logo_url: e.target.value })}
                        placeholder="http://localhost:5000/uploads/logo.png or select file from system"
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 placeholder:italic focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Section 2: System URLs & Theme Settings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                  🌐
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">System URLs & Theme</h2>
                  <p className="text-xs text-slate-500">Configure system endpoint URLs, active themes, and SEO URL rewrites.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 5. WHMCS System URL */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">WHMCS System URL</label>
                  <input
                    type="text"
                    value={config.system_url}
                    onChange={e => setConfig({ ...config, system_url: e.target.value })}
                    placeholder="https://8eb806de-74b5-4eff-ad59-147bf43e9700.package.webpros.cloud"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-500">The URL to your installation (e.g., https://www.example.com/members/).</p>
                </div>

                {/* 6. System Theme */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">System Theme</label>
                  <select
                    value={config.system_theme}
                    onChange={e => setConfig({ ...config, system_theme: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all cursor-pointer"
                  >
                    <option value="Twenty-One">Twenty-One (Default)</option>
                    <option value="Six">Six (Classic)</option>
                    <option value="Blend">Blend Admin Theme</option>
                    <option value="Jeenweb-Dark">Jeenweb Dark Mode</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Active template theme for client area.</p>
                </div>

                {/* 9. Friendly URLs */}
                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Friendly URLs Mode</label>
                  <select
                    value={config.friendly_urls}
                    onChange={e => setConfig({ ...config, friendly_urls: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all cursor-pointer"
                  >
                    <option value="enabled">Full Rewrite (Recommended - Clean SEO URLs)</option>
                    <option value="basic">Basic Rewrite (index.php/path)</option>
                    <option value="disabled">Disabled (Standard URL parameters)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Configures clean search engine friendly (SEF) URL rewrites.</p>
                </div>
              </div>
            </div>

            {/* Section 3: Performance, Logs & Display Limits */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                  ⚙️
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Logs & Display Pagination</h2>
                  <p className="text-xs text-slate-500">Manage data retention limits and page record sizes.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 7. Limit Activity Log */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Limit Activity Log Entries</label>
                  <input
                    type="number"
                    value={config.limit_activity_log}
                    onChange={e => setConfig({ ...config, limit_activity_log: e.target.value })}
                    placeholder="10000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-500">Maximum number of System Activity Log entries to retain in database.</p>
                </div>

                {/* 8. Records to Display per Page */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Records to Display per Page</label>
                  <input
                    type="number"
                    value={config.records_per_page}
                    onChange={e => setConfig({ ...config, records_per_page: e.target.value })}
                    placeholder="50"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-500">Default pagination size for admin data tables.</p>
                </div>
              </div>
            </div>

            {/* Section 4: Invoice Details & Maintenance Mode */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                  🧾
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Invoice Pay-To Details & Maintenance Controls</h2>
                  <p className="text-xs text-slate-500">Configure billing address details and system maintenance mode toggles.</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* 11. Pay To Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pay To Text (Invoice Address)</label>
                  <textarea
                    rows={3}
                    value={config.pay_to_text}
                    onChange={e => setConfig({ ...config, pay_to_text: e.target.value })}
                    placeholder="Address goes here... This text is displayed on the invoice as the Pay To details"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-500">This address block is printed on client invoices.</p>
                </div>

                {/* 10. Maintenance Mode Toggle */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Maintenance Mode</h4>
                    <p className="text-xs text-slate-500">Enable maintenance mode to temporarily block client portal access during updates.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.maintenance_mode === 'enabled'}
                      onChange={e => setConfig({ ...config, maintenance_mode: e.target.checked ? 'enabled' : 'disabled' })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
                  </label>
                </div>

                {/* Maintenance Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  {/* 12. Maintenance Mode Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Maintenance Mode Message</label>
                    <textarea
                      rows={2}
                      value={config.maintenance_mode_message}
                      onChange={e => setConfig({ ...config, maintenance_mode_message: e.target.value })}
                      placeholder="We are currently performing maintenance and will be back shortly."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                    />
                    <p className="text-[11px] text-slate-500">Message shown to clients when maintenance mode is active.</p>
                  </div>

                  {/* 13. Maintenance Mode Redirect URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Redirect URL (Optional)</label>
                    <input
                      type="text"
                      value={config.maintenance_mode_redirect}
                      onChange={e => setConfig({ ...config, maintenance_mode_redirect: e.target.value })}
                      placeholder="If specified, redirects client area visitors to this URL when Maintenance Mode is enabled"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                    />
                    <p className="text-[11px] text-slate-500">External URL to redirect visitors to when maintenance is enabled.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Form Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingConfig}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-900 text-white hover:bg-blue-800 shadow-md transition-all flex items-center gap-2"
              >
                {savingConfig ? (
                  <><span>⏳</span> Saving Changes...</>
                ) : (
                  <><span>💾</span> Save Configuration Changes</>
                )}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: SYSTEM DATA & RECORDS HISTORY */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            
            {/* View Selector Buttons */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setRecordsSubTab('config_table')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  recordsSubTab === 'config_table'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                ⚙️ Live Saved Configuration Values (DataTable)
              </button>
              <button
                onClick={() => setRecordsSubTab('batches_table')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  recordsSubTab === 'batches_table'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                📦 Migration Batches & System History
              </button>
            </div>

            {/* VIEW 1: LIVE SAVED CONFIGURATIONS DATATABLE */}
            {recordsSubTab === 'config_table' && (
              <DataTable
                tableId="system_settings_live_saved_config"
                title="Live Saved System Configurations in MySQL"
                data={savedSettingsRows}
                columns={configTableColumns}
                searchPlaceholder="Search saved configuration fields, categories, values..."
              />
            )}

            {/* VIEW 2: MIGRATION BATCHES HISTORY DATATABLE */}
            {recordsSubTab === 'batches_table' && (
              <DataTable
                tableId="system_settings_batches_history"
                title="Migration Batches & System History"
                data={batches}
                columns={batchColumns}
                loading={batchesLoading}
                searchPlaceholder="Search migration batches..."
                actionButton={
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-800 shadow-md"
                  >
                    <span>+</span> Add Migration Batch
                  </button>
                }
              />
            )}
          </div>
        )}

        {/* Add Batch Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Add Migration Batch</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Batch Name *</label>
                  <input
                    type="text"
                    required
                    value={newBatch.batch_name}
                    onChange={e => setNewBatch({ ...newBatch, batch_name: e.target.value })}
                    placeholder="WHMCS-Migration-Batch-02"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Migration Path *</label>
                  <input
                    type="text"
                    required
                    value={newBatch.migration_path}
                    onChange={e => setNewBatch({ ...newBatch, migration_path: e.target.value })}
                    placeholder="C:\whmcs\data\imports"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Endpoint</label>
                  <input
                    type="text"
                    value={newBatch.migration_endpoint}
                    onChange={e => setNewBatch({ ...newBatch, migration_endpoint: e.target.value })}
                    placeholder="https://api.jeenweb.cloud/v1/sync"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">User Count</label>
                    <input
                      type="number"
                      value={newBatch.user_count}
                      onChange={e => setNewBatch({ ...newBatch, user_count: e.target.value })}
                      placeholder="25"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={newBatch.status}
                      onChange={e => setNewBatch({ ...newBatch, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
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
                    disabled={creatingBatch}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800"
                  >
                    {creatingBatch ? 'Creating...' : 'Create Batch'}
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
