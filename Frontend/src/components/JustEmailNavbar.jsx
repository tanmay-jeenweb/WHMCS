import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  User, 
  LogOut, 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  Building2,
  Menu,
  X
} from 'lucide-react';

export default function JustEmailNavbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch (e) { return {}; }
  }, []);

  const isLoggedIn = !!activeUser.email;
  const isReseller = (activeUser.role || "").toLowerCase() === 'reseller';
  const isAdmin = (activeUser.role || "").toLowerCase().includes('admin');

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/90 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => { window.location.href = "/store"; }}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <img
            src="/images/justemail_png.png"
            alt="JustEmail Logo"
            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/justemail-logo.png";
            }}
          />
          <span className="hidden sm:inline-block text-[11px] font-black text-[#0067ED] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Cloud Store
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-xs font-extrabold text-slate-700">
          <a href="#catalog-plans" className="hover:text-[#0067ED] transition-colors">
            Business Email Plans
          </a>
          <a href="#catalog-plans" className="hover:text-[#0067ED] transition-colors flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Google Workspace</span>
          </a>
          <a href="#catalog-plans" className="hover:text-[#0067ED] transition-colors flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Microsoft 365</span>
          </a>
          {isReseller && (
            <button
              onClick={() => navigate('/reseller/dashboard')}
              className="text-[#0067ED] hover:underline font-extrabold flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Reseller Dashboard</span>
            </button>
          )}
        </nav>

        {/* User Account / Portal Actions */}
        <div className="hidden sm:flex items-center space-x-3 text-xs">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (isReseller) navigate('/reseller/dashboard');
                  else if (isAdmin) navigate('/admin/dashboard');
                  else navigate('/user/home');
                }}
                className="bg-[#0B1437] hover:bg-[#0067ED] text-white font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>{isReseller ? 'Reseller Portal' : isAdmin ? 'Admin Dashboard' : 'My Account'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/')}
                className="text-slate-700 hover:text-slate-900 font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-[#0B1437] hover:bg-[#0067ED] text-white font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Client Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-700 hover:text-slate-900 lg:hidden cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 font-sans text-xs">
          <a
            href="#catalog-plans"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-bold text-slate-800 py-2 hover:text-[#0067ED]"
          >
            Business Email Plans
          </a>
          {isReseller && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/reseller/dashboard');
              }}
              className="w-full text-left font-extrabold text-[#0067ED] py-2"
            >
              Reseller Dashboard
            </button>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (isReseller) navigate('/reseller/dashboard');
                else if (isAdmin) navigate('/admin/dashboard');
                else navigate('/user/home');
              }}
              className="w-full bg-[#0B1437] text-white font-extrabold py-2.5 rounded-xl text-center shadow-xs"
            >
              {isLoggedIn ? 'Portal Dashboard' : 'Client Portal Sign In'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
