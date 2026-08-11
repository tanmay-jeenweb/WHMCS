import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import {
  getSecurityConfig,
  updateSecurityConfig
} from '../../../api/securityMasterApi';
import toast from 'react-hot-toast';

export default function SecurityMasterPage() {
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchConfig();
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

  return (
    <div className="flex-1 bg-slate-50 font-sans text-slate-900">
      {/* Universal Header (Navbar) */}
      <Navbar title="CRM Admin" />

      {/* Main Container */}
      <main className="mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Security Master</h1>
            <p className="text-slate-500 mt-1">Configure CAPTCHA protections, IP bans, Whitelists, password strength scores, and session controls.</p>
          </div>
        
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSaveConfig} className="space-y-8">

            {/* Section 1: Email Verification & Passwords Policy */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  🔐
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">User Verification & Password Policy</h2>
                  <p className="text-xs text-slate-500">Configure email verification, auto-generated password formats, and minimum strength scores.</p>
                </div>
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

            <hr className="border-slate-100" />

            {/* Section 2: CAPTCHA Form Protection */}
            <div className="space-y-5">
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

            <hr className="border-slate-100" />

            {/* Section 3: Whitelists, Proxies & API Access */}
            <div className="space-y-5">
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

            <hr className="border-slate-100" />

            {/* Section 4: CSRF Tokens & Data Cleanup Controls */}
            <div className="space-y-5">
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
