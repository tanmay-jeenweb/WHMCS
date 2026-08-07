import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import DataTable from '../../../components/DataTable';
import {
  getInvoiceConfig,
  updateInvoiceConfig,
  getAllInvoiceRecords,
  createInvoiceRecord,
  deleteInvoiceRecord
} from '../../../api/invoiceMasterApi';
import toast from 'react-hot-toast';

export default function InvoiceMasterPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'records'

  // General Invoice Config State (Clean empty initial values)
  const [config, setConfig] = useState({
    continuous_invoicing: 'disabled',
    invoice_due_days: '',
    payment_reminder_emails: 'enabled',
    late_fee_type: 'percentage',
    late_fee_amount: '',
    late_fee_minimum: '',
    auto_cancellation_days: '',
    tax_enabled: 'disabled',
    tax_type: 'exclusive',
    tax_name: '',
    tax_rate: '',
    invoice_starting_number: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // DataTable State for Tab 2
  const [invoiceRecords, setInvoiceRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoice_number: '',
    client_name: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
    total_amount: '',
    status: 'unpaid'
  });
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await getInvoiceConfig();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setConfig({
          continuous_invoicing: data.continuous_invoicing || 'disabled',
          invoice_due_days: data.invoice_due_days || '',
          payment_reminder_emails: data.payment_reminder_emails || 'enabled',
          late_fee_type: data.late_fee_type || 'percentage',
          late_fee_amount: data.late_fee_amount || '',
          late_fee_minimum: data.late_fee_minimum || '',
          auto_cancellation_days: data.auto_cancellation_days || '',
          tax_enabled: data.tax_enabled || 'disabled',
          tax_type: data.tax_type || 'exclusive',
          tax_name: data.tax_name || '',
          tax_rate: data.tax_rate || '',
          invoice_starting_number: data.invoice_starting_number || ''
        });
      }
    } catch (err) {
      console.error("Failed to load invoice config", err);
    }
  };

  const fetchRecords = async () => {
    setRecordsLoading(true);
    try {
      const res = await getAllInvoiceRecords();
      if (res.data?.success) {
        setInvoiceRecords(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load invoice records", err);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchRecords();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateInvoiceConfig(config);
      toast.success("Invoice configuration saved to database!");
    } catch (err) {
      toast.error("Failed to save invoice configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoice.invoice_number || !newInvoice.client_name) {
      toast.error("Please fill in Invoice Number and Client Name.");
      return;
    }
    setCreatingInvoice(true);
    try {
      await createInvoiceRecord(newInvoice);
      toast.success("Invoice record logged successfully!");
      setShowAddModal(false);
      setNewInvoice({
        invoice_number: '',
        client_name: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
        total_amount: '',
        status: 'unpaid'
      });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create invoice record.");
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice record?")) return;
    try {
      await deleteInvoiceRecord(id);
      toast.success("Invoice record deleted successfully!");
      fetchRecords();
    } catch (err) {
      toast.error("Failed to delete invoice record.");
    }
  };

  // DataTable Columns definition for Tab 2
  const invoiceColumns = [
    { key: 'id', label: 'ID', minWidth: '80px', sortable: true },
    { key: 'invoice_number', label: 'Invoice #', minWidth: '150px', sortable: true, render: row => <span className="font-bold font-mono text-blue-900">{row.invoice_number}</span> },
    { key: 'client_name', label: 'Client Name', minWidth: '220px', sortable: true, render: row => <span className="font-bold text-slate-900">{row.client_name}</span> },
    { key: 'invoice_date', label: 'Invoice Date', minWidth: '140px', sortable: true, render: row => row.invoice_date ? new Date(row.invoice_date).toLocaleDateString() : 'N/A' },
    { key: 'due_date', label: 'Due Date', minWidth: '140px', sortable: true, render: row => row.due_date ? new Date(row.due_date).toLocaleDateString() : 'N/A' },
    { key: 'total_amount', label: 'Total Amount', minWidth: '140px', sortable: true, render: row => <span className="font-mono font-bold text-slate-900">${parseFloat(row.total_amount || 0).toFixed(2)}</span> },
    {
      key: 'status', label: 'Status', minWidth: '130px', sortable: true, render: row => (
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
          row.status === 'paid'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : row.status === 'unpaid'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : row.status === 'refunded'
            ? 'bg-sky-50 text-sky-700 border-sky-200'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions', label: 'Actions', minWidth: '110px', sortable: false, render: row => (
        <button
          onClick={() => handleDeleteInvoice(row.id)}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all"
        >
          Delete
        </button>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Universal Header (Navbar) */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Tab Navigation Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')} className="text-xs font-semibold text-slate-500 hover:text-blue-900 flex items-center gap-1">
              <span>←</span> Dashboard
            </button>
            <span className="text-slate-300">|</span>
            <h1 className="text-xl font-bold text-slate-900">Invoice Master</h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-xl border border-slate-300">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'config'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🧾 Invoice & Billing Configuration
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'records'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 Invoices & Billing History
            </button>
          </div>
        </div>

        {/* TAB 1: INVOICE & BILLING CONFIGURATION FORM */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">

            {/* Section 1: Invoice Generation & Cancellation Rules */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    🧾
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Invoice Generation & Schedules</h2>
                    <p className="text-xs text-slate-500">Configure advance invoice generation days, continuous billing, and auto-cancellation.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-blue-900 text-white hover:bg-blue-800 shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  {savingConfig ? <><span>⏳</span> Saving...</> : <><span>💾</span> Save Config</>}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Invoice Due Days</label>
                  <input
                    type="number"
                    value={config.invoice_due_days}
                    onChange={e => setConfig({ ...config, invoice_due_days: e.target.value })}
                    placeholder="14"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Days before due date to generate recurring invoices.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Auto Cancellation Days</label>
                  <input
                    type="number"
                    value={config.auto_cancellation_days}
                    onChange={e => setConfig({ ...config, auto_cancellation_days: e.target.value })}
                    placeholder="30"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Days overdue to automatically cancel unpaid services.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Invoice Starting Number</label>
                  <input
                    type="number"
                    value={config.invoice_starting_number}
                    onChange={e => setConfig({ ...config, invoice_starting_number: e.target.value })}
                    placeholder="10001"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Next sequential invoice ID starting number.</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.continuous_invoicing === 'enabled'}
                    onChange={e => setConfig({ ...config, continuous_invoicing: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Continuous Invoice Generation</p>
                    <p className="text-[11px] text-slate-500">Check to generate recurring invoices even if previous invoices are unpaid.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.payment_reminder_emails === 'enabled'}
                    onChange={e => setConfig({ ...config, payment_reminder_emails: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Send Payment Reminders</p>
                    <p className="text-[11px] text-slate-500">Send automated email reminders before and after invoice due dates.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: Late Fees Rules */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                  ⚠️
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Late Fee Policy & Calculation</h2>
                  <p className="text-xs text-slate-500">Configure late fee penalty rules applied to overdue invoices.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Late Fee Type</label>
                  <select
                    value={config.late_fee_type}
                    onChange={e => setConfig({ ...config, late_fee_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Calculation mode for late fees.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Late Fee Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.late_fee_amount}
                    onChange={e => setConfig({ ...config, late_fee_amount: e.target.value })}
                    placeholder="10.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Fee percentage or fixed currency value.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Minimum Invoice Total for Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.late_fee_minimum}
                    onChange={e => setConfig({ ...config, late_fee_minimum: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Minimum total required before late fee applies.</p>
                </div>
              </div>
            </div>

            {/* Section 3: Tax Calculation Settings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  📊
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Tax Settings (VAT / GST)</h2>
                  <p className="text-xs text-slate-500">Configure tax calculations and rates on invoices.</p>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.tax_enabled === 'enabled'}
                    onChange={e => setConfig({ ...config, tax_enabled: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Enable Tax Calculation</p>
                    <p className="text-[11px] text-slate-500">Check to calculate tax on invoices based on client country rules.</p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tax Type</label>
                  <select
                    value={config.tax_type}
                    onChange={e => setConfig({ ...config, tax_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="exclusive">Exclusive (Add tax to price)</option>
                    <option value="inclusive">Inclusive (Price includes tax)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Tax application mode.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tax Name</label>
                  <input
                    type="text"
                    value={config.tax_name}
                    onChange={e => setConfig({ ...config, tax_name: e.target.value })}
                    placeholder="VAT / GST / Sales Tax"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Tax label shown on invoices.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.tax_rate}
                    onChange={e => setConfig({ ...config, tax_rate: e.target.value })}
                    placeholder="18.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:italic focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Default percentage tax rate.</p>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingConfig}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-900 text-white hover:bg-blue-800 shadow-md transition-all flex items-center gap-2"
              >
                {savingConfig ? <><span>⏳</span> Saving Configuration...</> : <><span>💾</span> Save Invoice Configuration</>}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: INVOICES & BILLING HISTORY (DataTable.jsx) */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <DataTable
              tableId="invoice_master_records"
              title="Invoices & Billing History"
              data={invoiceRecords}
              columns={invoiceColumns}
              loading={recordsLoading}
              searchPlaceholder="Search invoices by number, client, status..."
              actionButton={
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-800 shadow-md"
                >
                  <span>+</span> Generate New Invoice
                </button>
              }
            />
          </div>
        )}

        {/* Add Invoice Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Generate New Invoice</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Invoice Number *</label>
                    <input
                      type="text"
                      required
                      value={newInvoice.invoice_number}
                      onChange={e => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
                      placeholder="INV-10004"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={newInvoice.client_name}
                      onChange={e => setNewInvoice({ ...newInvoice, client_name: e.target.value })}
                      placeholder="Acme Corporation"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Invoice Date</label>
                    <input
                      type="date"
                      value={newInvoice.invoice_date}
                      onChange={e => setNewInvoice({ ...newInvoice, invoice_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Due Date</label>
                    <input
                      type="date"
                      value={newInvoice.due_date}
                      onChange={e => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Total Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInvoice.total_amount}
                      onChange={e => setNewInvoice({ ...newInvoice, total_amount: e.target.value })}
                      placeholder="199.99"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={newInvoice.status}
                      onChange={e => setNewInvoice({ ...newInvoice, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingInvoice}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800"
                  >
                    {creatingInvoice ? 'Creating...' : 'Create Invoice Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
