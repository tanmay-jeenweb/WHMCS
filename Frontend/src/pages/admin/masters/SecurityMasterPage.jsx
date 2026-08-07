import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import DataTable from '../../../components/DataTable';
import {
  getSecurityConfig,
  updateSecurityConfig,
  getAllSecurityRecords,
  createSecurityRecord,
  deleteSecurityRecord
} from '../../../api/securityMasterApi';
import toast from 'react-hot-toast';

export default function SecurityMasterPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'records'

  // General Security Config State (Clean empty initial values)
  const [config, setConfig] = useState({
    email_verification: 'enabled',
    captcha_form_protection: 'unauthenticated',
    captcha_type: 'default_6char',
    captcha_forms: '',
    auto_gen_password_format: 'letters_numbers_special',
    min_password_strength: '',
    failed_admin_ban_time: '',
    whitelisted_ips: '',
    whitelisted_ip_login_notices: 'disabled',
    disable_admin_password_reset: 'disabled',
    delete_credit_card_data: 'disabled',
    delete_bank_account_data: 'disabled',
    allow_client_paymethod_removal: 'enabled',
    disable_session_ip_check: 'disabled',
    proxy_ip_header: '',
    trusted_proxies: '',
    api_ip_access: '',
    log_api_auth: 'enabled',
    csrf_tokens_general: 'enabled',
    csrf_tokens_domain_checker: 'disabled'
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // DataTable State for Tab 2
  const [securityRecords, setSecurityRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    ip_address: '',
    event_type: 'Failed Admin Login',
    reason: '',
    status: 'banned'
  });
  const [creatingRecord, setCreatingRecord] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await getSecurityConfig();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setConfig({
          email_verification: data.email_verification || 'enabled',
          captcha_form_protection: data.captcha_form_protection || 'unauthenticated',
          captcha_type: data.captcha_type || 'default_6char',
          captcha_forms: data.captcha_forms || '',
          auto_gen_password_format: data.auto_gen_password_format || 'letters_numbers_special',
          min_password_strength: data.min_password_strength || '',
          failed_admin_ban_time: data.failed_admin_ban_time || '',
          whitelisted_ips: data.whitelisted_ips || '',
          whitelisted_ip_login_notices: data.whitelisted_ip_login_notices || 'disabled',
          disable_admin_password_reset: data.disable_admin_password_reset || 'disabled',
          delete_credit_card_data: data.delete_credit_card_data || 'disabled',
          delete_bank_account_data: data.delete_bank_account_data || 'disabled',
          allow_client_paymethod_removal: data.allow_client_paymethod_removal || 'enabled',
          disable_session_ip_check: data.disable_session_ip_check || 'disabled',
          proxy_ip_header: data.proxy_ip_header || '',
          trusted_proxies: data.trusted_proxies || '',
          api_ip_access: data.api_ip_access || '',
          log_api_auth: data.log_api_auth || 'enabled',
          csrf_tokens_general: data.csrf_tokens_general || 'enabled',
          csrf_tokens_domain_checker: data.csrf_tokens_domain_checker || 'disabled'
        });
      }
    } catch (err) {
      console.error("Failed to load security config", err);
    }
  };

  const fetchRecords = async () => {
    setRecordsLoading(true);
    try {
      const res = await getAllSecurityRecords();
      if (res.data?.success) {
        setSecurityRecords(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load security records", err);
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
      await updateSecurityConfig(config);
      toast.success("Security configuration saved to database!");
    } catch (err) {
      toast.error("Failed to save security configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.ip_address || !newRecord.event_type) {
      toast.error("Please fill in IP Address and Event Type.");
      return;
    }
    setCreatingRecord(true);
    try {
      await createSecurityRecord(newRecord);
      toast.success("Security IP record logged successfully!");
      setShowAddModal(false);
      setNewRecord({
        ip_address: '',
        event_type: 'Failed Admin Login',
        reason: '',
        status: 'banned'
      });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create security record.");
    } finally {
      setCreatingRecord(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this security record?")) return;
    try {
      await deleteSecurityRecord(id);
      toast.success("Security record deleted successfully!");
      fetchRecords();
    } catch (err) {
      toast.error("Failed to delete security record.");
    }
  };

  // Helper for CAPTCHA Forms multi-checkbox
  const handleCaptchaFormToggle = (formName) => {
    const currentList = config.captcha_forms ? config.captcha_forms.split(',').map(s => s.trim()).filter(Boolean) : [];
    let updatedList;
    if (currentList.includes(formName)) {
      updatedList = currentList.filter(item => item !== formName);
    } else {
      updatedList = [...currentList, formName];
    }
    setConfig({ ...config, captcha_forms: updatedList.join(',') });
  };

  const isFormCaptchaEnabled = (formName) => {
    if (!config.captcha_forms) return false;
    return config.captcha_forms.split(',').map(s => s.trim()).includes(formName);
  };

  // DataTable Columns definition for Tab 2
  const securityColumns = [
    { key: 'id', label: 'ID', minWidth: '80px', sortable: true },
    { key: 'ip_address', label: 'IP Address', minWidth: '160px', sortable: true, render: row => <span className="font-bold font-mono text-blue-900">{row.ip_address}</span> },
    { key: 'event_type', label: 'Event / Action', minWidth: '200px', sortable: true, render: row => <span className="font-semibold text-slate-900">{row.event_type}</span> },
    { key: 'reason', label: 'Reason / Details', minWidth: '220px', sortable: true, render: row => <span className="text-xs text-slate-600">{row.reason || 'N/A'}</span> },
    { key: 'banned_at', label: 'Banned / Logged At', minWidth: '160px', sortable: true, render: row => row.banned_at ? new Date(row.banned_at).toLocaleString() : 'N/A' },
    {
      key: 'status', label: 'Status', minWidth: '130px', sortable: true, render: row => (
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
          row.status === 'whitelisted'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : row.status === 'banned'
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions', label: 'Actions', minWidth: '110px', sortable: false, render: row => (
        <button
          onClick={() => handleDeleteRecord(row.id)}
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
            <h1 className="text-xl font-bold text-slate-900">Security Master</h1>
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
              🔒 Security Configuration & Protections
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'records'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 Security Audit Logs & Banned IPs
            </button>
          </div>
        </div>

        {/* TAB 1: SECURITY CONFIGURATION FORM */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">

            {/* Section 1: Email Verification & Passwords Policy */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    🔐
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">User Verification & Password Policy</h2>
                    <p className="text-xs text-slate-500">Configure email verification, auto-generated password formats, and minimum strength scores.</p>
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Auto Generated Password Format</label>
                  <select
                    value={config.auto_gen_password_format}
                    onChange={e => setConfig({ ...config, auto_gen_password_format: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="letters_numbers_special">Letters, Numbers & Special Characters (Default)</option>
                    <option value="letters_numbers_only">Letters and Numbers Only</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Character sets for auto-generated passwords.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Minimum User Password Strength</label>
                  <input
                    type="number"
                    value={config.min_password_strength}
                    onChange={e => setConfig({ ...config, min_password_strength: e.target.value })}
                    placeholder="50"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Enter a value between 1 and 100, or 0 to disable.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Failed Admin Login Ban Time (Mins)</label>
                  <input
                    type="number"
                    value={config.failed_admin_ban_time}
                    onChange={e => setConfig({ ...config, failed_admin_ban_time: e.target.value })}
                    placeholder="15"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Time to ban an IP after 3 failed admin login attempts (0 to disable).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.email_verification === 'enabled'}
                    onChange={e => setConfig({ ...config, email_verification: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Email Verification Required</p>
                    <p className="text-[11px] text-slate-500">Request users to confirm their email address on signup or email change.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.disable_admin_password_reset === 'enabled'}
                    onChange={e => setConfig({ ...config, disable_admin_password_reset: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Disable Admin Password Reset</p>
                    <p className="text-[11px] text-slate-500">Disable the forgotten password feature on the admin login page.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: CAPTCHA Form Protection */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                  🤖
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">CAPTCHA Form Protection</h2>
                  <p className="text-xs text-slate-500">Configure CAPTCHA modes, engines, and form target selections.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Captcha Form Protection Mode</label>
                  <select
                    value={config.captcha_form_protection}
                    onChange={e => setConfig({ ...config, captcha_form_protection: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="always_enabled">Always Enabled</option>
                    <option value="unauthenticated">Enabled for Unauthenticated Visitors Only</option>
                    <option value="always_disabled">Always Disabled</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Captcha Type Engine</label>
                  <select
                    value={config.captcha_type}
                    onChange={e => setConfig({ ...config, captcha_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="default_6char">Default (6 Character Verification Code)</option>
                    <option value="recaptcha_v2">Google reCAPTCHA v2</option>
                    <option value="recaptcha_v3">Google reCAPTCHA v3 Invisible</option>
                    <option value="hcaptcha">hCaptcha</option>
                  </select>
                </div>
              </div>

              {/* Captcha Form Targets */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Captcha for Select Forms</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'checkout', label: 'Shopping Cart Checkout' },
                    { id: 'domain_checker', label: 'Domain Checker' },
                    { id: 'register', label: 'Client Registration' },
                    { id: 'contact', label: 'Contact Form' },
                    { id: 'ticket', label: 'Ticket Submission' },
                    { id: 'login', label: 'Login Forms' },
                    { id: 'pwreset', label: 'Password Reset (After multiple attempts)' }
                  ].map(item => (
                    <label key={item.id} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFormCaptchaEnabled(item.id)}
                        onChange={() => handleCaptchaFormToggle(item.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                      />
                      <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Whitelists, Proxies & API Access */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                  🌐
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Whitelisted IPs, Proxies & API Restrictions</h2>
                  <p className="text-xs text-slate-500">Configure trusted proxy headers, IP whitelists, and API access controls.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Whitelisted IPs</label>
                  <textarea
                    rows={3}
                    value={config.whitelisted_ips}
                    onChange={e => setConfig({ ...config, whitelisted_ips: e.target.value })}
                    placeholder="51.21.216.52 (Exempt from login ban rules)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Trusted Proxies</label>
                  <textarea
                    rows={3}
                    value={config.trusted_proxies}
                    onChange={e => setConfig({ ...config, trusted_proxies: e.target.value })}
                    placeholder="IP addresses of trusted proxies that forward traffic"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">API IP Access Restriction</label>
                  <textarea
                    rows={3}
                    value={config.api_ip_access}
                    onChange={e => setConfig({ ...config, api_ip_access: e.target.value })}
                    placeholder="51.21.216.52 (IP addresses allowed to connect to API)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Proxy IP Header</label>
                  <input
                    type="text"
                    value={config.proxy_ip_header}
                    onChange={e => setConfig({ ...config, proxy_ip_header: e.target.value })}
                    placeholder="X_FORWARDED_FOR"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.log_api_auth === 'enabled'}
                      onChange={e => setConfig({ ...config, log_api_auth: e.target.checked ? 'enabled' : 'disabled' })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-900">Log API Authentication in Admin Log</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.whitelisted_ip_login_notices === 'enabled'}
                      onChange={e => setConfig({ ...config, whitelisted_ip_login_notices: e.target.checked ? 'enabled' : 'disabled' })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-900">Send Whitelisted IP Login Failure Notices</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 4: CSRF Tokens & Data Cleanup Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                  🛡️
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">CSRF Token Protections & Session Controls</h2>
                  <p className="text-xs text-slate-500">Configure CSRF tokens, session IP checks, and payment method cleanup.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.csrf_tokens_general === 'enabled'}
                    onChange={e => setConfig({ ...config, csrf_tokens_general: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">CSRF Tokens: General Use</p>
                    <p className="text-[11px] text-slate-500">Enable CSRF tokens for public and client area forms (Highly Recommended).</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.csrf_tokens_domain_checker === 'enabled'}
                    onChange={e => setConfig({ ...config, csrf_tokens_domain_checker: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">CSRF Tokens: Domain Checker</p>
                    <p className="text-[11px] text-slate-500">Enable CSRF tokens specifically for the Domain Checker form.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.disable_session_ip_check === 'enabled'}
                    onChange={e => setConfig({ ...config, disable_session_ip_check: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Disable Session IP Check</p>
                    <p className="text-[11px] text-slate-500">Bypass session IP matching for users with dynamic IP connections.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_client_paymethod_removal === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_client_paymethod_removal: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Allow Client Pay Method Removal</p>
                    <p className="text-[11px] text-slate-500">Allow customers to delete payment methods stored on their account.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingConfig}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-900 text-white hover:bg-blue-800 shadow-md transition-all flex items-center gap-2"
              >
                {savingConfig ? <><span>⏳</span> Saving Configuration...</> : <><span>💾</span> Save Security Configuration</>}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: SECURITY AUDIT LOGS & BANNED IPS (DataTable.jsx) */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <DataTable
              tableId="security_master_records"
              title="Security Audit Logs & Banned IPs History"
              data={securityRecords}
              columns={securityColumns}
              loading={recordsLoading}
              searchPlaceholder="Search security logs by IP address, event, status..."
              actionButton={
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-800 shadow-md"
                >
                  <span>+</span> Ban / Whitelist IP Address
                </button>
              }
            />
          </div>
        )}

        {/* Add Security IP Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Ban / Whitelist IP Address</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleCreateRecord} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">IP Address *</label>
                  <input
                    type="text"
                    required
                    value={newRecord.ip_address}
                    onChange={e => setNewRecord({ ...newRecord, ip_address: e.target.value })}
                    placeholder="192.168.1.100"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Event / Action Type *</label>
                  <select
                    value={newRecord.event_type}
                    onChange={e => setNewRecord({ ...newRecord, event_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                  >
                    <option value="Failed Admin Login">Failed Admin Login</option>
                    <option value="Whitelisted IP Access">Whitelisted IP Access</option>
                    <option value="API Access Blocked">API Access Blocked</option>
                    <option value="CSRF Validation Failure">CSRF Validation Failure</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Reason / Details</label>
                  <input
                    type="text"
                    value={newRecord.reason}
                    onChange={e => setNewRecord({ ...newRecord, reason: e.target.value })}
                    placeholder="Exceeded 3 failed login attempts"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={newRecord.status}
                    onChange={e => setNewRecord({ ...newRecord, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                  >
                    <option value="banned">Banned</option>
                    <option value="whitelisted">Whitelisted</option>
                    <option value="log_only">Log Only</option>
                  </select>
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
                    disabled={creatingRecord}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800"
                  >
                    {creatingRecord ? 'Logging...' : 'Log Security Record'}
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
