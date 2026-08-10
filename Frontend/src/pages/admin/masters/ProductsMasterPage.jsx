import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import {
    getProductsOverview,
    createProductGroup,
    createProduct,
    duplicateProduct,
    refreshFeatureStatus,
    createAddon,
    clearProductsData
} from '../../../api/productMasterApi';
import toast from 'react-hot-toast';

export default function ProductsMasterPage() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('products'); // 'products', 'addons', 'bundles'

    // Form View Control ('list', 'create_group', 'create_product', 'duplicate')
    const [viewMode, setViewMode] = useState('list');

    // Data State
    const [groups, setGroups] = useState([]);
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(true);

    // Empty Initial States for Clean Reset
    const emptyGroupForm = {
        group_name: '',
        group_icon: '',
        group_headline: '',
        group_tagline: '',
        order_form_template: 'Standard Cart (Default)',
        hidden: false
    };

    const emptyProductForm = {
        product_type: 'Shared Hosting',
        group_id: '',
        name: '',
        description: '',
        module_type: 'No Module',
        price: '',
        payment_type: 'recurring',
        auto_setup: 'payment',
        hidden: false
    };

    const emptyDuplicateForm = {
        product_id: '',
        new_name: '',
        group_id: ''
    };

    const emptyAddonForm = {
        name: '',
        description: '',
        billing_cycle: 'monthly',
        price: ''
    };

    const [groupForm, setGroupForm] = useState(emptyGroupForm);
    const [productForm, setProductForm] = useState(emptyProductForm);
    const [duplicateForm, setDuplicateForm] = useState(emptyDuplicateForm);
    const [addonForm, setAddonForm] = useState(emptyAddonForm);

    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getProductsOverview();
            if (res.data?.success) {
                setGroups(res.data.groups || []);
                setAddons(res.data.addons || []);
            }
        } catch (err) {
            console.error("Failed to load products overview", err);
            toast.error("Failed to load products list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Helper URL generator
    const baseUrl = "https://8eb806de-74b5-4eff-ad59-147bf43e9700.package.webpros.cloud/index.php?rp=/store/";
    const groupSlug = groupForm.group_name ? groupForm.group_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
    const productSlug = productForm.name ? productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';

    // Handlers
    const handleSaveGroup = async (e) => {
        e.preventDefault();
        if (!groupForm.group_name.trim()) {
            toast.error("Product Group Name is required.");
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                ...groupForm,
                url_slug: groupSlug
            };
            await createProductGroup(payload);
            toast.success("Product Group Created Successfully!");
            setGroupForm(emptyGroupForm); // Reset form to empty
            setViewMode('list');
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create group.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        if (!productForm.group_id) {
            toast.error("Please select a Product Group.");
            return;
        }
        if (!productForm.name.trim()) {
            toast.error("Product Name is required.");
            return;
        }
        setSubmitting(true);
        try {
            const selectedGroup = groups.find(g => String(g.id) === String(productForm.group_id));
            const selectedGroupSlug = selectedGroup ? selectedGroup.group_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'store';
            const payload = {
                ...productForm,
                url_slug: `${selectedGroupSlug}/${productSlug}`
            };
            await createProduct(payload);
            toast.success("Product Created Successfully!");
            setProductForm(emptyProductForm); // Reset form to empty
            setViewMode('list');
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create product.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveDuplicate = async (e) => {
        e.preventDefault();
        if (!duplicateForm.product_id) {
            toast.error("Please select a product to duplicate.");
            return;
        }
        setSubmitting(true);
        try {
            await duplicateProduct(duplicateForm);
            toast.success("Product Duplicated Successfully!");
            setDuplicateForm(emptyDuplicateForm); // Reset form to empty
            setViewMode('list');
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to duplicate product.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveAddon = async (e) => {
        e.preventDefault();
        if (!addonForm.name.trim()) {
            toast.error("Addon Name is required.");
            return;
        }
        setSubmitting(true);
        try {
            await createAddon(addonForm);
            toast.success("Addon Created Successfully!");
            setAddonForm(emptyAddonForm); // Reset form to empty
            loadData();
        } catch (err) {
            toast.error("Failed to create addon.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRefreshStatus = async () => {
        try {
            const res = await refreshFeatureStatus();
            toast.success(res.data?.message || "Feature status refreshed successfully!");
        } catch (err) {
            toast.error("Failed to refresh status.");
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to clear all product groups and products?")) return;
        try {
            await clearProductsData();
            toast.success("All products data cleared.");
            setGroups([]);
            setAddons([]);
            loadData();
        } catch (err) {
            toast.error("Failed to clear data.");
        }
    };

    // Order form templates list matching Screenshot 2
    const templates = [
        { id: 'Standard Cart (Default)', label: 'Standard Cart (Default)', icon: '🛒' },
        { id: 'Premium Comparison', label: 'Premium Comparison', icon: '📊' },
        { id: 'Pure Comparison', label: 'Pure Comparison', icon: '⚖️' },
        { id: 'Supreme Comparison', label: 'Supreme Comparison', icon: '⭐' },
        { id: 'Universal Slider', label: 'Universal Slider', icon: '🎚️' },
        { id: 'Cloud Slider', label: 'Cloud Slider', icon: '☁️' },
        { id: 'Legacy Boxes', label: 'Legacy Boxes', icon: '📦' },
        { id: 'Legacy Modern', label: 'Legacy Modern', icon: '📱' },
        { id: 'Nexus Cart', label: 'Nexus Cart', icon: '🛍️' }
    ];

    const allProducts = groups.flatMap(g => (g.products || []).map(p => ({ ...p, group_name: g.group_name })));

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen font-sans text-slate-800">
            <Navbar />

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

                {/* WHMCS Breadcrumb Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <button onClick={() => navigate('/admin/dashboard')} className="hover:text-blue-900 font-semibold">Dashboard</button>
                        <span>/</span>
                        <button onClick={() => setViewMode('list')} className="hover:text-blue-900 font-bold text-slate-900">Products/Services</button>
                        {viewMode === 'create_group' && <><span className="text-slate-400">/</span> <span className="font-bold text-slate-800">Create Group</span></>}
                        {viewMode === 'create_product' && <><span className="text-slate-400">/</span> <span className="font-bold text-slate-800">Create a New Product</span></>}
                        {viewMode === 'duplicate' && <><span className="text-slate-400">/</span> <span className="font-bold text-slate-800">Duplicate a Product</span></>}
                    </div>

                    {viewMode !== 'list' && (
                        <button
                            onClick={() => setViewMode('list')}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-300 bg-white px-3 py-1.5 rounded-lg shadow-xs"
                        >
                            ← Back to Products List
                        </button>
                    )}
                </div>

                {/* Section Navigation Tabs (Products/Services, Product Addons, Bundles) */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <button
                        onClick={() => { setActiveSection('products'); setViewMode('list'); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeSection === 'products'
                                ? 'bg-blue-900 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                    >
                        <span>📦</span> Products & Services
                    </button>
                    <button
                        onClick={() => setActiveSection('addons')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeSection === 'addons'
                                ? 'bg-blue-900 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                    >
                        <span>🔌</span> Product Addons
                    </button>
                    <button
                        onClick={() => setActiveSection('bundles')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeSection === 'bundles'
                                ? 'bg-blue-900 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                    >
                        <span>🎁</span> Bundles & Promotions
                    </button>
                </div>

                {/* ========================================================================= */}
                {/* SECTION 1: PRODUCTS & SERVICES */}
                {/* ========================================================================= */}
                {activeSection === 'products' && (
                    <div className="space-y-6">

                        {/* Top Action Toolbar (Exact match to screenshot 1 & user prompt) */}
                        <div className="bg-white p-2.5 rounded-xl border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden bg-white shadow-xs">
                                    <button
                                        onClick={() => {
                                            setGroupForm(emptyGroupForm);
                                            setViewMode('create_group');
                                        }}
                                        className={`px-3.5 py-2 text-xs font-medium border-r border-slate-300 flex items-center gap-1.5 transition-colors ${
                                            viewMode === 'create_group' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-800 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className="text-base font-bold text-slate-700">+</span>
                                        <span>Create a New Group</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setProductForm({ ...emptyProductForm, group_id: groups[0]?.id || '' });
                                            setViewMode('create_product');
                                        }}
                                        className={`px-3.5 py-2 text-xs font-medium border-r border-slate-300 flex items-center gap-1.5 transition-colors ${
                                            viewMode === 'create_product' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-800 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">+</span>
                                        <span>Create a New Product</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setDuplicateForm(emptyDuplicateForm);
                                            setViewMode('duplicate');
                                        }}
                                        className={`px-3.5 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                                            viewMode === 'duplicate' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-800 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className="w-4 h-4 rounded bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">+</span>
                                        <span>Duplicate a Product</span>
                                    </button>
                                </div>

                                <button
                                    onClick={handleRefreshStatus}
                                    className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                                >
                                    <span className="text-slate-600">🔄</span>
                                    <span>Refresh Feature Status</span>
                                </button>
                            </div>

                            {groups.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                                >
                                    🗑️ Clear All Records
                                </button>
                            )}
                        </div>

                        {/* VIEW MODE 1: CREATE A NEW PRODUCT (Exact WHMCS Layout from Screenshot 1) */}
                        {viewMode === 'create_product' && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 max-w-4xl mx-auto">
                                <div className="text-center border-b border-slate-100 pb-4">
                                    <h2 className="text-lg font-bold text-slate-900">Create a New Product</h2>
                                </div>

                                <form onSubmit={handleSaveProduct} className="space-y-6">

                                    {/* 1. Product Type Selector Cards */}
                                    <div className="space-y-2">
                                        <div className="text-center space-y-0.5">
                                            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Product Type</label>
                                            <p className="text-[11px] text-slate-500">Defines how WHMCS manages the item. Don't see the type of product you're looking for? <span className="text-blue-600 font-semibold cursor-pointer underline">Choose Other</span></p>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                            {[
                                                { id: 'Shared Hosting', label: 'Shared Hosting', icon: '🖥️' },
                                                { id: 'Reseller Hosting', label: 'Reseller Hosting', icon: '☁️' },
                                                { id: 'Server/VPS', label: 'Server/VPS', icon: '🗄️' },
                                                { id: 'Other', label: 'Other', icon: '📦' }
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setProductForm({ ...productForm, product_type: t.id })}
                                                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                                                        productForm.product_type === t.id
                                                            ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                                >
                                                    <span className="text-2xl">{t.icon}</span>
                                                    <span className="text-xs font-bold text-slate-800">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Product Group */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 border-t border-slate-100 pt-5">
                                        <div className="md:text-right">
                                            <label className="text-xs font-bold text-slate-700">Product Group</label>
                                            <p className="text-[11px] text-slate-400">Click here to create a new product group</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <select
                                                required
                                                value={productForm.group_id}
                                                onChange={e => setProductForm({ ...productForm, group_id: e.target.value })}
                                                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 outline-none"
                                            >
                                                <option value="">-- Select Product Group --</option>
                                                {groups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.group_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 3. Product Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <div className="md:text-right">
                                            <label className="text-xs font-bold text-slate-700">Product Name</label>
                                            <p className="text-[11px] text-slate-400">The default display name for your new product</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                required
                                                value={productForm.name}
                                                onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                                placeholder="eg. Business Shared Hosting Plan"
                                                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* 4. URL */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <div className="md:text-right">
                                            <label className="text-xs font-bold text-slate-700">URL</label>
                                            <p className="text-[11px] text-slate-400">A friendly URL to use to link to this product</p>
                                        </div>
                                        <div className="md:col-span-2 flex items-center gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={`${baseUrl}${productSlug || 'product-name'}`}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono text-slate-600 outline-none truncate"
                                            />
                                            <button type="button" onClick={() => toast.success("URL copied to clipboard!")} className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold">
                                                📋
                                            </button>
                                        </div>
                                    </div>

                                    {/* 5. Module */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <div className="md:text-right">
                                            <label className="text-xs font-bold text-slate-700">Module</label>
                                            <p className="text-[11px] text-slate-400">Choose a module for automation</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <select
                                                value={productForm.module_type}
                                                onChange={e => setProductForm({ ...productForm, module_type: e.target.value })}
                                                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 outline-none"
                                            >
                                                <option value="No Module">No Module</option>
                                                <option value="cPanel">cPanel / WHM</option>
                                                <option value="Plesk">Plesk Obsidian</option>
                                                <option value="DirectAdmin">DirectAdmin</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* 6. Create as Hidden Toggle */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <div className="md:text-right">
                                            <label className="text-xs font-bold text-slate-700">Create as Hidden</label>
                                            <p className="text-[11px] text-slate-400">A hidden product is not visible to end users</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <button
                                                type="button"
                                                onClick={() => setProductForm({ ...productForm, hidden: !productForm.hidden })}
                                                className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                                    productForm.hidden ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                                                }`}
                                            >
                                                {productForm.hidden ? 'ON' : 'OFF'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                                        >
                                            {submitting ? 'Creating...' : 'Continue »'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('list')}
                                            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    {/* Footer Info Notice */}
                                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
                                        <span>ℹ️</span>
                                        <span>Looking to add a MarketConnect product such as SSL, Website Builder or Backups? Visit the MarketConnect Portal</span>
                                    </div>

                                </form>
                            </div>
                        )}

                        {/* VIEW MODE 2: CREATE GROUP (Exact WHMCS Layout from Screenshot 2) */}
                        {viewMode === 'create_group' && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 max-w-5xl mx-auto">
                                <div className="border-b border-slate-100 pb-3">
                                    <h2 className="text-base font-bold text-slate-900">Create Group</h2>
                                </div>

                                <form onSubmit={handleSaveGroup} className="space-y-6">

                                    {/* Product Group Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <label className="md:text-right text-xs font-bold text-slate-700">Product Group Name</label>
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                required
                                                value={groupForm.group_name}
                                                onChange={e => setGroupForm({ ...groupForm, group_name: e.target.value })}
                                                placeholder="eg. Shared Hosting"
                                                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Group Icon */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <label className="md:text-right text-xs font-bold text-slate-700">Group Icon</label>
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                value={groupForm.group_icon}
                                                onChange={e => setGroupForm({ ...groupForm, group_icon: e.target.value })}
                                                placeholder="eg. fa-solid fa-house"
                                                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* URL */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <label className="md:text-right text-xs font-bold text-slate-700">URL</label>
                                        <div className="md:col-span-2 flex items-center gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={`${baseUrl}${groupSlug || 'group-name'}`}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono text-slate-600 outline-none truncate"
                                            />
                                            <span className="text-slate-400">📋</span>
                                        </div>
                                    </div>

                                    {/* Product Group Headline */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <label className="md:text-right text-xs font-bold text-slate-700">Product Group Headline</label>
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                value={groupForm.group_headline}
                                                onChange={e => setGroupForm({ ...groupForm, group_headline: e.target.value })}
                                                placeholder="eg. Select Your Perfect Plan"
                                                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Product Group Tagline */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <label className="md:text-right text-xs font-bold text-slate-700">Product Group Tagline</label>
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                value={groupForm.group_tagline}
                                                onChange={e => setGroupForm({ ...groupForm, group_tagline: e.target.value })}
                                                placeholder="eg. With our 30 Day Money Back Guarantee You Can't Go Wrong!"
                                                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Group Features */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                        <label className="md:text-right text-xs font-bold text-slate-700">Group Features</label>
                                        <div className="md:col-span-2">
                                            <p className="text-xs text-slate-400 italic">You must save the product group for the first time before you can add features</p>
                                        </div>
                                    </div>

                                    {/* Order Form Template Selector (Screenshot 2) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 pt-2">
                                        <label className="md:text-right text-xs font-bold text-slate-700 pt-2">Order Form Template</label>
                                        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {templates.map(t => (
                                                <label
                                                    key={t.id}
                                                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition-all ${
                                                        groupForm.order_form_template === t.id
                                                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="order_form_template"
                                                        value={t.id}
                                                        checked={groupForm.order_form_template === t.id}
                                                        onChange={e => setGroupForm({ ...groupForm, order_form_template: e.target.value })}
                                                        className="sr-only"
                                                    />
                                                    <span className="text-xl">{t.icon}</span>
                                                    <span className="text-[11px] font-bold text-slate-800">{t.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hidden Checkbox */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 border-t border-slate-100 pt-4">
                                        <label className="md:text-right text-xs font-bold text-slate-700">Hidden</label>
                                        <div className="md:col-span-2 flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="hidden_group"
                                                checked={groupForm.hidden}
                                                onChange={e => setGroupForm({ ...groupForm, hidden: e.target.checked })}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="hidden_group" className="text-xs text-slate-700 cursor-pointer">Check if this is a hidden group</label>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex items-center justify-center gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                                        >
                                            {submitting ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('list')}
                                            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel Changes
                                        </button>
                                    </div>

                                </form>
                            </div>
                        )}

                        {/* VIEW MODE 3: DUPLICATE A PRODUCT FORM */}
                        {viewMode === 'duplicate' && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-lg mx-auto">
                                <div className="border-b border-slate-100 pb-3 text-center">
                                    <h2 className="text-base font-bold text-slate-900">Duplicate a Product</h2>
                                </div>
                                <form onSubmit={handleSaveDuplicate} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700">Source Product *</label>
                                        <select
                                            required
                                            value={duplicateForm.product_id}
                                            onChange={e => setDuplicateForm({ ...duplicateForm, product_id: e.target.value })}
                                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none"
                                        >
                                            <option value="">-- Select Source Product --</option>
                                            {allProducts.map(p => (
                                                <option key={p.id} value={p.id}>[{p.group_name}] {p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700">New Product Name</label>
                                        <input
                                            type="text"
                                            value={duplicateForm.new_name}
                                            onChange={e => setDuplicateForm({ ...duplicateForm, new_name: e.target.value })}
                                            placeholder="Leave empty for automatic (Copy)"
                                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center justify-center gap-3 pt-3">
                                        <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white">
                                            {submitting ? 'Duplicating...' : 'Duplicate Product'}
                                        </button>
                                        <button type="button" onClick={() => setViewMode('list')} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* VIEW MODE 0: LIST OF GROUPS & PRODUCTS */}
                        {viewMode === 'list' && (
                            <div>
                                {loading ? (
                                    <div className="p-12 text-center text-slate-400 font-medium">Loading Products & Groups...</div>
                                ) : groups.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                                        <span className="text-4xl">📂</span>
                                        <h3 className="text-lg font-bold text-slate-800">No Product Groups Found</h3>
                                        <p className="text-xs text-slate-500 max-w-md mx-auto">Get started by creating your first product group using the top toolbar.</p>
                                        <button
                                            onClick={() => setViewMode('create_group')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 shadow"
                                        >
                                            + Create a New Group
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {groups.map((group) => (
                                            <div key={group.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                                                <div className="bg-slate-100/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                                                            📁
                                                        </div>
                                                        <div>
                                                            <h3 className="text-base font-bold text-slate-900">{group.group_name}</h3>
                                                            {group.group_headline && <p className="text-xs text-slate-500">{group.group_headline}</p>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setProductForm({ ...emptyProductForm, group_id: group.id });
                                                            setViewMode('create_product');
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-blue-900 border border-slate-300 hover:bg-blue-50 transition-all shadow-xs"
                                                    >
                                                        + Add Product to Group
                                                    </button>
                                                </div>

                                                <div className="p-6">
                                                    {(!group.products || group.products.length === 0) ? (
                                                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                                            <p className="text-xs text-slate-400 font-medium">No products in this group yet.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {group.products.map(p => (
                                                                <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all space-y-3">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{p.product_type || 'Shared Hosting'}</span>
                                                                            <h4 className="font-bold text-sm text-slate-900 mt-1">{p.name}</h4>
                                                                        </div>
                                                                        <span className="font-mono font-bold text-sm text-slate-900">${parseFloat(p.price || 0).toFixed(2)}/mo</span>
                                                                    </div>
                                                                    {p.description && <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>}
                                                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                                                        <span>Module: <strong className="text-slate-700">{p.module || 'No Module'}</strong></span>
                                                                        <button
                                                                            onClick={() => {
                                                                                setDuplicateForm({ product_id: p.id, new_name: `${p.name} (Copy)`, group_id: p.group_id });
                                                                                setViewMode('duplicate');
                                                                            }}
                                                                            className="font-bold text-blue-900 hover:underline"
                                                                        >
                                                                            Duplicate
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}

                {/* ========================================================================= */}
                {/* SECTION 2: PRODUCT ADDONS */}
                {/* ========================================================================= */}
                {activeSection === 'addons' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Product Addons</h2>
                                <p className="text-xs text-slate-500">Configure extra service addons (IP addresses, backups, cPanel licenses).</p>
                            </div>
                        </div>

                        {/* Add Addon Form */}
                        <form onSubmit={handleSaveAddon} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add New Addon</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    required
                                    value={addonForm.name}
                                    onChange={e => setAddonForm({ ...addonForm, name: e.target.value })}
                                    placeholder="Addon Name (eg. Dedicated IP)"
                                    className="rounded-xl border border-slate-300 p-2.5 text-xs bg-white outline-none"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={addonForm.price}
                                    onChange={e => setAddonForm({ ...addonForm, price: e.target.value })}
                                    placeholder="Price ($ eg. 3.50)"
                                    className="rounded-xl border border-slate-300 p-2.5 text-xs bg-white outline-none"
                                />
                                <button type="submit" disabled={submitting} className="px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-900 text-white">
                                    {submitting ? 'Saving...' : '+ Save Addon'}
                                </button>
                            </div>
                        </form>

                        {addons.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                {addons.map(addon => (
                                    <div key={addon.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-sm text-slate-900">{addon.name}</h4>
                                            <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${parseFloat(addon.price).toFixed(2)} / {addon.billing_cycle}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================================= */}
                {/* SECTION 3: BUNDLES & PROMOTIONS */}
                {/* ========================================================================= */}
                {activeSection === 'bundles' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-base font-bold text-slate-900">Product Bundles & Promotional Coupons</h2>
                            <p className="text-xs text-slate-500">Combine multiple products into discounted package bundles or create promo codes.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="p-5 rounded-xl border border-slate-200 bg-blue-50/30 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🎁</span>
                                    <h3 className="font-bold text-sm text-slate-900">Package Bundles</h3>
                                </div>
                                <p className="text-xs text-slate-600">Bundle Hosting + Domain + SSL together for a single automated checkout flow.</p>
                                <button className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-900 text-white hover:bg-blue-800">
                                    + Create Package Bundle
                                </button>
                            </div>

                            <div className="p-5 rounded-xl border border-slate-200 bg-emerald-50/30 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🏷️</span>
                                    <h3 className="font-bold text-sm text-slate-900">Promo Discount Codes</h3>
                                </div>
                                <p className="text-xs text-slate-600">Create recurring or one-time promotional discount codes for specific product groups.</p>
                                <button className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-700">
                                    + Add Promotion Code
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
