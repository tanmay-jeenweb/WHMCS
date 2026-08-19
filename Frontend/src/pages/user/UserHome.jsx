import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { usePermission } from "../../context/PermissionContext";
import { 
    User, 
    Users, 
    ShieldCheck, 
    Building2, 
    Briefcase, 
    ClipboardList, 
    CheckCircle2,
    Plus
} from "lucide-react";

export default function UserHome() {
    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
    const userRoleLower = (user.role || "").toLowerCase();
    const isAdmin = userRoleLower === "admin" || userRoleLower === "super admin" || userRoleLower.includes("admin");

    const canManageUsers = isAdmin || hasPermission("user_master", "read");
    const canManageRoles = isAdmin || hasPermission("user_type", "read");
    const canViewReport = isAdmin || hasPermission("activity_report", "read");

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        const fetchUserOrders = async () => {
            if (!user.email) {
                setOrders([]);
                setOrdersLoading(false);
                return;
            }
            setOrdersLoading(true);
            try {
                // Fetch live orders for logged in user from backend MySQL
                const res = await fetch(`http://localhost:5000/api/orders/user/${encodeURIComponent(user.email)}`);
                const json = await res.json();
                
                let fetchedDbOrders = [];
                if (json.success && json.data) {
                    fetchedDbOrders = json.data.map(o => ({
                        id: o.invoice_number,
                        date: new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                        productName: o.product_name,
                        groupName: o.group_name || 'Business Emails',
                        domain: o.domain_name || 'N/A',
                        cycle: o.billing_cycle,
                        amount: `₹${parseFloat(o.amount).toFixed(2)}`,
                        status: o.status
                    }));
                }

                // Filter local storage orders strictly matching user email
                const localOrders = JSON.parse(localStorage.getItem("user_order_history") || "[]").filter(
                    o => o.clientEmail && o.clientEmail.trim().toLowerCase() === user.email.trim().toLowerCase()
                );

                const combinedMap = new Map();
                fetchedDbOrders.forEach(o => combinedMap.set(o.id, o));
                localOrders.forEach(o => combinedMap.set(o.id, o));

                setOrders(Array.from(combinedMap.values()));
            } catch (err) {
                console.error("Failed to load user orders:", err);
                setOrders([]);
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchUserOrders();
    }, [user.email]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header Navigation Bar */}
            <Navbar title={isAdmin ? "CRM Dashboard" : "Client Portal"} />

            <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
                
                {/* ADMIN DASHBOARD SUITE (Renders when user is Admin) */}
                {isAdmin ? (
                    <>
                        {/* Admin Welcome Banner */}
                        <div className="relative overflow-hidden bg-gradient-to-r from-[#0052cc] to-[#0a2540] rounded-3xl p-8 sm:p-12 shadow-xl text-white transition-all hover:shadow-2xl">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="relative z-10 max-w-2xl">
                                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-sky-200 border border-white/10 mb-4 backdrop-blur-xs">
                                    Platform Status: Active Administrator
                                </span>
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                                    Welcome back, {user.name || "Administrator"}!
                                </h1>
                                <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
                                    Access the WHMCS administration suite. Use the navigation menu at the top or the quick action cards below to manage accounts, configure roles, and inspect security logs.
                                </p>
                            </div>
                        </div>

                        {/* Admin Quick Action Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            
                            {/* Profile Card */}
                            <div 
                                onClick={() => navigate("/profile")}
                                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-sky-500 transition-all duration-300" />
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-blue-600 font-bold group-hover:scale-110 transition-transform">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                                        Your Profile
                                    </h3>
                                    <p className="text-slate-500 text-xs leading-relaxed">
                                        Review your personal details, credentials, permissions, and active device details.
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                    <span>Manage Profile</span>
                                    <span className="text-blue-600 font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                                        View Profile →
                                    </span>
                                </div>
                            </div>

                            {/* User Master Card */}
                            {canManageUsers && (
                                <div 
                                    onClick={() => navigate("/admin/dashboard")}
                                    className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-300" />
                                    <div>
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 text-emerald-600 font-bold group-hover:scale-110 transition-transform">
                                            <Users className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                                            User Master
                                        </h3>
                                        <p className="text-slate-500 text-xs leading-relaxed">
                                            Manage member accounts, toggle active/inactive status, approve new logins, and authorize devices.
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                        <span>Manage Users</span>
                                        <span className="text-emerald-600 font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                                            Open Master →
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* User Type Master Card */}
                            {canManageRoles && (
                                <div 
                                    onClick={() => navigate("/admin/user-types")}
                                    className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white hover:border-violet-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-purple-500 transition-all duration-300" />
                                    <div>
                                        <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-4 text-violet-600 font-bold group-hover:scale-110 transition-transform">
                                            <ShieldCheck className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-violet-700 transition-colors">
                                            User Types Master
                                        </h3>
                                        <p className="text-slate-500 text-xs leading-relaxed">
                                            Define administrative and worker groups, and customize read/write access permissions.
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                        <span>Manage User Groups</span>
                                        <span className="text-violet-600 font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                                            Open Master →
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Customer Master Card */}
                            <div 
                                onClick={() => navigate("/admin/masters/customer-master")}
                                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-blue-500 transition-all duration-300" />
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600 font-bold group-hover:scale-110 transition-transform">
                                        <Building2 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">
                                        Customer Master
                                    </h3>
                                    <p className="text-slate-500 text-xs leading-relaxed">
                                        Client portal rules, signup permissions, allowed portal views, and customer account IDs directory.
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                    <span>Manage Customers</span>
                                    <span className="text-indigo-600 font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                                        Open Master →
                                    </span>
                                </div>
                            </div>

                            {/* Reseller Master Card */}
                            <div 
                                onClick={() => navigate("/admin/masters/reseller-master")}
                                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white hover:border-amber-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-500 transition-all duration-300" />
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4 text-amber-600 font-bold group-hover:scale-110 transition-transform">
                                        <Briefcase className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-amber-700 transition-colors">
                                        Reseller Master
                                    </h3>
                                    <p className="text-slate-500 text-xs leading-relaxed">
                                        Reseller tiers, commissions, whitelabeling settings, and reseller account directory.
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                    <span>Manage Resellers</span>
                                    <span className="text-amber-600 font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                                        Open Master →
                                    </span>
                                </div>
                            </div>

                            {/* Activity Report Card */}
                            {canViewReport && (
                                <div 
                                    onClick={() => navigate("/admin/report")}
                                    className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-blue-500 transition-all duration-300" />
                                    <div>
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600 font-bold group-hover:scale-110 transition-transform">
                                            <ClipboardList className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">
                                            Activity Report
                                        </h3>
                                        <p className="text-slate-500 text-xs leading-relaxed">
                                            Inspect system audit logs, tracking who modified what details and when the changes occurred.
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                        <span>Inspect Logs</span>
                                        <span className="text-indigo-600 font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                                            View Report →
                                        </span>
                                    </div>
                                </div>
                            )}

                        </div>
                    </>
                ) : (
                    /* CLIENT HEADER (Renders when logged in as a Client Customer) */
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                Welcome back, {user.name || "Customer"}
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                                Manage your active business email subscriptions and invoices.
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigate("/profile")}
                                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-2xs"
                            >
                                Profile Settings
                            </button>
                            <button
                                onClick={() => navigate("/store")}
                                className="bg-[#0056cf] hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs"
                            >
                                + New Order
                            </button>
                        </div>
                    </div>
                )}

                {/* ORDER & INVOICE HISTORY SECTION */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900">Order & Invoice History</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Track your placed hosting orders, billing status, and downloadable invoices.</p>
                        </div>
                        <button
                            onClick={() => navigate("/store")}
                            className="bg-[#0056cf] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                            + New Order
                        </button>
                    </div>

                    {ordersLoading ? (
                        <div className="text-center py-12 bg-slate-50/70 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
                            <div className="w-8 h-8 border-3 border-[#0056cf] border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-slate-500 text-xs font-semibold">Loading orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-3">
                            <p className="text-slate-800 font-extrabold text-sm">No Active Orders</p>
                            <p className="text-slate-400 text-xs max-w-sm mx-auto">You haven't placed any orders yet. Click below to browse email & web hosting products.</p>
                            <button
                                onClick={() => navigate("/store")}
                                className="bg-[#0056cf] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer"
                            >
                                Browse Store Products
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-700">
                                <thead>
                                    <tr className="border-b border-slate-200 font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                                        <th className="py-3.5 px-4">Invoice #</th>
                                        <th className="py-3.5 px-4">Date</th>
                                        <th className="py-3.5 px-4">Product / Plan</th>
                                        <th className="py-3.5 px-4">Domain</th>
                                        <th className="py-3.5 px-4">Billing Cycle</th>
                                        <th className="py-3.5 px-4">Amount</th>
                                        <th className="py-3.5 px-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map((ord, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-[#0056cf]">{ord.id}</td>
                                            <td className="py-3.5 px-4 text-slate-500">{ord.date}</td>
                                            <td className="py-3.5 px-4 font-extrabold text-slate-900">
                                                {ord.productName}
                                                <span className="block text-[11px] font-normal text-slate-400">{ord.groupName}</span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-slate-600">{ord.domain}</td>
                                            <td className="py-3.5 px-4 text-slate-600">{ord.cycle}</td>
                                            <td className="py-3.5 px-4 font-extrabold text-slate-900">{ord.amount}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>{ord.status}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
