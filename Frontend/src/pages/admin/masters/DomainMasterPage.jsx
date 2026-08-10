import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import {
  getDomainConfig,
  updateDomainConfig
} from '../../../api/domainMasterApi';
import toast from 'react-hot-toast';

export default function DomainMasterPage() {
  const navigate = useNavigate();

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
    default_ns5: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);

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
          default_ns5: data.default_ns5 || ''
        });
      }
    } catch (err) {
      console.error("Failed to load domain config", err);
    }
  };

  useEffect(() => {
    fetchConfig();
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

  return (
    <div className="flex-1 bg-slate-50 font-sans text-slate-900">
      {/* Universal Header (Navbar) */}
      <Navbar title="CRM Admin" />

      {/* Main Container */}
      <main className="mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Domain Master</h1>
            <p className="text-slate-500 mt-1">Configure registered domain rules, auto-renewals, grace redemptions, and default nameservers.</p>
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

            {/* Section 1: Domain Registration Options */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  🌐
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Domain Registration Options</h2>
                  <p className="text-xs text-slate-500">Configure client domain registration, transfer, and ownership options.</p>
                </div>
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

            <hr className="border-slate-100" />

            {/* Section 2: Domain Renewals & Auto-Renew Settings */}
            <div className="space-y-5">
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
                    <p className="text-xs font-bold text-slate-800">Show Renewal Orders</p>
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

            <hr className="border-slate-100" />

            {/* Section 3: Default Nameservers */}
            <div className="space-y-5">
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
