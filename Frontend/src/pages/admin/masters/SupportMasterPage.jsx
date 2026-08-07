import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import DataTable from '../../../components/DataTable';
import {
  getSupportConfig,
  updateSupportConfig,
  getAllSupportRecords,
  createSupportRecord,
  deleteSupportRecord
} from '../../../api/supportMasterApi';
import toast from 'react-hot-toast';

export default function SupportMasterPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'records'

  // General Support Config State (Clean empty initial values)
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
    presales_email: '',
    ticket_reply_order: 'asc',
    show_client_gravatar: 'enabled',
    allowed_attachment_types: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // DataTable State for Tab 2
  const [supportRecords, setSupportRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    ticket_number: '',
    department: 'Technical Support',
    subject: '',
    client_name: '',
    priority: 'Medium',
    status: 'Open'
  });
  const [creatingTicket, setCreatingTicket] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await getSupportConfig();
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
          presales_email: data.presales_email || '',
          ticket_reply_order: data.ticket_reply_order || 'asc',
          show_client_gravatar: data.show_client_gravatar || 'enabled',
          allowed_attachment_types: data.allowed_attachment_types || '.jpg,.jpeg,.png,.pdf,.zip,.txt'
        });
      }
    } catch (err) {
      console.error("Failed to load support config", err);
    }
  };

  const fetchRecords = async () => {
    setRecordsLoading(true);
    try {
      const res = await getAllSupportRecords();
      if (res.data?.success) {
        setSupportRecords(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load support records", err);
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
      await updateSupportConfig(config);
      toast.success("Support configuration saved to database!");
    } catch (err) {
      toast.error("Failed to save support configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.ticket_number || !newTicket.subject || !newTicket.client_name) {
      toast.error("Please fill in Ticket Number, Subject, and Client Name.");
      return;
    }
    setCreatingTicket(true);
    try {
      await createSupportRecord(newTicket);
      toast.success("Support ticket record created successfully!");
      setShowAddModal(false);
      setNewTicket({
        ticket_number: '',
        department: 'Technical Support',
        subject: '',
        client_name: '',
        priority: 'Medium',
        status: 'Open'
      });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create support ticket record.");
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket record?")) return;
    try {
      await deleteSupportRecord(id);
      toast.success("Support ticket record deleted successfully!");
      fetchRecords();
    } catch (err) {
      toast.error("Failed to delete ticket record.");
    }
  };

  // DataTable Columns definition for Tab 2
  const supportColumns = [
    { key: 'id', label: 'ID', minWidth: '80px', sortable: true },
    { key: 'ticket_number', label: 'Ticket #', minWidth: '150px', sortable: true, render: row => <span className="font-bold font-mono text-blue-900">{row.ticket_number}</span> },
    { key: 'subject', label: 'Subject', minWidth: '220px', sortable: true, render: row => <span className="font-bold text-slate-900">{row.subject}</span> },
    { key: 'client_name', label: 'Client Name', minWidth: '180px', sortable: true },
    { key: 'department', label: 'Department', minWidth: '180px', sortable: true, render: row => <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700">{row.department}</span> },
    {
      key: 'priority', label: 'Priority', minWidth: '120px', sortable: true, render: row => (
        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
          row.priority === 'High' || row.priority === 'Urgent'
            ? 'text-rose-700 bg-rose-50 border border-rose-200'
            : row.priority === 'Medium'
            ? 'text-amber-700 bg-amber-50 border border-amber-200'
            : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
        }`}>
          {row.priority}
        </span>
      )
    },
    {
      key: 'status', label: 'Status', minWidth: '130px', sortable: true, render: row => (
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
          row.status === 'Open'
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : row.status === 'Answered'
            ? 'bg-sky-50 text-sky-700 border-sky-200'
            : row.status === 'Customer-Reply'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions', label: 'Actions', minWidth: '110px', sortable: false, render: row => (
        <button
          onClick={() => handleDeleteTicket(row.id)}
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
            <h1 className="text-xl font-bold text-slate-900">Support Master</h1>
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
              🎫 Support & Ticket Email Configuration
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'records'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 Support Tickets & History
            </button>
          </div>
        </div>

        {/* TAB 1: SUPPORT & EMAIL CONFIGURATION FORM */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">

            {/* Section 1: Ticket Preferences & Attachment Settings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    🎫
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Ticket Preferences & Attachments</h2>
                    <p className="text-xs text-slate-500">Configure ticket reply order, gravatar displays, and allowed attachment file types.</p>
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ticket Reply Order</label>
                  <select
                    value={config.ticket_reply_order}
                    onChange={e => setConfig({ ...config, ticket_reply_order: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="asc">Ascending (Oldest First)</option>
                    <option value="desc">Descending (Newest First)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Sort order of replies in ticket view.</p>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Allowed File Attachment Extensions</label>
                  <input
                    type="text"
                    value={config.allowed_attachment_types}
                    onChange={e => setConfig({ ...config, allowed_attachment_types: e.target.value })}
                    placeholder=".jpg,.jpeg,.png,.pdf,.zip,.txt"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Comma separated list of permitted attachment file extensions.</p>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.show_client_gravatar === 'enabled'}
                    onChange={e => setConfig({ ...config, show_client_gravatar: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Show Client Gravatar</p>
                    <p className="text-[11px] text-slate-500">Check to display client gravatar profile images on support ticket reply threads.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: Core Support Mail Transport & Senders */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                  ✉️
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Support Mail Transport & System Senders</h2>
                  <p className="text-xs text-slate-500">Mail transport providers, sender names, RFC headers, and presales forms.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                  <p className="text-[11px] text-slate-500">Outbound mail transport mechanism.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">System Emails From Name</label>
                  <input
                    type="text"
                    value={config.system_from_name}
                    onChange={e => setConfig({ ...config, system_from_name: e.target.value })}
                    placeholder="WHMCompleteSolution Support"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Default sender name on support emails.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">System Emails From Email</label>
                  <input
                    type="email"
                    value={config.system_from_email}
                    onChange={e => setConfig({ ...config, system_from_email: e.target.value })}
                    placeholder="support@yourdomain.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Default sender address on support emails.</p>
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
                    placeholder="support-audit@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Comma-separated email addresses to receive BCC copies of all support emails.</p>
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
                </div>
              </div>
            </div>

            {/* Section 3: Support Email Signatures & HTML Styling */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                  🎨
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Signatures & HTML CSS Templates</h2>
                  <p className="text-xs text-slate-500">Global support email signatures and CSS styling.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Global Email Signature</label>
                  <textarea
                    rows={3}
                    value={config.global_signature}
                    onChange={e => setConfig({ ...config, global_signature: e.target.value })}
                    placeholder="Signature goes here... Regards, Technical Support Team"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Global Email CSS Styling</label>
                  <textarea
                    rows={6}
                    value={config.global_css}
                    onChange={e => setConfig({ ...config, global_css: e.target.value })}
                    placeholder=".ExternalClass,.ExternalClass div,.ExternalClass font..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client Email Header Content (HTML)</label>
                    <textarea
                      rows={6}
                      value={config.client_email_header}
                      onChange={e => setConfig({ ...config, client_email_header: e.target.value })}
                      placeholder="<!DOCTYPE html ... Prefixed to the top of all support emails."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client Email Footer Content (HTML)</label>
                    <textarea
                      rows={6}
                      value={config.client_email_footer}
                      onChange={e => setConfig({ ...config, client_email_footer: e.target.value })}
                      placeholder="<a href='{$company_domain}'>visit our website</a> ... Appended to bottom of all support emails."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>
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
                {savingConfig ? <><span>⏳</span> Saving Configuration...</> : <><span>💾</span> Save Support Configuration</>}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: SUPPORT TICKETS & HISTORY (DataTable.jsx) */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <DataTable
              tableId="support_master_records"
              title="Support Tickets & Department History"
              data={supportRecords}
              columns={supportColumns}
              loading={recordsLoading}
              searchPlaceholder="Search tickets by number, subject, client, status..."
              actionButton={
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-800 shadow-md"
                >
                  <span>+</span> Open New Support Ticket
                </button>
              }
            />
          </div>
        )}

        {/* Add Ticket Record Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Open New Support Ticket</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Ticket Number *</label>
                    <input
                      type="text"
                      required
                      value={newTicket.ticket_number}
                      onChange={e => setNewTicket({ ...newTicket, ticket_number: e.target.value })}
                      placeholder="TCK-88004"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={newTicket.client_name}
                      onChange={e => setNewTicket({ ...newTicket, client_name: e.target.value })}
                      placeholder="Acme Corporation"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subject *</label>
                  <input
                    type="text"
                    required
                    value={newTicket.subject}
                    onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Database Connection Timeout Inquiry"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Department</label>
                    <select
                      value={newTicket.department}
                      onChange={e => setNewTicket({ ...newTicket, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-600 outline-none"
                    >
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing Department">Billing Department</option>
                      <option value="Sales & Presales">Sales & Presales</option>
                      <option value="Domain Registrar">Domain Registrar</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Priority</label>
                    <select
                      value={newTicket.priority}
                      onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-600 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={newTicket.status}
                      onChange={e => setNewTicket({ ...newTicket, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-600 outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="Answered">Answered</option>
                      <option value="Customer-Reply">Customer-Reply</option>
                      <option value="Closed">Closed</option>
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
                    disabled={creatingTicket}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800"
                  >
                    {creatingTicket ? 'Opening...' : 'Create Ticket Record'}
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
