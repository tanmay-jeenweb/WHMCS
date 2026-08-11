import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import {
  getOrderingConfig,
  updateOrderingConfig
} from '../../../api/orderingMasterApi';
import toast from 'react-hot-toast';

export default function OrderingMasterPage() {
  const navigate = useNavigate();

  // General Config State (Empty initial strings so transparent placeholders display)
  const [config, setConfig] = useState({
    order_days_grace: '',
    default_template: 'standard_cart',
    on_demand_renewals: 'disabled',
    renewal_days_monthly: '',
    renewal_days_quarterly: '',
    renewal_days_semiannually: '',
    renewal_days_annually: '',
    renewal_days_biennially: '',
    renewal_days_triennially: '',
    undefined_addons_config: 'global',
    sidebar_toggle: 'enabled',
    enable_tos: 'disabled',
    tos_url: '',
    auto_redirect_checkout: 'completed',
    allow_notes: 'enabled',
    monthly_breakdown: 'disabled',
    block_existing_domains: 'disabled',
    no_invoice_email: 'disabled',
    skip_fraud_existing: 'disabled',
    only_autoprovision_existing: 'disabled',
    enable_random_usernames: 'disabled',
    signup_anniversary_prorata: 'disabled',
    enable_cross_selling: 'disabled',
    cross_sell_locations: 'cart_checkout',
    number_of_cross_sells: '',
    recommend_existing_services: 'disabled',
    cross_sell_style: 'standard'
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await getOrderingConfig();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setConfig({
          order_days_grace: data.order_days_grace !== null && data.order_days_grace !== undefined ? data.order_days_grace : '',
          default_template: data.default_template || 'standard_cart',
          on_demand_renewals: data.on_demand_renewals || 'disabled',
          renewal_days_monthly: data.renewal_days_monthly || '31',
          renewal_days_quarterly: data.renewal_days_quarterly || '92',
          renewal_days_semiannually: data.renewal_days_semiannually || '184',
          renewal_days_annually: data.renewal_days_annually || '366',
          renewal_days_biennially: data.renewal_days_biennially || '731',
          renewal_days_triennially: data.renewal_days_triennially || '1096',
          undefined_addons_config: data.undefined_addons_config || 'global',
          sidebar_toggle: data.sidebar_toggle || 'enabled',
          enable_tos: data.enable_tos || 'disabled',
          tos_url: data.tos_url || '',
          auto_redirect_checkout: data.auto_redirect_checkout || 'completed',
          allow_notes: data.allow_notes || 'enabled',
          monthly_breakdown: data.monthly_breakdown || 'disabled',
          block_existing_domains: data.block_existing_domains || 'disabled',
          no_invoice_email: data.no_invoice_email || 'disabled',
          skip_fraud_existing: data.skip_fraud_existing || 'disabled',
          only_autoprovision_existing: data.only_autoprovision_existing || 'disabled',
          enable_random_usernames: data.enable_random_usernames || 'disabled',
          signup_anniversary_prorata: data.signup_anniversary_prorata || 'disabled',
          enable_cross_selling: data.enable_cross_selling || 'disabled',
          cross_sell_locations: data.cross_sell_locations || 'cart_checkout',
          number_of_cross_sells: data.number_of_cross_sells || '10',
          recommend_existing_services: data.recommend_existing_services || 'disabled',
          cross_sell_style: data.cross_sell_style || 'standard'
        });
      }
    } catch (err) {
      console.error("Failed to load ordering config", err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateOrderingConfig(config);
      toast.success("Ordering configuration saved to database!");
    } catch (err) {
      toast.error("Failed to save ordering configuration.");
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
            <h1 className="text-2xl font-bold text-slate-900">Ordering Master</h1>
            <p className="text-slate-500 mt-1">Configure ordering process, renewal policies, terms of service, and cross-selling settings.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSaveConfig} className="space-y-8">

            {/* Section 1: Core Order & Payment Rules */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  🛒
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Core Order & Payment Rules</h2>
                  <p className="text-xs text-slate-500">Set grace periods, order form templates, and payment checkout redirects.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Order Days Grace */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Order Days Grace</label>
                  <input
                    type="number"
                    value={config.order_days_grace}
                    onChange={e => setConfig({ ...config, order_days_grace: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-500">The number of days to allow for payment of an order before being overdue.</p>
                </div>

                {/* 2. Default Order Form Template */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Default Order Form Template</label>
                  <select
                    value={config.default_template}
                    onChange={e => setConfig({ ...config, default_template: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all cursor-pointer"
                  >
                    <option value="cloud_slider">Cloud Slider</option>
                    <option value="legacy_boxes">Legacy Boxes</option>
                    <option value="legacy_modern">Legacy Modern</option>
                    <option value="nexus_cart">Nexus Cart</option>
                    <option value="premium_comparison">Premium Comparison</option>
                    <option value="pure_comparison">Pure Comparison</option>
                    <option value="standard_cart">Standard Cart (Default)</option>
                    <option value="supreme_comparison">Supreme Comparison</option>
                    <option value="universal_slider">Universal Slider</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Active checkout layout template for product selection.</p>
                </div>

                {/* 3. Auto Redirect on Checkout */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Auto Redirect on Checkout</label>
                  <select
                    value={config.auto_redirect_checkout}
                    onChange={e => setConfig({ ...config, auto_redirect_checkout: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all cursor-pointer"
                  >
                    <option value="completed">Just show the order completed page (no payment redirect)</option>
                    <option value="invoice">Automatically take the user to the invoice</option>
                    <option value="gateway">Automatically forward the user to the payment gateway</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Action taken immediately after customer clicks Complete Order.</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: On-Demand Renewals & Addon Settings */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                    🔄
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">On-Demand Renewals & Addons</h2>
                    <p className="text-xs text-slate-500">Allow clients to renew services early and configure addon renewal rules.</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">Enable On-Demand Renewals</span>
                  <input
                    type="checkbox"
                    checked={config.on_demand_renewals === 'enabled'}
                    onChange={e => setConfig({ ...config, on_demand_renewals: e.target.checked ? 'enabled' : 'disabled' })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold text-slate-700">Early Renewal Days Thresholds (by billing cycle):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Monthly</label>
                    <input
                      type="number"
                      value={config.renewal_days_monthly}
                      onChange={e => setConfig({ ...config, renewal_days_monthly: e.target.value })}
                      placeholder="31"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Quarterly</label>
                    <input
                      type="number"
                      value={config.renewal_days_quarterly}
                      onChange={e => setConfig({ ...config, renewal_days_quarterly: e.target.value })}
                      placeholder="92"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Semi-Annually</label>
                    <input
                      type="number"
                      value={config.renewal_days_semiannually}
                      onChange={e => setConfig({ ...config, renewal_days_semiannually: e.target.value })}
                      placeholder="184"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Annually</label>
                    <input
                      type="number"
                      value={config.renewal_days_annually}
                      onChange={e => setConfig({ ...config, renewal_days_annually: e.target.value })}
                      placeholder="366"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Biennially</label>
                    <input
                      type="number"
                      value={config.renewal_days_biennially}
                      onChange={e => setConfig({ ...config, renewal_days_biennially: e.target.value })}
                      placeholder="731"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Triennially</label>
                    <input
                      type="number"
                      value={config.renewal_days_triennially}
                      onChange={e => setConfig({ ...config, renewal_days_triennially: e.target.value })}
                      placeholder="1096"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">The period (in days) during which clients can place early renewal orders before the due date.</p>

                {/* Undefined Addons Config */}
                <div className="pt-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Undefined Product Addons Configuration</label>
                  <select
                    value={config.undefined_addons_config}
                    onChange={e => setConfig({ ...config, undefined_addons_config: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="global">Use Global Settings</option>
                    <option value="parent">Use Parent Product Settings</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Terms of Service & Security Toggles */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                  🛡️
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Terms of Service & Ordering Controls</h2>
                  <p className="text-xs text-slate-500">TOS agreements, domain blocking, fraud checks, and username generation.</p>
                </div>
              </div>

              {/* TOS Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Enable TOS Acceptance</h4>
                    <p className="text-xs text-slate-500">Clients must check to agree to Terms of Service before checkout.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enable_tos === 'enabled'}
                    onChange={e => setConfig({ ...config, enable_tos: e.target.checked ? 'enabled' : 'disabled' })}
                    className="h-5 w-5 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Terms of Service URL</label>
                  <input
                    type="text"
                    value={config.tos_url}
                    onChange={e => setConfig({ ...config, tos_url: e.target.value })}
                    placeholder="http://www.example.com/tos.html"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              {/* Grid of Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.sidebar_toggle === 'enabled'}
                    onChange={e => setConfig({ ...config, sidebar_toggle: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Sidebar Toggle Button</p>
                    <p className="text-[11px] text-slate-500">Enable sidebar toggle on selection pages.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_notes === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_notes: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Allow Notes on Checkout</p>
                    <p className="text-[11px] text-slate-500">Show extra instructions field for staff.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.monthly_breakdown === 'enabled'}
                    onChange={e => setConfig({ ...config, monthly_breakdown: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Monthly Pricing Breakdown</p>
                    <p className="text-[11px] text-slate-500">Show monthly cost breakdown on cart.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.block_existing_domains === 'enabled'}
                    onChange={e => setConfig({ ...config, block_existing_domains: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Block Existing Domains</p>
                    <p className="text-[11px] text-slate-500">Prevent ordering existing system domains.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.no_invoice_email === 'enabled'}
                    onChange={e => setConfig({ ...config, no_invoice_email: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">No Invoice Email on Order</p>
                    <p className="text-[11px] text-slate-500">Suppress invoice notice on new orders.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.skip_fraud_existing === 'enabled'}
                    onChange={e => setConfig({ ...config, skip_fraud_existing: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Skip Fraud for Existing</p>
                    <p className="text-[11px] text-slate-500">Skip fraud check for existing clients.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.only_autoprovision_existing === 'enabled'}
                    onChange={e => setConfig({ ...config, only_autoprovision_existing: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Only Provision Existing</p>
                    <p className="text-[11px] text-slate-500">New client orders remain pending for review.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enable_random_usernames === 'enabled'}
                    onChange={e => setConfig({ ...config, enable_random_usernames: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Enable Random Usernames</p>
                    <p className="text-[11px] text-slate-500">Generate random service usernames.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.signup_anniversary_prorata === 'enabled'}
                    onChange={e => setConfig({ ...config, signup_anniversary_prorata: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Signup Anniversary Prorata</p>
                    <p className="text-[11px] text-slate-500">Align all product renewals to signup date.</p>
                  </div>
                </label>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 4: Product Cross-Selling Options */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                    💎
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Product Cross-Selling & Recommendations</h2>
                    <p className="text-xs text-slate-500">Promote related product addons and cross-sells during checkout.</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">Enable Product Cross-Selling</span>
                  <input
                    type="checkbox"
                    checked={config.enable_cross_selling === 'enabled'}
                    onChange={e => setConfig({ ...config, enable_cross_selling: e.target.checked ? 'enabled' : 'disabled' })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Number of Cross-sells</label>
                  <input
                    type="number"
                    value={config.number_of_cross_sells}
                    onChange={e => setConfig({ ...config, number_of_cross_sells: e.target.value })}
                    placeholder="10"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Max cross-sells to display in cart experience.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Product Cross-sell Style</label>
                  <select
                    value={config.cross_sell_style}
                    onChange={e => setConfig({ ...config, cross_sell_style: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="standard">Standard Grid View</option>
                    <option value="carousel">Interactive Carousel</option>
                    <option value="compact">Compact Single Line</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Layout style for presenting cross-sell cards.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cross-Sell Display Location</label>
                  <select
                    value={config.cross_sell_locations}
                    onChange={e => setConfig({ ...config, cross_sell_locations: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="add_to_cart">When adding a product to the cart</option>
                    <option value="review_checkout">Display on the Review & Checkout page</option>
                    <option value="checkout_page">Display on the Checkout page</option>
                    <option value="order_confirmation">Display on the Order Confirmation page</option>
                    <option value="cart_checkout">All Checkout Steps</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Checkout stage where recommendations trigger.</p>
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
