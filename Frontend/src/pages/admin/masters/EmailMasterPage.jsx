import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import {
  getEmailConfig,
  updateEmailConfig
} from '../../../api/emailMasterApi';
import toast from 'react-hot-toast';

export default function EmailMasterPage() {
  const navigate = useNavigate();

  // General Email Config State (Clean empty initial values)
  const [config, setConfig] = useState({
    mail_provider: 'PHP Mail',
    disable_email_sending: 'disabled',
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

  const fetchConfig = async () => {
    try {
      const res = await getEmailConfig();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setConfig({
          mail_provider: data.mail_provider || 'PHP Mail',
          disable_email_sending: data.disable_email_sending || 'disabled',
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

  useEffect(() => {
    fetchConfig();
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

  return (
    <div className="flex-1 bg-slate-50 font-sans text-slate-900">
      {/* Universal Header (Navbar) */}
      <Navbar title="CRM Admin" />

      {/* Main Container */}
      <main className="mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Email Master</h1>
            <p className="text-slate-500 mt-1">Configure mail servers, global signatures, templates, and outbound email styling settings.</p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-slate-500 hover:text-slate-700 font-medium text-sm flex items-center gap-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSaveConfig} className="space-y-8">

            {/* Section 1: Core Mail Server & System Senders */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  📧
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Mail Transport & System Senders</h2>
                  <p className="text-xs text-slate-500">Configure outbound email provider, sender names, and BCC lists.</p>
                </div>
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
              <div className="grid grid-cols-1 gap-4 pt-2">
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

            <hr className="border-slate-100" />

            {/* Section 2: Global Email Signature */}
            <div className="space-y-5">
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

            <hr className="border-slate-100" />

            {/* Section 3: Global Email CSS Styling */}
            <div className="space-y-5">
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

            <hr className="border-slate-100" />

            {/* Section 4: Client Email Header & Footer Templates */}
            <div className="space-y-5">
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

            {/* Bottom Form Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={savingConfig}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#0056cf] hover:bg-[#0040a1] focus:ring-2 focus:ring-offset-2 focus:ring-[#0056cf] disabled:opacity-50 transition-colors"
              >
                {savingConfig ? "Saving Configuration..." : "Save Configuration Changes"}
              </button>
            </div>

          </form>
        </div>

      </main>
    </div>
  );
}
