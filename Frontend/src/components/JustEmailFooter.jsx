import React from 'react';
import { ShieldCheck, Mail, Phone, Globe } from 'lucide-react';

export default function JustEmailFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 font-sans border-t border-slate-800">
      
      {/* Upper Footer Links & Brand Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-3">
            <img
              src="/justemail_png.png"
              alt="JustEmail Logo"
              className="h-9 w-auto object-contain brightness-0 invert"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/jasmin_-removebg-preview.png";
              }}
            />
          </div>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Enterprise Business Email & Cloud Storage deployment. Premier partner for Google Workspace, Microsoft 365, and JustEmail Enterprise Cloud.
          </p>
          <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Govt. Registered IT Enterprise (Since 2012)</span>
          </div>
        </div>

        {/* Column 2: Provider Solutions */}
        <div className="space-y-3 text-xs">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Email Solutions</h4>
          <ul className="space-y-2 text-slate-400 font-semibold">
            <li><a href="#catalog-plans" className="hover:text-white transition-colors">Google Workspace Starter</a></li>
            <li><a href="#catalog-plans" className="hover:text-white transition-colors">Google Workspace Standard</a></li>
            <li><a href="#catalog-plans" className="hover:text-white transition-colors">Microsoft 365 Business Basic</a></li>
            <li><a href="#catalog-plans" className="hover:text-white transition-colors">JustEmail Enterprise Cloud</a></li>
          </ul>
        </div>

        {/* Column 3: Reseller & Migration */}
        <div className="space-y-3 text-xs">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Partner & SLA</h4>
          <ul className="space-y-2 text-slate-400 font-semibold">
            <li><a href="/reseller/dashboard" className="hover:text-white transition-colors">Reseller Wholesale Partner</a></li>
            <li><a href="#catalog-plans" className="hover:text-white transition-colors">Zero-Downtime IMAP Migration</a></li>
            <li><a href="#catalog-plans" className="hover:text-white transition-colors">99.9% Uptime SLA Guarantee</a></li>
            <li><a href="#catalog-plans" className="hover:text-white transition-colors">Automated MX/DKIM/SPF Setup</a></li>
          </ul>
        </div>

        {/* Column 4: Contact & Support */}
        <div className="space-y-3 text-xs">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Engineering Support</h4>
          <ul className="space-y-2.5 text-slate-400 font-medium">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#0067ED]" />
              <span>Helpline: +91 98244 66017</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0067ED]" />
              <span>Support: info@jeenweb.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#0067ED]" />
              <span>Web: www.jeenweb.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-slate-900 border-t border-slate-800/80 py-4 text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px]">
          <div>
            © 2012 - 2026 <strong>JustEmail Cloud Systems</strong>. A Brand of <strong className="text-slate-200">Jeenweb Technologists Pvt. Ltd.</strong>
          </div>
          <div className="flex space-x-4 text-slate-400">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security SLA</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
