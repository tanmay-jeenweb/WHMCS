import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import JustEmailNavbar from "../../components/JustEmailNavbar";
import JustEmailFooter from "../../components/JustEmailFooter";
import { getResellerClients } from "../../api/resellerMasterApi";
import toast from "react-hot-toast";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  HardDrive,
  Headphones,
  Zap,
  ChevronDown,
  ChevronUp,
  Building2,
  Users,
  Search,
  Check,
  X,
  CreditCard,
  Star,
  Globe,
  Mail,
  Award,
  ShoppingBag,
  UserCheck,
  PlusCircle,
  FileText,
  Percent,
  ArrowLeft,
  Gift,
  HelpCircle,
  CheckCircle
} from "lucide-react";

export default function StorePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active User & Reseller Session
  const activeUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch (e) { return {}; }
  }, []);
  const isReseller = useMemo(() => {
    const role = (activeUser.role || "").toLowerCase();
    const group = (activeUser.customer_group || "").toLowerCase();
    return role === 'reseller' || group === 'reseller' || role.includes('reseller') || group.includes('reseller') || !!activeUser.reseller_code;
  }, [activeUser]);

  // Catalog State
  const [productsList, setProductsList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom Reseller Pricing Cache
  const [customResellerPrices, setCustomResellerPrices] = useState([]);

  // Managed Reseller Clients
  const [resellerClients, setResellerClients] = useState([]);
  const [clientSelectionMode, setClientSelectionMode] = useState("existing");
  const [selectedClientId, setSelectedClientId] = useState("");

  // Per-Card Billing Cycles State: Map of productId -> cycleMonths (1, 12, 36)
  const [cardCycles, setCardCycles] = useState({});

  // Checkout Step: 1 = Catalog Page, 2 = Dedicated Full-Page MilesWeb Checkout
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutSubStep, setCheckoutSubStep] = useState(1); // 1 = Config & Domain, 2 = Customer Details & Payment

  // Selected Order Config State
  const [orderCycleMonths, setOrderCycleMonths] = useState(12);
  const [seatCount, setSeatCount] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Checkout Customer & Address Specification Form States
  const [clientDomain, setClientDomain] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("India");
  const [gstNumber, setGstNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(isReseller ? "reseller_portal" : "upi");

  // Search & Provider Filter Tabs State
  const [selectedProviderTab, setSelectedProviderTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Checkout submission & invoice completion state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderInvoiceId, setOrderInvoiceId] = useState(null);

  // FAQ Accordion Open State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Load Catalog Products, Reseller Custom Prices, & Reseller Clients
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resellerUserEmail = (activeUser.email || activeUser.username || "").trim();
        
        const [prodsRes, pricingRes, clientsRes] = await Promise.all([
          fetch("http://localhost:5000/api/product-master").then(r => r.json()).catch(() => ({ success: false, data: [] })),
          isReseller && resellerUserEmail
            ? fetch(`http://localhost:5000/api/reseller-master/pricing/${encodeURIComponent(resellerUserEmail)}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
              }).then(r => r.json()).catch(() => null)
            : null,
          isReseller && resellerUserEmail
            ? getResellerClients(resellerUserEmail).catch(() => null)
            : null
        ]);

        let prods = [];
        if (prodsRes.success && prodsRes.data && prodsRes.data.length > 0) {
          prods = prodsRes.data;
        } else {
          prods = [
            { id: 1, product_name: 'Google Workspace Starter', product_group_name: 'Google Business Emails', monthly_price: '270', annually_price: '2916', triennially_price: '7776' },
            { id: 2, product_name: 'Google Workspace Standard', product_group_name: 'Google Business Emails', monthly_price: '865', annually_price: '9342', triennially_price: '24912' },
            { id: 3, product_name: 'Microsoft 365 Business Basic', product_group_name: 'Microsoft 365 Email', monthly_price: '120', annually_price: '1296', triennially_price: '3456' },
            { id: 4, product_name: 'JustEmail Enterprise Cloud', product_group_name: 'Cloud Hosting', monthly_price: '500', annually_price: '5400', triennially_price: '14400' }
          ];
        }
        setProductsList(prods);

        if (pricingRes && pricingRes.success && Array.isArray(pricingRes.data)) {
          setCustomResellerPrices(pricingRes.data);
        }

        if (clientsRes && clientsRes.data && (clientsRes.data.success || Array.isArray(clientsRes.data))) {
          const clientArr = clientsRes.data.data || clientsRes.data;
          if (Array.isArray(clientArr)) {
            setResellerClients(clientArr);
            if (clientArr.length > 0) {
              const c = clientArr[0];
              setSelectedClientId(c.id.toString());
              setClientEmail(c.email || "");
              setFirstName(c.full_name || "");
              setClientDomain(c.domain_name || "");
              setCompanyName(c.company_name || "");
              setClientPhone(c.phone || "");
            }
          }
        }

        if (!isReseller && activeUser.email) {
          setClientEmail(activeUser.email || "");
          setFirstName(activeUser.name || activeUser.username || "");
          if (activeUser.phone || activeUser.mob_no) setClientPhone(activeUser.phone || activeUser.mob_no);
        }

        // Check URL Search Params (e.g. ?pid=34&cycle=annually&qty=5&domain=company.com)
        const searchParams = new URLSearchParams(location.search);
        const pid = searchParams.get("pid");
        const cycleParam = searchParams.get("cycle");
        const qtyParam = searchParams.get("qty");
        const domainParam = searchParams.get("domain");

        if (pid) {
          const found = prods.find(p => String(p.id) === String(pid));
          if (found) {
            setSelectedProduct(found);
            const cycleMonths = cycleParam === "triennially" ? 36 : cycleParam === "annually" ? 12 : 1;
            setOrderCycleMonths(cycleMonths);
            if (qtyParam && !isNaN(parseInt(qtyParam))) setSeatCount(parseInt(qtyParam));
            if (domainParam) setClientDomain(domainParam);
            setCheckoutStep(2);
          }
        }

      } catch (err) {
        console.error("Store page error:", err);
        setError(err.message || "Failed to load store catalog.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search, isReseller, activeUser.email, activeUser.username]);

  // Helper to calculate price for any product given cycle months
  const calculateProductPrice = (prod, cycleMonths = 12) => {
    if (!prod) return { effectiveMonthly: 270, total: 2916 };
    let monthlyRate = parseFloat(prod.monthly_price || "270");
    let annualRate = (prod.annually_price && parseFloat(prod.annually_price) > 0)
      ? parseFloat(prod.annually_price)
      : monthlyRate * 10.8;
    let triennialRate = (prod.triennially_price && parseFloat(prod.triennially_price) > 0)
      ? parseFloat(prod.triennially_price)
      : monthlyRate * 28.8;

    // Reseller Custom Overrides
    if (isReseller && customResellerPrices.length > 0) {
      const custom = customResellerPrices.find(cp => {
        if (!cp) return false;
        const idMatch = cp.product_id && prod.id && String(cp.product_id) === String(prod.id);
        const cpName = (cp.product_name || "").toLowerCase().trim();
        const pName = (prod.product_name || "").toLowerCase().trim();
        const nameMatch = cpName && pName && (cpName === pName || cpName.includes(pName) || pName.includes(cpName));
        return idMatch || nameMatch;
      });

      if (custom) {
        if (custom.monthly_price !== '' && custom.monthly_price !== null && !isNaN(parseFloat(custom.monthly_price)) && parseFloat(custom.monthly_price) > 0) {
          monthlyRate = parseFloat(custom.monthly_price);
        }
        if (custom.annually_price !== '' && custom.annually_price !== null && !isNaN(parseFloat(custom.annually_price)) && parseFloat(custom.annually_price) > 0) {
          annualRate = parseFloat(custom.annually_price);
        } else {
          annualRate = monthlyRate * 10.8;
        }
        if (custom.triennially_price !== '' && custom.triennially_price !== null && !isNaN(parseFloat(custom.triennially_price)) && parseFloat(custom.triennially_price) > 0) {
          triennialRate = parseFloat(custom.triennially_price);
        } else {
          triennialRate = monthlyRate * 28.8;
        }
      }
    }

    if (cycleMonths === 36) return { effectiveMonthly: Math.round(triennialRate / 36), total: triennialRate };
    if (cycleMonths === 12) return { effectiveMonthly: Math.round(annualRate / 12), total: annualRate };
    return { effectiveMonthly: Math.round(monthlyRate), total: monthlyRate };
  };

  // Filtered Products by Tab & Search Query
  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      const pName = p.product_name.toLowerCase();
      const matchesSearch = !searchQuery || pName.includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      if (selectedProviderTab === "all") return true;
      if (selectedProviderTab === "google") return pName.includes("google");
      if (selectedProviderTab === "microsoft") return pName.includes("microsoft");
      return !pName.includes("google") && !pName.includes("microsoft");
    });
  }, [productsList, selectedProviderTab, searchQuery]);

  // Handle Reseller Client Select Change
  const handleClientSelectChange = (clientId) => {
    setSelectedClientId(clientId);
    const c = resellerClients.find(cl => cl.id.toString() === clientId.toString());
    if (c) {
      setClientEmail(c.email || "");
      setFirstName(c.full_name || "");
      setClientDomain(c.domain_name || "");
      setCompanyName(c.company_name || "");
      setClientPhone(c.phone || "");
    }
  };

  // Open Full Page Checkout View
  const handleOpenCheckout = (prod, cycleMonths) => {
    setSelectedProduct(prod);
    setOrderCycleMonths(cycleMonths || 12);
    setSeatCount(1);
    setCheckoutSubStep(1);
    setOrderComplete(false);
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Apply Coupon Code
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "DEAL10") {
      setAppliedCoupon({ code: "DEAL10", discountPercent: 10 });
      toast.success("10% Coupon DEAL10 Applied!");
    } else if (couponCode.trim() !== "") {
      toast.error("Invalid coupon code.");
    }
  };

  // Submit Order Handler
  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (!clientDomain.trim() || !clientDomain.includes(".")) {
      toast.error("Valid Business Domain Name is required (e.g. mycompany.com).");
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes("@")) {
      toast.error("Valid Contact Email Address is required.");
      return;
    }

    // Password validation only for guest non-reseller customer signups
    if (!isReseller && !activeUser.email) {
      if (!password || password.length < 6) {
        toast.error("Account Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const priceInfo = calculateProductPrice(selectedProduct, orderCycleMonths);
      let subtotal = priceInfo.total * seatCount;
      if (appliedCoupon) {
        subtotal = subtotal * (1 - appliedCoupon.discountPercent / 100);
      }
      const gstTax = subtotal * 0.18;
      const grandTotal = (subtotal + gstTax).toFixed(2);
      const invNum = `INV-RES-${Math.floor(100000 + Math.random() * 900000)}`;

      const resellerUserEmail = (activeUser.email || activeUser.username || "").trim();

      const orderPayload = {
        invoice_number: invNum,
        client_name: `${firstName} ${lastName}`.trim() || clientEmail.split("@")[0],
        client_email: clientEmail,
        password: password,
        product_name: selectedProduct.product_name,
        group_name: selectedProduct.product_group_name || 'Business Email',
        domain_name: clientDomain,
        billing_cycle: `${orderCycleMonths} Month${orderCycleMonths > 1 ? 's' : ''}`,
        amount: grandTotal,
        payment_method: paymentMethod === 'reseller_portal' ? 'Reseller Portal' : paymentMethod,
        reseller_email: isReseller ? resellerUserEmail : ''
      };

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const json = await res.json();

      if (json.success || res.ok) {
        setOrderInvoiceId(invNum);
        setOrderComplete(true);
        toast.success("Order placed successfully! Invoice & services activated.");
      } else {
        toast.error(json.message || "Failed to place order.");
      }
    } catch (err) {
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-white font-sans">
        <div className="w-12 h-12 border-4 border-[#0067ED] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Loading Enterprise Catalog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-[#0067ED] selection:text-white antialiased">
      
      {/* Dedicated JustEmail Cloud Navbar */}
      <JustEmailNavbar />

      {/* =========================================================================
          PAGE VIEW 1: STOREFRONT CATALOG (HERO + CARDS + FAQS)
         ========================================================================= */}
      {checkoutStep === 1 && (
        <>
          {/* SECTION 1: HIGH-IMPACT HERO BANNER (#0B1437 Deep Midnight Gradient) */}
          <section className="bg-gradient-to-b from-slate-950 via-[#0B1437] to-slate-950 text-white py-16 px-4 sm:px-8 border-b border-slate-800/80 relative overflow-hidden font-sans">
            <div className="absolute top-[20%] left-[15%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#0067ED]/20 rounded-full blur-[140px] pointer-events-none z-0" />
            <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
              
              {/* Left Hero Content */}
              <div className="space-y-5 text-center lg:text-left lg:max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 text-xs font-extrabold uppercase tracking-wider shadow-inner">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Official Enterprise Business Email & Storage Deployment</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                  Professional Business Email <br />
                  <span className="bg-gradient-to-r from-blue-400 via-[#0067ED] to-teal-400 bg-clip-text text-transparent">
                    For Your Domain Name
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                  Premier partner for <strong>Google Workspace</strong>, <strong>Microsoft 365</strong>, and <strong>JustEmail Enterprise Cloud</strong>. Zero-downtime IMAP migration, automated MX/SPF/DKIM setup, 99.99% uptime guarantee, and 24/7 engineering support.
                </p>

                {/* Key Highlights Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>99.99% Uptime SLA</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Free IMAP Migration</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Headphones className="w-4 h-4 text-[#0067ED] shrink-0" />
                    <span>24/7/365 Support</span>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <a
                    href="#catalog-plans"
                    className="bg-[#0067ED] hover:bg-blue-600 text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs flex items-center gap-2.5 shadow-xl shadow-blue-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <span>View Email Plans & Pricing</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-2xl text-xs font-bold text-slate-300">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Govt. Registered IT Enterprise</span>
                  </div>
                </div>
              </div>

              {/* Right Floating 3D Showcase */}
              <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative">
                <div className="relative group w-full max-w-lg">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#0067ED] to-teal-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  
                  <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden">
                    <img
                      src="/images/business-email-3d.png"
                      alt="Business Email Cloud 3D"
                      className="w-full h-auto object-contain transform group-hover:scale-[1.02] transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/BusinessEmail.png";
                      }}
                    />

                    <div className="absolute top-6 left-6 bg-slate-950/90 border border-slate-800 text-white text-[11px] font-extrabold px-3.5 py-2 rounded-xl backdrop-blur-md shadow-xl flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>99.99% Guaranteed SLA</span>
                    </div>

                    <div className="absolute bottom-6 right-6 bg-slate-950/90 border border-slate-800 text-white text-[11px] font-extrabold px-3.5 py-2 rounded-xl backdrop-blur-md shadow-xl flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Zero-Downtime Migration</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 bg-slate-900/60 border border-slate-800/80 px-6 py-3 rounded-2xl text-xs backdrop-blur-md">
                  <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Certified Suites:</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-bold text-slate-200">
                      <img src="/images/google-workspace.png" alt="Google" className="w-4 h-4 object-contain" />
                      <span>Google Workspace</span>
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-200">
                      <img src="/images/microsoft-365.png" alt="Microsoft" className="w-4 h-4 object-contain" />
                      <span>Microsoft 365</span>
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-200">
                      <img src="/images/justemail_png.png" alt="JustEmail" className="w-4 h-4 object-contain" />
                      <span>JustEmail Cloud</span>
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 2: CATALOG PLAN CARDS GRID */}
          <main id="catalog-plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 w-full flex-1 font-sans">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <button
                  onClick={() => setSelectedProviderTab("all")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    selectedProviderTab === "all"
                      ? "bg-[#0B1437] text-white shadow-md"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  All Provider Plans ({productsList.length})
                </button>

                <button
                  onClick={() => setSelectedProviderTab("google")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedProviderTab === "google"
                      ? "bg-[#0B1437] text-white shadow-md"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <img src="/images/google-workspace.png" alt="Google" className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} />
                  <span>Google Workspace</span>
                </button>

                <button
                  onClick={() => setSelectedProviderTab("microsoft")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedProviderTab === "microsoft"
                      ? "bg-[#0B1437] text-white shadow-md"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <img src="/images/microsoft-365.png" alt="Microsoft" className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} />
                  <span>Microsoft 365</span>
                </button>
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search plans & providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0067ED]"
                />
              </div>
            </div>

            {isReseller && (
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between text-xs font-semibold text-amber-900 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Reseller Partner Active:</strong> Wholesale custom pricing automatically applied.</span>
                </div>
                <span className="font-extrabold text-[#0067ED] font-mono bg-amber-100/80 px-2.5 py-1 rounded-md border border-amber-300/60">{activeUser.email}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-sans">
              {filteredProducts.map((prod, index) => {
                const currentCycle = cardCycles[prod.id] || 12;
                const priceInfo = calculateProductPrice(prod, currentCycle);
                const isPopular = index === 0 || prod.product_name.toLowerCase().includes("starter");
                const isGoogle = prod.product_name.toLowerCase().includes("google");
                const isMicrosoft = prod.product_name.toLowerCase().includes("microsoft");

                return (
                  <div
                    key={prod.id || index}
                    className={`bg-white border rounded-3xl p-7 shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${
                      isPopular ? "border-[#0067ED] ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-[#0067ED] to-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-bl-2xl shadow-sm">
                        ★ Popular Choice
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2.5 shadow-inner">
                          {isGoogle ? (
                            <img src="/images/google-workspace.png" alt="Google" className="w-8 h-8 object-contain" />
                          ) : isMicrosoft ? (
                            <img src="/images/microsoft-365.png" alt="Microsoft" className="w-8 h-8 object-contain" />
                          ) : (
                            <img src="/images/justemail_png.png" alt="JustEmail" className="w-8 h-8 object-contain" />
                          )}
                        </div>

                        <span className="text-[10px] font-extrabold bg-blue-50 text-[#0067ED] border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
                          {prod.product_group_name || 'Business Email'}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-slate-900 group-hover:text-[#0067ED] transition-colors leading-snug">
                        {prod.product_name}
                      </h3>

                      <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-bold text-slate-700 flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-[#0067ED] shrink-0" />
                        <span>{isGoogle && prod.product_name.includes("Standard") ? "2 TB Storage / Mailbox" : "30 GB Storage / Mailbox"}</span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Select Billing Term</label>
                        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
                          <button
                            type="button"
                            onClick={() => setCardCycles({ ...cardCycles, [prod.id]: 1 })}
                            className={`py-1.5 px-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                              currentCycle === 1 ? "bg-[#0B1437] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            1 Month
                          </button>

                          <button
                            type="button"
                            onClick={() => setCardCycles({ ...cardCycles, [prod.id]: 12 })}
                            className={`py-1.5 px-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer relative ${
                              currentCycle === 12 ? "bg-[#0B1437] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            1 Year
                          </button>

                          <button
                            type="button"
                            onClick={() => setCardCycles({ ...cardCycles, [prod.id]: 36 })}
                            className={`py-1.5 px-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer relative ${
                              currentCycle === 36 ? "bg-[#0B1437] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            3 Years
                          </button>
                        </div>
                      </div>

                      <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Custom Business Email (name@domain.com)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Google Meet / MS Teams Video Meetings</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>99.99% Uptime Guarantee SLA</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Automated MX, DKIM, & SPF Setup</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-2xl font-black text-slate-900">
                          ₹{priceInfo.effectiveMonthly}
                          <span className="text-xs font-medium text-slate-500"> /mo</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">
                          {currentCycle === 36
                            ? `₹${priceInfo.total.toFixed(0)} billed every 3 yrs`
                            : currentCycle === 12
                            ? `₹${priceInfo.total.toFixed(0)} billed annually`
                            : "Billed monthly"}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenCheckout(prod, currentCycle)}
                        className="bg-[#0B1437] hover:bg-[#0067ED] text-white font-extrabold px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <span>Order Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* FEATURES GRID & FAQS */}
            <section className="pt-12 border-t border-slate-200/90 font-sans">
              <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Enterprise Features Built for Business Growth
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Unified email management, zero-downtime migration workflows, and bulletproof security SLA.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-3 hover:border-blue-500/30 transition-colors">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0067ED] flex items-center justify-center border border-blue-100 shadow-inner">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">99.99% Uptime Guarantee SLA</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Guaranteed high-availability email server infrastructure backed by strict service level agreements.
                  </p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-3 hover:border-emerald-500/30 transition-colors">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">Anti-Spam & Threat Defense</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Multi-layer spam filtering, malware protection, and automated DKIM/SPF DNS security signatures.
                  </p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-3 hover:border-amber-500/30 transition-colors">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-inner">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">Free Automated IMAP Migration</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Zero downtime migration tools to switch from legacy webmail or cPanel servers seamlessly.
                  </p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-3 hover:border-purple-500/30 transition-colors">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-inner">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">Custom Domain Identity</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Professional email addresses matching your business domain name (yourname@company.com).
                  </p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-3 hover:border-indigo-500/30 transition-colors">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">Unified Admin Console</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Centralized management for user mailboxes, domain names, billing cycles, and client profiles.
                  </p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-3 hover:border-rose-500/30 transition-colors">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-inner">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">24/7/365 Direct Support</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Dedicated email system engineers on standby via phone, live chat, and WHMCS support tickets.
                  </p>
                </div>
              </div>
            </section>

            <section className="pt-12 border-t border-slate-200/90 max-w-4xl mx-auto font-sans">
              <div className="text-center mb-8 space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Everything you need to know about Google Workspace & Microsoft 365 deployment.</p>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    q: "How does automated DNS setup work for Google Workspace & Microsoft 365?",
                    a: "Once your order is placed, our system generates the exact MX, DKIM, and SPF records needed for your domain name. You can copy-paste them or request our technical team to configure them for you with zero downtime."
                  },
                  {
                    q: "Can I upgrade my mailbox seats or plan duration later?",
                    a: "Yes! You can add more mailbox seats or upgrade your billing cycle (e.g. from 1 Month to 1 Year or 3 Years) at any time directly through your portal dashboard."
                  },
                  {
                    q: "Do resellers get special wholesale pricing?",
                    a: "Absolutely. Registered Reseller Partner accounts get custom wholesale rates across all products, along with internal client management and branded order placement."
                  },
                  {
                    q: "Is there any email loss during migration from legacy webmail?",
                    a: "No. Our migration workflow uses IMAP synchronization, ensuring 100% of your historical emails, folders, and attachments are copied over safely before DNS switchover."
                  }
                ].map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs font-sans">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-5 text-left flex items-center justify-between font-extrabold text-slate-900 text-xs sm:text-sm cursor-pointer hover:bg-slate-50/60 transition-colors"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-[#0067ED]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 text-xs text-slate-600 font-medium border-t border-slate-100 pt-3.5 leading-relaxed bg-slate-50/40">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </main>
        </>
      )}

      {/* =========================================================================
          PAGE VIEW 2: MILESWEB DEDICATED 2-COLUMN FULL-PAGE CHECKOUT
         ========================================================================= */}
      {checkoutStep === 2 && selectedProduct && (
        <div className="min-h-screen bg-slate-100/70 font-sans pb-20 pt-6">
          
          {/* Top Trust Header Bar */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setCheckoutStep(1)}
                className="text-xs font-extrabold text-slate-600 hover:text-[#0067ED] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Store Catalog</span>
              </button>

              <div className="flex items-center gap-6 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span><strong>Google 4.9/5</strong> (7,111+ Reviews)</span>
                </div>
                <span className="hidden md:inline text-slate-300">•</span>
                <span className="hidden md:inline">Trusted by <strong>1M+ Domain Owners</strong></span>
                <span className="hidden md:inline text-slate-300">•</span>
                <span className="hidden md:inline">Indian IT Enterprise since 2012</span>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {orderComplete ? (
              /* Success Receipt View */
              <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-xl text-center space-y-5 max-w-xl mx-auto">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200 text-emerald-600 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-black text-slate-900">Order Placed & Activated!</h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  WHMCS Invoice <strong className="text-[#0067ED] font-mono">{orderInvoiceId}</strong> created for client <strong className="text-slate-800">{clientEmail}</strong>. Services & DNS records initialized.
                </p>

                <div className="flex justify-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (isReseller) navigate("/reseller/dashboard");
                      else navigate("/user/home");
                    }}
                    className="bg-[#0067ED] hover:bg-blue-700 text-white font-extrabold px-8 py-3.5 rounded-xl text-xs cursor-pointer shadow-md transition-all"
                  >
                    Go to Portal Dashboard →
                  </button>
                </div>
              </div>
            ) : (
              /* 2-Column MilesWeb Checkout Layout */
              <form onSubmit={handlePlaceOrderSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* =========================================================================
                    LEFT COLUMN (8 COLS): CONFIGURATION & CUSTOMER SPECIFICATION CARDS
                   ========================================================================= */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* CARD 1: SELECTED PLAN & DURATION */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-2.5">
                          {selectedProduct.product_name.toLowerCase().includes("google") ? (
                            <img src="/images/google-workspace.png" alt="Google" className="w-7 h-7 object-contain" />
                          ) : selectedProduct.product_name.toLowerCase().includes("microsoft") ? (
                            <img src="/images/microsoft-365.png" alt="Microsoft" className="w-7 h-7 object-contain" />
                          ) : (
                            <img src="/images/justemail_png.png" alt="JustEmail" className="w-7 h-7 object-contain" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900">{selectedProduct.product_name}</h3>
                          <span className="text-[10px] font-extrabold text-[#0067ED] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase">
                            {selectedProduct.product_group_name || 'Business Email'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">
                          ₹{calculateProductPrice(selectedProduct, orderCycleMonths).effectiveMonthly}
                          <span className="text-xs font-medium text-slate-500"> /mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Plan Duration Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Plan Duration</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          orderCycleMonths === 1 ? "bg-blue-50/70 border-[#0067ED] ring-2 ring-blue-500/20" : "bg-slate-50 border-slate-200"
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <input
                              type="radio"
                              name="orderCycle"
                              checked={orderCycleMonths === 1}
                              onChange={() => setOrderCycleMonths(1)}
                              className="text-[#0067ED]"
                            />
                            <span className="text-[10px] font-bold text-slate-500">1 Month</span>
                          </div>
                          <div className="text-sm font-black text-slate-900">₹{calculateProductPrice(selectedProduct, 1).effectiveMonthly}<span className="text-[10px] text-slate-500 font-normal">/mo</span></div>
                        </label>

                        <label className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                          orderCycleMonths === 12 ? "bg-blue-50/70 border-[#0067ED] ring-2 ring-blue-500/20" : "bg-slate-50 border-slate-200"
                        }`}>
                          <span className="absolute -top-2.5 right-3 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Save 10%</span>
                          <div className="flex items-center justify-between mb-1">
                            <input
                              type="radio"
                              name="orderCycle"
                              checked={orderCycleMonths === 12}
                              onChange={() => setOrderCycleMonths(12)}
                              className="text-[#0067ED]"
                            />
                            <span className="text-[10px] font-bold text-slate-500">12 Months (1 Yr)</span>
                          </div>
                          <div className="text-sm font-black text-slate-900">₹{calculateProductPrice(selectedProduct, 12).effectiveMonthly}<span className="text-[10px] text-slate-500 font-normal">/mo</span></div>
                        </label>

                        <label className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                          orderCycleMonths === 36 ? "bg-blue-50/70 border-[#0067ED] ring-2 ring-blue-500/20" : "bg-slate-50 border-slate-200"
                        }`}>
                          <span className="absolute -top-2.5 right-3 bg-[#0067ED] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Save 20%</span>
                          <div className="flex items-center justify-between mb-1">
                            <input
                              type="radio"
                              name="orderCycle"
                              checked={orderCycleMonths === 36}
                              onChange={() => setOrderCycleMonths(36)}
                              className="text-[#0067ED]"
                            />
                            <span className="text-[10px] font-bold text-slate-500">36 Months (3 Yrs)</span>
                          </div>
                          <div className="text-sm font-black text-slate-900">₹{calculateProductPrice(selectedProduct, 36).effectiveMonthly}<span className="text-[10px] text-slate-500 font-normal">/mo</span></div>
                        </label>
                      </div>
                    </div>

                    {/* Mailbox Quantity Seats */}
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Mailbox Licenses (Seats)</div>
                        <div className="text-[10px] text-slate-500 font-medium">Number of individual user email accounts</div>
                      </div>

                      <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                          className="px-3.5 py-2 bg-slate-100 font-bold text-slate-700 cursor-pointer hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="px-4 font-black text-slate-900 font-mono text-xs">
                          {seatCount} {seatCount === 1 ? 'Seat' : 'Seats'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSeatCount(seatCount + 1)}
                          className="px-3.5 py-2 bg-slate-100 font-bold text-slate-700 cursor-pointer hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* MilesWeb Free Domain / Migration Highlight */}
                    <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold text-emerald-900">
                      <Gift className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span><strong>Good news!</strong> You get <strong>100% Free IMAP Migration</strong> + <strong>Automated MX/DKIM DNS Setup</strong> included at no extra cost.</span>
                    </div>
                  </div>

                  {/* CARD 2: DOMAIN SETUP */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Globe className="w-5 h-5 text-[#0067ED]" />
                      <h3 className="text-base font-black text-slate-900">Target Business Domain</h3>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Enter your business domain *</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="mycompany.com"
                          value={clientDomain}
                          onChange={(e) => setClientDomain(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#0067ED]"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">Your email addresses will be created on this domain (e.g. name@{clientDomain || 'mycompany.com'}).</p>
                    </div>
                  </div>

                  {/* CARD 3: CUSTOMER / RESELLER CLIENT DETAILS & ADDRESS SPECIFICATION */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#0067ED]" />
                        <h3 className="text-base font-black text-slate-900">Account & Billing Details</h3>
                      </div>

                      {/* Reseller Client Quick Select Toggle */}
                      {isReseller && resellerClients.length > 0 && (
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setClientSelectionMode("existing")}
                            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                              clientSelectionMode === "existing" ? "bg-[#0067ED] text-white shadow-xs" : "text-slate-700"
                            }`}
                          >
                            Existing Client
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setClientSelectionMode("new");
                              setClientEmail("");
                              setFirstName("");
                              setLastName("");
                              setClientDomain("");
                              setCompanyName("");
                            }}
                            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                              clientSelectionMode === "new" ? "bg-[#0067ED] text-white shadow-xs" : "text-slate-700"
                            }`}
                          >
                            + New Profile
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Non-Reseller Customer Account State Banner */}
                    {!isReseller && (
                      activeUser.email ? (
                        <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 flex items-center justify-between text-xs font-semibold text-slate-900 shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#0067ED] text-white font-black flex items-center justify-center text-sm shadow-xs">
                              {(activeUser.name || activeUser.email || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900">Logged in as {activeUser.name || activeUser.email}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{activeUser.email}</div>
                            </div>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                            Active Session
                          </span>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-[#0067ED]" />
                            <span>Already have an account?</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="text-[#0067ED] hover:underline font-extrabold cursor-pointer"
                          >
                            Sign In →
                          </button>
                        </div>
                      )
                    )}

                    {/* Quick Select Client Dropdown */}
                    {isReseller && clientSelectionMode === "existing" && resellerClients.length > 0 && (
                      <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-[#0067ED] uppercase tracking-wider">Select Reseller Managed Client *</label>
                        <select
                          value={selectedClientId}
                          onChange={(e) => handleClientSelectChange(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0067ED]"
                        >
                          {resellerClients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.full_name} ({c.email}) {c.company_name ? `- ${c.company_name}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Customer Specification Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0067ED]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0067ED]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="john@company.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0067ED]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0067ED]"
                        />
                      </div>

                      {!isReseller && !activeUser.email && (
                        <>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Account Password *</label>
                            <input
                              type="password"
                              required
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0067ED]"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Confirm Password *</label>
                            <input
                              type="password"
                              required
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0067ED]"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          placeholder="Mumbai"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0067ED]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Postcode / Pin Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="400001"
                          value={postcode}
                          onChange={(e) => setPostcode(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0067ED]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-xs">GSTIN (Optional for tax invoice credit)</label>
                      <input
                        type="text"
                        placeholder="27AAAAA0000A1Z5"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#0067ED]"
                      />
                    </div>
                  </div>

                </div>

                {/* =========================================================================
                    RIGHT COLUMN (5 COLS): MILESWEB STICKY ORDER SUMMARY & PAYMENT
                   ========================================================================= */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                  
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
                    <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">Order Summary</h3>

                    {/* Summary Items */}
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-extrabold text-slate-900">{selectedProduct.product_name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {orderCycleMonths === 36 ? '36-Month Plan' : orderCycleMonths === 12 ? '12-Month Plan' : '1-Month Plan'} ({seatCount} Seat{seatCount > 1 ? 's' : ''})
                          </div>
                        </div>
                        <div className="font-extrabold text-slate-900">
                          ₹{(calculateProductPrice(selectedProduct, orderCycleMonths).total * seatCount).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-emerald-600 font-semibold">
                        <span>+ 100% Free IMAP Migration Setup</span>
                        <span className="font-extrabold">₹0.00</span>
                      </div>

                      <div className="flex justify-between items-center text-emerald-600 font-semibold">
                        <span>+ Automated MX/SPF/DKIM DNS Setup</span>
                        <span className="font-extrabold">₹0.00</span>
                      </div>

                      <div className="flex justify-between items-center text-slate-600 font-semibold pt-2 border-t border-slate-100">
                        <span>GST Tax (18%)</span>
                        <span>₹{((calculateProductPrice(selectedProduct, orderCycleMonths).total * seatCount) * 0.18).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Coupon Code Section */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      {appliedCoupon ? (
                        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-700">
                          <span>Coupon {appliedCoupon.code} Applied (-10%)</span>
                          <button type="button" onClick={() => setAppliedCoupon(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Have a coupon code? (e.g. DEAL10)"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold uppercase text-slate-900 focus:outline-none focus:border-[#0067ED]"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="bg-slate-900 hover:bg-black text-white font-extrabold px-3.5 py-2 rounded-xl text-xs cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Grand Total Display */}
                    {(() => {
                      let subtotal = calculateProductPrice(selectedProduct, orderCycleMonths).total * seatCount;
                      if (appliedCoupon) subtotal = subtotal * (1 - appliedCoupon.discountPercent / 100);
                      const gstTax = subtotal * 0.18;
                      const grandTotal = subtotal + gstTax;

                      return (
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-base font-black text-slate-900">Total</span>
                          <div className="text-right">
                            <div className="text-2xl font-black text-[#0067ED]">₹{grandTotal.toFixed(2)}</div>
                            <div className="text-[10px] text-slate-400 font-medium">Includes 18% GST Tax</div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Payment Method Selector inside Summary Card */}
                    <div className="pt-2 space-y-2">
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Select Payment Channel</label>
                      
                      {isReseller && (
                        <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                          paymentMethod === "reseller_portal" ? "bg-blue-50 border-[#0067ED]" : "bg-slate-50 border-slate-200"
                        }`}>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                            <input
                              type="radio"
                              name="summaryPayment"
                              checked={paymentMethod === "reseller_portal"}
                              onChange={() => setPaymentMethod("reseller_portal")}
                            />
                            <span>Reseller Wholesale Credit</span>
                          </div>
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">Instant</span>
                        </label>
                      )}

                      <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                        paymentMethod === "upi" ? "bg-blue-50 border-[#0067ED]" : "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                          <input
                            type="radio"
                            name="summaryPayment"
                            checked={paymentMethod === "upi"}
                            onChange={() => setPaymentMethod("upi")}
                          />
                          <span>UPI / QR Code / NetBanking</span>
                        </div>
                      </label>
                    </div>

                    {/* Action Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#0067ED] hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-xs cursor-pointer shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Processing Order..." : "Continue to Secure Payment →"}
                    </button>

                    {/* Trust Guarantees */}
                    <div className="pt-2 text-center space-y-2">
                      <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>30-Day Money-Back Guarantee</span>
                      </div>

                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">100% Secure Payment Partners</div>
                      <div className="flex items-center justify-center gap-2 pt-1 opacity-80">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-700">VISA</span>
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-700">Mastercard</span>
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-700">RuPay</span>
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-700">UPI</span>
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-700">GPay</span>
                      </div>
                    </div>

                  </div>

                </div>

              </form>
            )}
          </div>

        </div>
      )}

      {/* Dedicated JustEmail Footer */}
      <JustEmailFooter />
    </div>
  );
}
