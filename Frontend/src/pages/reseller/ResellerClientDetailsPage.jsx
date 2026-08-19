import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import {
  getResellerClients,
  getResellerClientOrders,
  createResellerClientOrder,
  deleteResellerClient
} from '../../api/resellerMasterApi';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Globe, 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  X,
  Trash2,
  Building2,
  CreditCard,
  Tag,
  Mail,
  Phone,
  Calendar,
  Plus
} from 'lucide-react';

export default function ResellerClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Active Reseller User Helper
  const getLoggedInReseller = () => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch (e) { return {}; }
  };

  const activeUser = getLoggedInReseller();
  const resellerEmail = (activeUser.email || activeUser.username || '').trim();

  const [client, setClient] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');

  // Order Product for Client Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    client_email: '',
    client_name: '',
    product_name: 'Google Workspace Starter',
    group_name: 'Business Email',
    domain_name: '',
    billing_cycle: '1 Month',
    amount: '270'
  });
  const [placingOrder, setPlacingOrder] = useState(false);

  // Fetch Client & Orders Data & Catalog Products
  const loadClientData = async () => {
    setLoading(true);
    try {
      const currentEmail = (getLoggedInReseller().email || getLoggedInReseller().username || '').trim();
      const [clientsRes, ordersRes, prodsRes] = await Promise.all([
        getResellerClients(currentEmail).catch(() => null),
        getResellerClientOrders(currentEmail).catch(() => null),
        fetch("http://localhost:5000/api/product-master").then(r => r.json()).catch(() => null)
      ]);

      if (prodsRes && prodsRes.success && prodsRes.data) {
        setProductsList(prodsRes.data);
      }

      let foundClient = null;
      if (clientsRes?.data?.success && clientsRes.data.data) {
        foundClient = clientsRes.data.data.find(c => c.id.toString() === id.toString() || c.customer_code === id);
      } else if (Array.isArray(clientsRes?.data)) {
        foundClient = clientsRes.data.find(c => c.id.toString() === id.toString() || c.customer_code === id);
      }

      setClient(foundClient || null);

      if (foundClient && ordersRes?.data?.success) {
        const cEmail = (foundClient.email || '').toLowerCase().trim();
        const matchedOrders = (ordersRes.data.data || []).filter(o => 
          o.client_email && o.client_email.toLowerCase().trim() === cEmail
        );
        setClientOrders(matchedOrders);
      }
    } catch (err) {
      console.error("Failed to load client details", err);
      toast.error("Failed to load client profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientData();
  }, [id, resellerEmail]);

  // Delete Client Handler
  const handleDeleteClient = async () => {
    if (!client) return;
    if (!window.confirm(`Are you sure you want to delete client account "${client.full_name}"?`)) return;
    try {
      const res = await deleteResellerClient(client.id);
      if (res.data?.success) {
        toast.success("Client account deleted successfully!");
        navigate("/reseller/dashboard");
      } else {
        toast.error(res.data?.message || "Failed to delete client.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete client account.");
    }
  };

  // Place Order Submit Handler
  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (!newOrderData.domain_name.trim() || !newOrderData.domain_name.includes(".")) {
      toast.error("Domain Name is mandatory (e.g. company.com).");
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        ...newOrderData,
        client_email: client.email,
        client_name: client.full_name,
        reseller_email: resellerEmail
      };
      const res = await createResellerClientOrder(payload);
      if (res.data?.success) {
        toast.success("Order placed successfully for client!");
        setShowOrderModal(false);
        loadClientData();
      } else {
        toast.error(res.data?.message || "Failed to place order.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Filtered Orders for this Client based on search
  const filteredOrders = useMemo(() => {
    if (!productSearch.trim()) return clientOrders;
    const q = productSearch.toLowerCase().trim();
    return clientOrders.filter(o => 
      (o.product_name && o.product_name.toLowerCase().includes(q)) ||
      (o.domain_name && o.domain_name.toLowerCase().includes(q)) ||
      (o.invoice_number && o.invoice_number.toLowerCase().includes(q))
    );
  }, [clientOrders, productSearch]);

  // Grouped Orders by Domain Name
  const groupedOrdersByDomain = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return {};
    const groups = {};
    filteredOrders.forEach(ord => {
      const dKey = (ord.domain_name && ord.domain_name.trim()) ? ord.domain_name.trim() : (client?.domain_name || "General Domain");
      if (!groups[dKey]) {
        groups[dKey] = [];
      }
      groups[dKey].push(ord);
    });
    return groups;
  }, [filteredOrders, client]);

  // Total Client Spend
  const totalClientSpend = useMemo(() => {
    return clientOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
  }, [clientOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar title="Client Profile Details" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#0056cf] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm font-semibold">Loading client profile details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar title="Client Profile Not Found" />
        <div className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">
          <button
            onClick={() => navigate("/reseller/dashboard")}
            className="text-xs font-bold text-[#0056cf] flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Reseller Dashboard</span>
          </button>
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
            <h2 className="text-xl font-extrabold text-slate-900">Client Profile Not Found</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">The requested client profile ID could not be found under your reseller account.</p>
            <button
              onClick={() => navigate("/reseller/dashboard")}
              className="bg-[#0056cf] hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-md"
            >
              Return to Reseller Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Universal Header */}
      <Navbar title={`Client Profile: ${client.full_name}`} />

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Back Navigation & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/reseller/dashboard")}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-[#0056cf]" />
              <span>Back to Reseller Dashboard</span>
            </button>
            <div>
              <span className="text-xs font-extrabold text-[#0056cf] uppercase tracking-wider block">{client.customer_code}</span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{client.full_name}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setNewOrderData({
                  client_email: client.email,
                  client_name: client.full_name,
                  product_name: 'Google Workspace Starter',
                  group_name: 'Business Email',
                  domain_name: client.domain_name || '',
                  billing_cycle: '1 Month',
                  amount: '270'
                });
                setShowOrderModal(true);
              }}
              className="bg-[#0056cf] hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Assign Product Plan</span>
            </button>

            <button
              onClick={() => navigate("/store")}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-[#0056cf]" />
              <span>Browse Store</span>
            </button>

            <button
              onClick={handleDeleteClient}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="Delete Client"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Client</span>
            </button>
          </div>
        </div>

        {/* CLIENT INFORMATION STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Email Address</span>
            <div className="font-extrabold text-slate-900 text-xs truncate flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0056cf] shrink-0" />
              <span>{client.email}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Primary Domain Name</span>
            <div className="font-extrabold text-[#0056cf] text-xs truncate flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0056cf] shrink-0" />
              <span>{client.domain_name || 'N/A'}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Phone & Company</span>
            <div className="font-bold text-slate-800 text-xs truncate flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{client.company_name || 'Individual'} ({client.phone || 'N/A'})</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Total Client Orders & Spend</span>
            <div className="font-extrabold text-emerald-700 text-xs flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{clientOrders.length} Plans | ₹{totalClientSpend.toFixed(2)} Total</span>
            </div>
          </div>
        </div>

        {/* DOMAIN-GROUPED PRODUCTS & EXPIRY DATES SECTION */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#0056cf]" />
                <span>Assigned Products & Expiry Dates Grouped by Domain Name</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Active business plans, billing cycles, order purchase prices, and renewal dates.</p>
            </div>

            {/* Dedicated Search Input for Client Products */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search products or domain names..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0056cf]"
              />
              {productSearch && (
                <button
                  onClick={() => setProductSearch('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {Object.keys(groupedOrdersByDomain).length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 p-10 text-center rounded-2xl space-y-3">
              <p className="text-xs font-bold text-slate-700">No Purchased Plans Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Click "+ Assign Product Plan" above to add business email or hosting services for this client.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedOrdersByDomain).map(([domainKey, ordersList], dIdx) => (
                <div key={dIdx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  {/* Domain Name Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-[#0056cf]" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Domain Name:</span>
                      <span className="text-sm font-extrabold text-[#0056cf] bg-blue-100/70 px-3 py-1 rounded-md border border-blue-200">{domainKey}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full">
                      {ordersList.length} Active Plan{ordersList.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Purchased Plans List under this Domain */}
                  <div className="space-y-3">
                    {ordersList.map((ord, i) => {
                      const pDate = new Date(ord.created_at || Date.now());
                      const cycleMonths = parseInt(ord.billing_cycle) || (ord.billing_cycle && ord.billing_cycle.includes('12') ? 12 : 1);
                      const expiryDate = new Date(pDate);
                      expiryDate.setMonth(expiryDate.getMonth() + cycleMonths);
                      const orderPrice = parseFloat(ord.amount || 0).toFixed(2);

                      return (
                        <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-2xs hover:border-blue-200 transition-all">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-slate-900 text-sm tracking-tight">{ord.product_name}</span>
                              <span className="text-[10px] font-extrabold bg-blue-50 text-[#0056cf] border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {ord.group_name || 'Business Email'}
                              </span>
                            </div>
                            <div className="text-slate-500 font-medium text-[11px] flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span>Invoice Number: <strong className="text-slate-800 font-mono">{ord.invoice_number}</strong></span>
                              <span>Billing Cycle: <strong className="text-slate-800">{ord.billing_cycle || '1 Month'}</strong></span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-left md:text-right border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Order Price</span>
                              <span className="font-black text-slate-900 text-sm">₹{orderPrice}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Purchase Date</span>
                              <span className="font-semibold text-slate-700 text-xs whitespace-nowrap">
                                {pDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Expiry Date</span>
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs inline-block whitespace-nowrap shadow-2xs">
                                {expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* ORDER PRODUCT MODAL FOR THIS CLIENT */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Assign Product Plan to {client.full_name}</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Select plan and domain name. Purchase and expiry dates will be activated.</p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrderSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product / Plan *</label>
                <select
                  value={newOrderData.product_name}
                  onChange={(e) => {
                    const selectedProd = (productsList.length > 0 ? productsList : [
                      { product_name: 'Google Workspace Starter', product_group_name: 'Google Business Emails', monthly_price: '270' },
                      { product_name: 'Google Workspace Standard', product_group_name: 'Google Business Emails', monthly_price: '865' },
                      { product_name: 'Microsoft 365 Business Basic', product_group_name: 'Microsoft 365 Email', monthly_price: '120' },
                      { product_name: 'JustEmail Enterprise Cloud', product_group_name: 'Cloud Hosting', monthly_price: '500' }
                    ]).find(p => p.product_name === e.target.value);

                    const mRate = selectedProd ? parseFloat(selectedProd.monthly_price || '270') : 270;
                    const mult = newOrderData.billing_cycle.includes('12') ? 12 : newOrderData.billing_cycle.includes('36') ? 36 : 1;

                    setNewOrderData({
                      ...newOrderData,
                      product_name: e.target.value,
                      group_name: selectedProd ? (selectedProd.product_group_name || 'Business Email') : 'Business Email',
                      amount: (mRate * mult).toFixed(2)
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf]"
                >
                  {(productsList.length > 0 ? productsList : [
                    { product_name: 'Google Workspace Starter' },
                    { product_name: 'Google Workspace Standard' },
                    { product_name: 'Microsoft 365 Business Basic' },
                    { product_name: 'JustEmail Enterprise Cloud' }
                  ]).map((p, i) => (
                    <option key={i} value={p.product_name}>{p.product_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Billing Duration *</label>
                  <select
                    value={newOrderData.billing_cycle}
                    onChange={(e) => {
                      const cycle = e.target.value;
                      const selectedProd = productsList.find(p => p.product_name === newOrderData.product_name);
                      const mRate = selectedProd ? parseFloat(selectedProd.monthly_price || '270') : 270;
                      const aRate = selectedProd && selectedProd.annually_price ? parseFloat(selectedProd.annually_price) : mRate * 10.8;
                      const tRate = selectedProd && selectedProd.triennially_price ? parseFloat(selectedProd.triennially_price) : mRate * 28.8;
                      
                      let calculatedAmount = mRate;
                      if (cycle.includes('12')) calculatedAmount = aRate;
                      else if (cycle.includes('36')) calculatedAmount = tRate;

                      setNewOrderData({
                        ...newOrderData,
                        billing_cycle: cycle,
                        amount: calculatedAmount.toFixed(2)
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf]"
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="12 Months">12 Months (1 Year)</option>
                    <option value="36 Months">36 Months (3 Years)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Domain Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="company.com"
                    value={newOrderData.domain_name}
                    onChange={(e) => setNewOrderData({ ...newOrderData, domain_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Price / Order Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newOrderData.amount}
                  onChange={(e) => setNewOrderData({ ...newOrderData, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf]"
                />
              </div>

              {/* Wholesale Price Summary Box */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-center justify-between font-sans">
                <div>
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">Total Wholesale Price</span>
                  <span className="text-xs text-slate-500 font-medium">{newOrderData.billing_cycle} term • {newOrderData.product_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#0056cf]">₹{parseFloat(newOrderData.amount || 0).toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Auto-activated on placement</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={placingOrder}
                  className="px-5 py-2.5 rounded-xl bg-[#0056cf] hover:bg-blue-700 text-white font-extrabold transition cursor-pointer disabled:opacity-50"
                >
                  {placingOrder ? "Assigning..." : "Assign & Place Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
