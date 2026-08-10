import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import {
  getGeneralConfig,
  updateGeneralConfig,
  uploadSystemLogo
} from '../../../api/systemSettingsApi';
import toast from 'react-hot-toast';

export default function SystemSettingsMasterPage() {
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchGeneral();
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

  return (
    <div className="flex-1 bg-slate-50 font-sans text-slate-900">
      {/* Universal Header (Navbar) */}
      <Navbar title="CRM Admin" />

      {/* Main Container */}
      <main className="mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">General Setting Master</h1>
            <p className="text-slate-500 mt-1">Configure company branding, system URLs, log limits, and maintenance mode.</p>
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
          <form onSubmit={handleSaveGeneralConfig} className="space-y-8">

            {/* Section 1: Organization & Branding */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  🏢
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Organization & Branding</h2>
                  <p className="text-xs text-slate-500">Set up your company identity, sender email, domain, and logo image.</p>
                </div>
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

            <hr className="border-slate-100" />

            {/* Section 2: System URLs & Theme Settings */}
            <div className="space-y-5">
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

            <hr className="border-slate-100" />

            {/* Section 3: Performance, Logs & Display Limits */}
            <div className="space-y-5">
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

            <hr className="border-slate-100" />

            {/* Section 4: Invoice Details & Maintenance Mode */}
            <div className="space-y-5">
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
