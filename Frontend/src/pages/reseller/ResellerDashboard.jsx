import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import {
  getResellerClients,
  getResellerClientOrders,
  createResellerClient,
  createResellerClientOrder,
  deleteResellerClient,
  getResellerProductPricing
} from '../../api/resellerMasterApi';
import toast from 'react-hot-toast';
import { 
  Users, 
  Globe, 
  ShoppingBag, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  X,
  Trash2,
  Building2,
  Tag
} from 'lucide-react';

export default function ResellerDashboard() {
  const navigate = useNavigate();

  // Active Reseller User Helper
  const getLoggedInReseller = () => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch (e) { return {}; }
  };

  const activeUser = getLoggedInReseller();
  const resellerEmail = (activeUser.email || activeUser.username || '').trim();

  // Real-time Search Filter States
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Reseller Data State
  const [clients, setClients] = useState([]);
  const [clientOrders, setClientOrders] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add New Client Modal State
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    full_name: '',
    email: '',
    domain_name: '',
    phone: '',
    company_name: '',
    notes: ''
  });
  const [creatingClient, setCreatingClient] = useState(false);

  // Order Plan for Client Modal State
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

  // Fetch Reseller Data & Products Pricing
  const fetchData = async () => {
    setLoading(true);
    try {
      const currentEmail = (getLoggedInReseller().email || getLoggedInReseller().username || '').trim();
      const [clientsRes, ordersRes, prodsRes, customPricingRes] = await Promise.all([
        getResellerClients(currentEmail).catch(err => { console.error("Error loading clients", err); return null; }),
        getResellerClientOrders(currentEmail).catch(err => { console.error("Error loading client orders", err); return null; }),
        fetch("http://localhost:5000/api/product-master").then(r => r.json()).catch(err => { console.error("Error loading catalog", err); return null; }),
        getResellerProductPricing(currentEmail).catch(err => { console.error("Error loading reseller pricing", err); return null; })
      ]);

      if (clientsRes?.data?.success && Array.isArray(clientsRes.data.data)) {
        setClients(clientsRes.data.data);
      } else if (Array.isArray(clientsRes?.data)) {
        setClients(clientsRes.data);
      } else if (Array.isArray(clientsRes)) {
        setClients(clientsRes);
      }

      if (ordersRes?.data?.success && Array.isArray(ordersRes.data.data)) {
        setClientOrders(ordersRes.data.data);
      } else if (Array.isArray(ordersRes?.data)) {
        setClientOrders(ordersRes.data);
      } else if (Array.isArray(ordersRes)) {
        setClientOrders(ordersRes);
      }

      let baseProds = (prodsRes && prodsRes.success && prodsRes.data) ? prodsRes.data : [];
      const customPricings = (customPricingRes && customPricingRes.data?.success) ? customPricingRes.data.data : [];

      if (customPricings.length > 0) {
        baseProds = baseProds.map(p => {
          const custom = customPricings.find(cp => cp.product_id.toString() === p.id.toString());
          if (custom) {
            return {
              ...p,
              monthly_price: (custom.monthly_price !== '' && custom.monthly_price !== null) ? custom.monthly_price : p.monthly_price,
              annually_price: (custom.annually_price !== '' && custom.annually_price !== null) ? custom.annually_price : p.annually_price,
              triennially_price: (custom.triennially_price !== '' && custom.triennially_price !== null) ? custom.triennially_price : p.triennially_price
            };
          }
          return p;
        });
      }
      setProductsList(baseProds);
    } catch (err) {
      console.error("Failed to load reseller dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resellerEmail]);

  // Submit New Internal Reseller Client
  const handleCreateClientSubmit = async (e) => {
    e.preventDefault();
    if (!newClient.full_name.trim()) {
      toast.error("Full Name is required.");
      return;
    }
    if (!newClient.email.trim() || !newClient.email.includes("@")) {
      toast.error("Valid Email Address is required.");
      return;
    }
    if (!newClient.domain_name.trim() || !newClient.domain_name.includes(".")) {
      toast.error("Domain Name is mandatory (e.g. mycompany.com).");
      return;
    }

    setCreatingClient(true);
    try {
      const payload = {
        ...newClient,
        reseller_email: resellerEmail
      };
      const res = await createResellerClient(payload);
      if (res.data?.success) {
        toast.success("Client account added to dashboard successfully!");
        setShowAddClientModal(false);
        setNewClient({
          full_name: '',
          email: '',
          domain_name: '',
          phone: '',
          company_name: '',
          notes: ''
        });
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to add client.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add client.");
    } finally {
      setCreatingClient(false);
    }
  };

  // Delete Client Account Handler
  const handleDeleteClient = async (clientId, clientName, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete client account "${clientName}"?`)) return;
    try {
      const res = await deleteResellerClient(clientId);
      if (res.data?.success) {
        toast.success("Client account deleted successfully!");
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to delete client.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete client account.");
    }
  };

  // Submit Order for Client
  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (!newOrderData.client_email) {
      toast.error("Please select a client.");
      return;
    }
    if (!newOrderData.domain_name.trim() || !newOrderData.domain_name.includes(".")) {
      toast.error("Domain Name is mandatory.");
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        ...newOrderData,
        reseller_email: resellerEmail
      };
      const res = await createResellerClientOrder(payload);
      if (res.data?.success) {
        toast.success(`Order placed successfully for client! Purchase Date & Expiry Date activated.`);
        setShowOrderModal(false);
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to place order.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order for client.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Filtered Clients based on clientSearchQuery
  const filteredClients = useMemo(() => {
    if (!clientSearchQuery.trim()) return clients;
    const q = clientSearchQuery.toLowerCase().trim();
    return clients.filter(c => 
      (c.full_name && c.full_name.toLowerCase().includes(q)) ||
      (c.domain_name && c.domain_name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.customer_code && c.customer_code.toLowerCase().includes(q))
    );
  }, [clients, clientSearchQuery]);

  // Total Domain Count
  const totalDomainsCount = useMemo(() => {
    const set = new Set();
    clients.forEach(c => { if (c.domain_name) set.add(c.domain_name); });
    clientOrders.forEach(o => { if (o.domain_name) set.add(o.domain_name); });
    return set.size;
  }, [clients, clientOrders]);

  // Total Revenue Sum
  const totalRevenueSum = useMemo(() => {
    return clientOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
  }, [clientOrders]);

  // Client Orders Table Columns with Purchase & Expiry Dates
  const orderColumns = [
    { key: 'invoice_number', label: 'Invoice #', minWidth: '130px', sortable: true, render: row => <span className="font-bold text-[#0056cf] font-sans">{row.invoice_number}</span> },
    { key: 'client_name', label: 'Client Name', minWidth: '160px', sortable: true, render: row => <span className="font-bold text-slate-900 font-sans">{row.client_name}</span> },
    { key: 'domain_name', label: 'Domain Name', minWidth: '170px', sortable: true, render: row => <span className="font-bold text-[#0056cf] bg-blue-50/90 px-2.5 py-1 rounded-md border border-blue-200 text-xs font-sans">{row.domain_name || 'N/A'}</span> },
    { key: 'product_name', label: 'Product / Plan', minWidth: '190px', sortable: true, render: row => <span className="font-extrabold text-slate-900 font-sans">{row.product_name}</span> },
    { 
      key: 'created_at', label: 'Purchase Date', minWidth: '130px', sortable: true, render: row => (
        <span className="text-xs text-slate-700 font-semibold font-sans">
          {new Date(row.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ) 
    },
    { 
      key: 'expiry_date', label: 'Expiry Date', minWidth: '130px', sortable: true, render: row => {
        const pDate = new Date(row.created_at || Date.now());
        const cycleMonths = parseInt(row.billing_cycle) || (row.billing_cycle && row.billing_cycle.includes('12') ? 12 : 1);
        pDate.setMonth(pDate.getMonth() + cycleMonths);
        return (
          <span className="font-bold text-emerald-700 bg-emerald-50/90 px-2.5 py-1 rounded-md border border-emerald-200 text-xs font-sans">
            {pDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        );
      } 
    },
    { key: 'amount', label: 'Order Price', minWidth: '110px', sortable: true, render: row => <span className="font-extrabold text-slate-900 font-sans">₹{parseFloat(row.amount || 0).toFixed(2)}</span> },
    { 
      key: 'status', label: 'Order Status', minWidth: '120px', sortable: true, render: row => (
        <span className={`font-black text-[10px] px-2.5 py-1 rounded-md uppercase border font-sans tracking-wider ${
          (row.status || 'Paid').toLowerCase() === 'paid'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : (row.status || '').toLowerCase() === 'pending'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
          {row.status || 'Paid'}
        </span>
      ) 
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Universal Header */}
      <Navbar title="Reseller Dashboard" />

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
              Reseller Partner Dashboard
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1 font-sans">
              Manage your client accounts, domain names, product pricing list, and renewal expiries.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-sans">
            <button
              onClick={() => setShowAddClientModal(true)}
              className="bg-[#0056cf] hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs font-sans"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add New Client</span>
            </button>
          </div>
        </div>

        {/* RESELLER STAT COUNTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-sans">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0056cf]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 font-sans">{clients.length}</div>
              <div className="text-xs text-slate-500 font-semibold font-sans">My Managed Clients</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 font-sans">{totalDomainsCount}</div>
              <div className="text-xs text-slate-500 font-semibold font-sans">Active Domain Names</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 font-sans">₹{totalRevenueSum.toFixed(2)}</div>
              <div className="text-xs text-slate-500 font-semibold font-sans">Total Orders ({clientOrders.length})</div>
            </div>
          </div>
        </div>

        {/* PRODUCTS & PRICE LIST CATALOG SECTION */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-sans">
                <Tag className="w-4 h-4 text-[#0056cf]" />
                <span>Available Products & Reseller Price List ({productsList.length > 0 ? productsList.length : 4})</span>
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5 font-sans">Official reseller pricing catalog for Business Email & Cloud hosting plans.</p>
            </div>
            <button
              onClick={() => navigate("/store")}
              className="text-xs font-bold text-[#0056cf] hover:underline flex items-center gap-1 font-sans cursor-pointer"
            >
              View Full Store Catalog →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product / Plan Name</th>
                  <th className="py-3 px-4">Group Category</th>
                  <th className="py-3 px-4">1 Month Price</th>
                  <th className="py-3 px-4">1 Year Price (Annual)</th>
                  <th className="py-3 px-4">3 Years Price (Triennial)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {(productsList.length > 0 ? productsList : [
                  { product_name: 'Google Workspace Starter', product_group_name: 'Google Business Emails', monthly_price: '270', annually_price: '2916', triennially_price: '7776' },
                  { product_name: 'Google Workspace Standard', product_group_name: 'Google Business Emails', monthly_price: '865', annually_price: '9342', triennially_price: '24912' },
                  { product_name: 'Microsoft 365 Business Basic', product_group_name: 'Microsoft 365 Email', monthly_price: '120', annually_price: '1296', triennially_price: '3456' },
                  { product_name: 'JustEmail Enterprise Cloud', product_group_name: 'Cloud Hosting', monthly_price: '500', annually_price: '5400', triennially_price: '14400' }
                ]).map((p, i) => {
                  const mPrice = parseFloat(p.monthly_price || "270").toFixed(2);
                  const aPrice = (p.annually_price && parseFloat(p.annually_price) > 0) 
                    ? parseFloat(p.annually_price).toFixed(2) 
                    : (parseFloat(mPrice) * 10.8).toFixed(2);
                  const tPrice = (p.triennially_price && parseFloat(p.triennially_price) > 0) 
                    ? parseFloat(p.triennially_price).toFixed(2) 
                    : (parseFloat(mPrice) * 28.8).toFixed(2);

                  return (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-extrabold text-slate-900">{p.product_name}</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">{p.product_group_name || 'Business Email'}</td>
                      <td className="py-3 px-4 font-bold text-[#0056cf]">₹{mPrice} /mo</td>
                      <td className="py-3 px-4 font-bold text-slate-900">₹{aPrice} /yr</td>
                      <td className="py-3 px-4 font-bold text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded border border-emerald-200">₹{tPrice} /3yrs</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (clients.length > 0) {
                              setNewOrderData({
                                client_email: clients[0].email,
                                client_name: clients[0].full_name,
                                product_name: p.product_name,
                                group_name: p.product_group_name || 'Business Email',
                                domain_name: clients[0].domain_name || '',
                                billing_cycle: '1 Month',
                                amount: mPrice
                              });
                            }
                            setShowOrderModal(true);
                          }}
                          className="bg-[#0056cf] hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shadow-2xs font-sans"
                        >
                          Order for Client
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* INDIVIDUAL CLIENT PROFILES CONTAINER WITH DEDICATED SEARCH & SCROLL */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-sans">
              <Building2 className="w-4 h-4 text-[#0056cf]" />
              <span>Individual Client Profiles ({filteredClients.length})</span>
            </h3>

            {/* Dedicated Search Input for Clients */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search clients by name, domain, or email..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0056cf] font-sans"
              />
              {clientSearchQuery && (
                <button
                  onClick={() => setClientSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
              <p className="text-xs font-bold text-slate-700 font-sans">No Clients Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">Click "+ Add New Client" above to register client profiles under your reseller dashboard.</p>
            </div>
          ) : (
            /* Scrollable Container for Client Cards Grid */
            <div className="max-h-[480px] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredClients.map((client, idx) => {
                  const cOrders = clientOrders.filter(o => o.client_email && o.client_email.toLowerCase().trim() === client.email.toLowerCase().trim());
                  return (
                    <div
                      key={idx}
                      onClick={() => navigate(`/reseller/client/${client.id}`)}
                      className="bg-slate-50/60 hover:bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-3 flex flex-col justify-between group font-sans"
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-2.5">
                          <span className="text-xs font-bold text-[#0056cf] font-sans">{client.customer_code}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-sans">Active Client</span>
                            <button
                              onClick={(e) => handleDeleteClient(client.id, client.full_name, e)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                              title="Delete Client"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0056cf] transition-colors font-sans">{client.full_name}</h4>
                        <div className="text-xs font-semibold text-slate-600 mt-0.5 font-sans">{client.email}</div>
                        
                        {client.domain_name && (
                          <div className="mt-2.5 inline-block bg-blue-50/90 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-bold text-[#0056cf] font-sans">
                            {client.domain_name}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-sans">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold">Active Orders</span>
                          <span className="font-bold text-slate-900">{cOrders.length} Plans Purchased</span>
                        </div>
                        <span className="text-[#0056cf] font-bold text-xs group-hover:translate-x-1 transition-transform">View Full Profile →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RESELLER CLIENT & ORDER HISTORY DATA TABLE */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-sans">
                <ShoppingBag className="w-4 h-4 text-[#0056cf]" />
                <span>Reseller Client & Order History ({clientOrders.length})</span>
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5 font-sans">Complete ledger of all client product orders, invoice numbers, domain names, and renewal expiries.</p>
            </div>
          </div>

          <DataTable
            title=""
            columns={orderColumns}
            data={clientOrders}
            loading={loading}
            searchKey="client_name"
          />
        </div>

      </main>

      {/* MODAL 1: ADD NEW INTERNAL RESELLER CLIENT */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-sans">Add New Reseller Client Profile</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5 font-sans">Save client details for internal tracking. Client does not log into the website.</p>
              </div>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClientSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={newClient.full_name}
                  onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0056cf] font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="client@company.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0056cf] font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Domain Name *</label>
                <input
                  type="text"
                  required
                  placeholder="company.com"
                  value={newClient.domain_name}
                  onChange={(e) => setNewClient({ ...newClient, domain_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf] font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0056cf] font-sans"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={newClient.company_name}
                    onChange={(e) => setNewClient({ ...newClient, company_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#0056cf] font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingClient}
                  className="px-5 py-2.5 rounded-xl bg-[#0056cf] hover:bg-blue-700 text-white font-extrabold transition cursor-pointer disabled:opacity-50 font-sans"
                >
                  {creatingClient ? "Saving..." : "Save Client Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ORDER PRODUCT FOR CLIENT */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-sans">Order Product for Client</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5 font-sans">Assign a plan to your client. Purchase and expiry dates will be activated.</p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrderSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Client *</label>
                {clients.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium">
                    No clients registered yet. Please add a client first.
                  </div>
                ) : (
                  <select
                    value={newOrderData.client_email}
                    onChange={(e) => {
                      const c = clients.find(cl => cl.email === e.target.value);
                      setNewOrderData({
                        ...newOrderData,
                        client_email: e.target.value,
                        client_name: c ? c.full_name : '',
                        domain_name: c && c.domain_name ? c.domain_name : newOrderData.domain_name
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf] font-sans"
                  >
                    {clients.map((c, i) => (
                      <option key={i} value={c.email}>{c.full_name} ({c.email})</option>
                    ))}
                  </select>
                )}
              </div>

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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf] font-sans"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf] font-sans"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf] font-sans"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#0056cf] font-sans"
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
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={placingOrder || clients.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-[#0056cf] hover:bg-blue-700 text-white font-extrabold transition cursor-pointer disabled:opacity-50 font-sans"
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
