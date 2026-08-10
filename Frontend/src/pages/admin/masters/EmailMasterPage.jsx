import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import DataTable from '../../../components/DataTable';
import {
  getEmailConfig,
  updateEmailConfig,
  getAllEmailRecords,
  createEmailRecord,
  deleteEmailRecord
} from '../../../api/emailMasterApi';
import toast from 'react-hot-toast';

export default function EmailMasterPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'records'

  // General Email Config State (Clean empty initial values)
  const [config, setConfig] = useState({
    mail_provider: 'PHP Mail',
    disable_email_sending: 'disabled',
    disable_rfc3834_headers: 'disabled',
    global_signature: '',
    global_css: '',
    client_email_header: '',
    client_email_footer: '',
    system_from_name: '',
    system_from_email: '',
    bcc_messages: '',
    presales_destination: 'department',
    presales_email: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // DataTable State for Tab 2
  const [emailRecords, setEmailRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState({
    subject: '',
    recipient_name: '',
    recipient_email: '',
    email_type: 'System Notice',
    status: 'sent'
  });
  const [creatingRecord, setCreatingRecord] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await getEmailConfig();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setConfig({
          mail_provider: data.mail_provider || 'PHP Mail',
          disable_email_sending: data.disable_email_sending || 'disabled',
          disable_rfc3834_headers: data.disable_rfc3834_headers || 'disabled',
          global_signature: data.global_signature || '',
          global_css: data.global_css || '',
          client_email_header: data.client_email_header || '',
          client_email_footer: data.client_email_footer || '',
          system_from_name: data.system_from_name || '',
          system_from_email: data.system_from_email || '',
          bcc_messages: data.bcc_messages || '',
          presales_destination: data.presales_destination || 'department',
          presales_email: data.presales_email || ''
        });
      }
    } catch (err) {
      console.error("Failed to load email config", err);
    }
  };

  const fetchRecords = async () => {
    setRecordsLoading(true);
    try {
      const res = await getAllEmailRecords();
      if (res.data?.success) {
        setEmailRecords(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load email records", err);
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
      await updateEmailConfig(config);
      toast.success("Email configuration saved to database!");
    } catch (err) {
      toast.error("Failed to save email configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.subject || !newEmail.recipient_email) {
      toast.error("Please fill in Subject and Recipient Email.");
      return;
    }
    setCreatingRecord(true);
    try {
      await createEmailRecord(newEmail);
      toast.success("Email record logged successfully!");
      setShowAddModal(false);
      setNewEmail({
        subject: '',
        recipient_name: '',
        recipient_email: '',
        email_type: 'System Notice',
        status: 'sent'
      });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to log email record.");
    } finally {
      setCreatingRecord(false);
    }
  };

  const handleDeleteEmail = async (id) => {
    if (!window.confirm("Are you sure you want to delete this email log record?")) return;
    try {
      await deleteEmailRecord(id);
      toast.success("Email log record deleted successfully!");
      fetchRecords();
    } catch (err) {
      toast.error("Failed to delete email record.");
    }
  };

  // DataTable Columns definition for Tab 2
  const emailColumns = [
    { key: 'id', label: 'ID', minWidth: '80px', sortable: true },
    { key: 'subject', label: 'Subject', minWidth: '220px', sortable: true, render: row => <span className="font-bold text-slate-900">{row.subject}</span> },
    { key: 'recipient_name', label: 'Recipient Name', minWidth: '180px', sortable: true },
    { key: 'recipient_email', label: 'Recipient Email', minWidth: '200px', sortable: true, render: row => <span className="font-mono text-xs text-blue-900">{row.recipient_email}</span> },
    { key: 'email_type', label: 'Email Type', minWidth: '160px', sortable: true, render: row => <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700">{row.email_type}</span> },
    { key: 'sent_at', label: 'Sent At', minWidth: '160px', sortable: true, render: row => row.sent_at ? new Date(row.sent_at).toLocaleString() : 'N/A' },
    {
      key: 'status', label: 'Status', minWidth: '120px', sortable: true, render: row => (
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
          row.status === 'sent'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : row.status === 'queued'
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
          onClick={() => handleDeleteEmail(row.id)}
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
            <h1 className="text-xl font-bold text-slate-900">Email Master</h1>
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
              📧 Email Configuration & Templates
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'records'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 Sent Email Logs & Templates
            </button>
          </div>
        </div>

        {/* TAB 1: EMAIL CONFIGURATION FORM */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">

            {/* Section 1: Core Mail Server & System Senders */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    📧
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Mail Transport & System Senders</h2>
                    <p className="text-xs text-slate-500">Configure outbound email provider, sender names, BCC lists, and RFC headers.</p>
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
                {/* Mail Provider */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mail Provider</label>
                  <select
                    value={config.mail_provider}
                    onChange={e => setConfig({ ...config, mail_provider: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="PHP Mail">PHP Mail (Default)</option>
                    <option value="SMTP">SMTP Server</option>
                    <option value="Mailgun">Mailgun API</option>
                    <option value="SendGrid">SendGrid API</option>
                    <option value="Amazon SES">Amazon SES</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Outbound mail handler engine.</p>
                </div>

                {/* System Emails From Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">System Emails From Name</label>
                  <input
                    type="text"
                    value={config.system_from_name}
                    onChange={e => setConfig({ ...config, system_from_name: e.target.value })}
                    placeholder="WHMCompleteSolution"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Default sender name on system emails.</p>
                </div>

                {/* System Emails From Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">System Emails From Email</label>
                  <input
                    type="email"
                    value={config.system_from_email}
                    onChange={e => setConfig({ ...config, system_from_email: e.target.value })}
                    placeholder="noreply@yourdomain.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Default sender address on system emails.</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.disable_email_sending === 'enabled'}
                    onChange={e => setConfig({ ...config, disable_email_sending: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Disable Email Sending</p>
                    <p className="text-[11px] text-slate-500">Disables all outgoing emails within WHMCS.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.disable_rfc3834_headers === 'enabled'}
                    onChange={e => setConfig({ ...config, disable_rfc3834_headers: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Disable RFC3834 Headers</p>
                    <p className="text-[11px] text-slate-500">Disables autoresponder prevention headers (RFC-3834).</p>
                  </div>
                </label>
              </div>

              {/* BCC Messages & Presales Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">BCC Messages</label>
                  <input
                    type="text"
                    value={config.bcc_messages}
                    onChange={e => setConfig({ ...config, bcc_messages: e.target.value })}
                    placeholder="admin1@example.com, admin2@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Comma-separated email addresses to receive blind carbon copies of all sent emails.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Presales Contact Form Destination</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={config.presales_destination}
                      onChange={e => setConfig({ ...config, presales_destination: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                    >
                      <option value="department">Choose a Department</option>
                      <option value="email">Send to Email Address</option>
                    </select>

                    <input
                      type="email"
                      value={config.presales_email}
                      onChange={e => setConfig({ ...config, presales_email: e.target.value })}
                      placeholder="presales@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Destination for public presales inquiries.</p>
                </div>
              </div>
            </div>

            {/* Section 2: Global Email Signature */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                  ✍️
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Global Email Signature</h2>
                  <p className="text-xs text-slate-500">Appended to the bottom of all outbound messages.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <textarea
                  rows={3}
                  value={config.global_signature}
                  onChange={e => setConfig({ ...config, global_signature: e.target.value })}
                  placeholder="Signature goes here... Regards, Support Team"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            {/* Section 3: Global Email CSS Styling */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                  🎨
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Global Email CSS Styling</h2>
                  <p className="text-xs text-slate-500">CSS styles injected into HTML email templates.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <textarea
                  rows={6}
                  value={config.global_css}
                  onChange={e => setConfig({ ...config, global_css: e.target.value })}
                  placeholder=".ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            {/* Section 4: Client Email Header & Footer Templates */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                  💻
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Client Email Header & Footer Content</h2>
                  <p className="text-xs text-slate-500">HTML wrapper templates prefixed and suffixed to all client communications.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client Email Header Content (HTML)</label>
                  <textarea
                    rows={8}
                    value={config.client_email_header}
                    onChange={e => setConfig({ ...config, client_email_header: e.target.value })}
                    placeholder="<!DOCTYPE html PUBLIC ... Prefixed to the top of all client email templates."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client Email Footer Content (HTML)</label>
                  <textarea
                    rows={8}
                    value={config.client_email_footer}
                    onChange={e => setConfig({ ...config, client_email_footer: e.target.value })}
                    placeholder="<a href='{$company_domain}'>visit our website</a> ... Appended to the bottom of all client email templates."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
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
                {savingConfig ? <><span>⏳</span> Saving Configuration...</> : <><span>💾</span> Save Email Configuration</>}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: SENT EMAIL LOGS & TEMPLATES (DataTable.jsx) */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <DataTable
              tableId="email_master_records"
              title="Sent Email Logs & Templates History"
              data={emailRecords}
              columns={emailColumns}
              loading={recordsLoading}
              searchPlaceholder="Search emails by subject, recipient, status..."
              actionButton={
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-800 shadow-md"
                >
                  <span>+</span> Send / Log Test Email
                </button>
              }
            />
          </div>
        )}

        {/* Add Email Log Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Send / Log Test Email</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleCreateEmail} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Subject *</label>
                  <input
                    type="text"
                    required
                    value={newEmail.subject}
                    onChange={e => setNewEmail({ ...newEmail, subject: e.target.value })}
                    placeholder="System Notice: Account Password Changed"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Recipient Name</label>
                    <input
                      type="text"
                      value={newEmail.recipient_name}
                      onChange={e => setNewEmail({ ...newEmail, recipient_name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Recipient Email *</label>
                    <input
                      type="email"
                      required
                      value={newEmail.recipient_email}
                      onChange={e => setNewEmail({ ...newEmail, recipient_email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Type</label>
                    <select
                      value={newEmail.email_type}
                      onChange={e => setNewEmail({ ...newEmail, email_type: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="System Notice">System Notice</option>
                      <option value="Billing Invoice">Billing Invoice</option>
                      <option value="Support Ticket">Support Ticket</option>
                      <option value="Domain Reminder">Domain Reminder</option>
                      <option value="Account Welcome">Account Welcome</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={newEmail.status}
                      onChange={e => setNewEmail({ ...newEmail, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="sent">Sent</option>
                      <option value="queued">Queued</option>
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
                    disabled={creatingRecord}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800"
                  >
                    {creatingRecord ? 'Logging...' : 'Log Email Record'}
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
