import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import {
  getInvoiceConfig,
  updateInvoiceConfig
} from '../../../api/invoiceMasterApi';
import toast from 'react-hot-toast';

export default function InvoiceMasterPage() {
  const navigate = useNavigate();

  // General Invoice Config State (Clean empty initial values matching WHMCS screenshot fields)
  const [config, setConfig] = useState({
    continuous_invoice_generation: 'disabled',
    enable_metric_usage_invoicing: 'disabled',
    enable_pdf_invoices: 'disabled',
    pdf_paper_size: 'A4',
    pdf_font_family: 'Helvetica',
    custom_pdf_font: '',
    store_client_data_snapshot: 'disabled',
    enable_mass_payment: 'disabled',
    clients_choose_gateway: 'disabled',
    group_similar_line_items: 'disabled',
    cancellation_request_handling: 'disabled',
    automatic_subscription_management: 'disabled',
    enable_proforma_invoicing: 'disabled',
    sequential_paid_invoice_numbering: 'disabled',
    sequential_invoice_number_format: '{NUMBER}',
    next_paid_invoice_number: '1',
    late_fee_type: 'percentage',
    late_fee_amount: '10.00',
    late_fee_minimum: '0.00',
    accepted_credit_card_types: 'Visa,MasterCard,Discover,American Express,JCB',
    issue_number_start_date: 'disabled',
    invoice_incrementation: '1',
    credit_note_number_incrementation: '1',
    debit_note_number_incrementation: '1',
    invoice_starting_number: '1'
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [cardDropdownOpen, setCardDropdownOpen] = useState(false);

  const cardOptions = [
    'Visa',
    'MasterCard',
    'Discover',
    'American Express',
    'JCB',
    'Diners Club',
    'Maestro',
    'Dankort',
    'Forbrugsforeningen',
    'UnionPay',
    'TROY'
  ];

  const selectedCards = config.accepted_credit_card_types ? config.accepted_credit_card_types.split(',').filter(Boolean) : [];

  const handleCardToggle = (card) => {
    let updated;
    if (selectedCards.includes(card)) {
      updated = selectedCards.filter(c => c !== card);
    } else {
      updated = [...selectedCards, card];
    }
    setConfig({ ...config, accepted_credit_card_types: updated.join(',') });
  };

  const fetchConfig = async () => {
    try {
      const res = await getInvoiceConfig();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setConfig({
          continuous_invoice_generation: data.continuous_invoice_generation || 'disabled',
          enable_metric_usage_invoicing: data.enable_metric_usage_invoicing || 'disabled',
          enable_pdf_invoices: data.enable_pdf_invoices || 'disabled',
          pdf_paper_size: data.pdf_paper_size || 'A4',
          pdf_font_family: data.pdf_font_family || 'Helvetica',
          custom_pdf_font: data.custom_pdf_font || '',
          store_client_data_snapshot: data.store_client_data_snapshot || 'disabled',
          enable_mass_payment: data.enable_mass_payment || 'disabled',
          clients_choose_gateway: data.clients_choose_gateway || 'disabled',
          group_similar_line_items: data.group_similar_line_items || 'disabled',
          cancellation_request_handling: data.cancellation_request_handling || 'disabled',
          automatic_subscription_management: data.automatic_subscription_management || 'disabled',
          enable_proforma_invoicing: data.enable_proforma_invoicing || 'disabled',
          sequential_paid_invoice_numbering: data.sequential_paid_invoice_numbering || 'disabled',
          sequential_invoice_number_format: data.sequential_invoice_number_format || '{NUMBER}',
          next_paid_invoice_number: data.next_paid_invoice_number !== null ? String(data.next_paid_invoice_number) : '1',
          late_fee_type: data.late_fee_type || 'percentage',
          late_fee_amount: data.late_fee_amount !== null ? String(data.late_fee_amount) : '10.00',
          late_fee_minimum: data.late_fee_minimum !== null ? String(data.late_fee_minimum) : '0.00',
          accepted_credit_card_types: data.accepted_credit_card_types || 'Visa,MasterCard,Discover,American Express,JCB',
          issue_number_start_date: data.issue_number_start_date || 'disabled',
          invoice_incrementation: data.invoice_incrementation !== null ? String(data.invoice_incrementation) : '1',
          credit_note_number_incrementation: data.credit_note_number_incrementation !== null ? String(data.credit_note_number_incrementation) : '1',
          debit_note_number_incrementation: data.debit_note_number_incrementation !== null ? String(data.debit_note_number_incrementation) : '1',
          invoice_starting_number: data.invoice_starting_number !== null ? String(data.invoice_starting_number) : '1'
        });
      }
    } catch (err) {
      console.error("Failed to load invoice config", err);
    }
  };

  useEffect(() => {
    fetchConfig();
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

  return (
    <div className="flex-1 bg-slate-50 font-sans text-slate-900">
      {/* Universal Header (Navbar) */}
      <Navbar title="CRM Admin" />

      {/* Main Container */}
      <main className="mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invoice Master</h1>
            <p className="text-slate-500 mt-1">Configure automated invoicing, late fee penalties, PDF format preferences, and sequential numbering rules.</p>
          </div>
          
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSaveConfig} className="space-y-8">

            {/* Section 1: General Invoice Settings */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  🧾
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">General Invoicing Preferences</h2>
                  <p className="text-xs text-slate-500">Enable metric usage billing, snapshot generation, mass payments, and line item grouping.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Continuous Invoice Generation */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.continuous_invoice_generation === 'enabled'}
                    onChange={e => setConfig({ ...config, continuous_invoice_generation: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Continuous Invoice Generation</p>
                    <p className="text-[11px] text-slate-500">Generate invoices for each cycle even if previous remains unpaid.</p>
                  </div>
                </label>

                {/* 2. Enable Metric Usage Invoicing */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enable_metric_usage_invoicing === 'enabled'}
                    onChange={e => setConfig({ ...config, enable_metric_usage_invoicing: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Metric Usage Invoicing</p>
                    <p className="text-[11px] text-slate-500">Check to enable invoicing of metric usage for all priced product metrics.</p>
                  </div>
                </label>

                {/* 3. Store Client Data Snapshot */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.store_client_data_snapshot === 'enabled'}
                    onChange={e => setConfig({ ...config, store_client_data_snapshot: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Store Client Data Snapshot</p>
                    <p className="text-[11px] text-slate-500">Preserve client details upon invoice generation to prevent profile changes.</p>
                  </div>
                </label>

                {/* 4. Enable Mass Payment */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enable_mass_payment === 'enabled'}
                    onChange={e => setConfig({ ...config, enable_mass_payment: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Enable Mass Payment</p>
                    <p className="text-[11px] text-slate-500">Check to enable the multiple invoice payment options on homepage.</p>
                  </div>
                </label>

                {/* 5. Clients Choose Gateway */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.clients_choose_gateway === 'enabled'}
                    onChange={e => setConfig({ ...config, clients_choose_gateway: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Clients Choose Gateway</p>
                    <p className="text-[11px] text-slate-500">Check to allow clients to choose the gateway they pay with.</p>
                  </div>
                </label>

                {/* 6. Group Similar Line Items */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.group_similar_line_items === 'enabled'}
                    onChange={e => setConfig({ ...config, group_similar_line_items: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Group Similar Line Items</p>
                    <p className="text-[11px] text-slate-500">Check to automatically group identical line items into quantity x format.</p>
                  </div>
                </label>

                {/* 7. Cancellation Request Handling */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.cancellation_request_handling === 'enabled'}
                    onChange={e => setConfig({ ...config, cancellation_request_handling: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Cancellation Request Handling</p>
                    <p className="text-[11px] text-slate-500">Automatically cancel unpaid invoices when cancellation is submitted.</p>
                  </div>
                </label>

                {/* 8. Automatic Subscription Management */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.automatic_subscription_management === 'enabled'}
                    onChange={e => setConfig({ ...config, automatic_subscription_management: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Subscription Management</p>
                    <p className="text-[11px] text-slate-500">Auto-cancel subscription agreements on Upgrade or Cancellation.</p>
                  </div>
                </label>

                {/* 9. Enable Proforma Invoicing */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enable_proforma_invoicing === 'enabled'}
                    onChange={e => setConfig({ ...config, enable_proforma_invoicing: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Enable Proforma Invoicing</p>
                    <p className="text-[11px] text-slate-500">Check to enable proforma invoicing for unpaid invoices.</p>
                  </div>
                </label>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: PDF Invoice Configurations */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                  📄
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">PDF Invoice Configurations</h2>
                  <p className="text-xs text-slate-500">Set up PDF file formats, page sizing, and custom font mapping.</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Enable PDF Invoices Checkbox */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enable_pdf_invoices === 'enabled'}
                    onChange={e => setConfig({ ...config, enable_pdf_invoices: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Enable PDF Invoices</p>
                    <p className="text-[11px] text-slate-500">Check to send PDF versions of invoices along with invoice emails.</p>
                  </div>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* PDF Paper Size */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">PDF Paper Size</label>
                    <select
                      value={config.pdf_paper_size}
                      onChange={e => setConfig({ ...config, pdf_paper_size: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                    </select>
                    <p className="text-[11px] text-slate-500">Choose the paper format to use when generating PDF files.</p>
                  </div>

                  {/* PDF Font Family */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">PDF Font Family</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200">
                      {['Courier', 'Freesans', 'Helvetica', 'Times', 'Dejavusans', 'Custom'].map(font => (
                        <label key={font} className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="pdf_font_family"
                            value={font}
                            checked={config.pdf_font_family === font}
                            onChange={e => setConfig({ ...config, pdf_font_family: e.target.value })}
                            className="h-3.5 w-3.5 text-blue-900"
                          />
                          {font}
                        </label>
                      ))}
                    </div>
                    {config.pdf_font_family === 'Custom' && (
                      <div className="mt-2 space-y-1">
                        <input
                          type="text"
                          value={config.custom_pdf_font}
                          onChange={e => setConfig({ ...config, custom_pdf_font: e.target.value })}
                          placeholder="Enter custom PDF font family name"
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-900 focus:border-blue-600 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Invoice Numbering & Incrementation */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                  🔢
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Invoice Numbering & Incrementation</h2>
                  <p className="text-xs text-slate-500">Configure sequential numbering, formats, next invoice IDs, and credit note increments.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Sequential Paid Invoice Numbering */}
                  <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.sequential_paid_invoice_numbering === 'enabled'}
                      onChange={e => setConfig({ ...config, sequential_paid_invoice_numbering: e.target.checked ? 'enabled' : 'disabled' })}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Sequential Paid Invoice Numbering</p>
                      <p className="text-[11px] text-slate-500">Check to enable automatic sequential numbering of paid invoices.</p>
                    </div>
                  </label>

                  {/* Sequential Invoice Number Format */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sequential Invoice Number Format</label>
                    <input
                      type="text"
                      value={config.sequential_invoice_number_format}
                      onChange={e => setConfig({ ...config, sequential_invoice_number_format: e.target.value })}
                      placeholder="{NUMBER}"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                    />
                    <p className="text-[11px] text-slate-500">Available auto-insert tags: {`{YEAR}`} {`{MONTH}`} {`{DAY}`} {`{NUMBER}`}.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {/* Next Paid Invoice Number */}
                  <div className="space-y-1 col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Next Paid Invoice Number</label>
                    <input
                      type="number"
                      value={config.next_paid_invoice_number}
                      onChange={e => setConfig({ ...config, next_paid_invoice_number: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-blue-600 outline-none"
                    />
                  </div>

                  {/* Invoice Incrementation */}
                  <div className="space-y-1 col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Invoice # Incrementation</label>
                    <input
                      type="number"
                      value={config.invoice_incrementation}
                      onChange={e => setConfig({ ...config, invoice_incrementation: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-blue-600 outline-none"
                    />
                  </div>

                  {/* Credit Note Number Incrementation */}
                  <div className="space-y-1 col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Credit Note Incrementation</label>
                    <input
                      type="number"
                      value={config.credit_note_number_incrementation}
                      onChange={e => setConfig({ ...config, credit_note_number_incrementation: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-blue-600 outline-none"
                    />
                  </div>

                  {/* Debit Note Number Incrementation */}
                  <div className="space-y-1 col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Debit Note Incrementation</label>
                    <input
                      type="number"
                      value={config.debit_note_number_incrementation}
                      onChange={e => setConfig({ ...config, debit_note_number_incrementation: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-blue-600 outline-none"
                    />
                  </div>

                  {/* Invoice Starting Number */}
                  <div className="space-y-1 col-span-4">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Invoice Starting #</label>
                    <input
                      type="number"
                      value={config.invoice_starting_number}
                      onChange={e => setConfig({ ...config, invoice_starting_number: e.target.value })}
                      placeholder="1"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 4: Late Fees & Credit Cards */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                  💳
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Late Fees & Accepted Credit Cards</h2>
                  <p className="text-xs text-slate-500">Configure late fee calculation amounts, minimums, accepted cards, and start dates.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Late Fee Type */}
                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Late Fee Type</label>
                  <div className="flex gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="late_fee_type"
                        value="percentage"
                        checked={config.late_fee_type === 'percentage'}
                        onChange={e => setConfig({ ...config, late_fee_type: e.target.value })}
                        className="h-3.5 w-3.5 text-blue-900"
                      />
                      Percentage
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="late_fee_type"
                        value="fixed"
                        checked={config.late_fee_type === 'fixed'}
                        onChange={e => setConfig({ ...config, late_fee_type: e.target.value })}
                        className="h-3.5 w-3.5 text-blue-900"
                      />
                      Fixed Amount
                    </label>
                  </div>
                </div>

                {/* Late Fee Amount */}
                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Late Fee Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.late_fee_amount}
                    onChange={e => setConfig({ ...config, late_fee_amount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Enter percentage or monetary value to apply (0 to disable).</p>
                </div>

                {/* Late Fee Minimum */}
                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Late Fee Minimum</label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.late_fee_minimum}
                    onChange={e => setConfig({ ...config, late_fee_minimum: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Enter the minimum amount to charge when calculated late fee falls below this.</p>
                </div>

                {/* Accepted Credit Card Types (Dropdown with checkboxes) */}
                <div className="space-y-1.5 md:col-span-2 relative">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Accepted Credit Card Types</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCardDropdownOpen(!cardDropdownOpen)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-left flex justify-between items-center transition-all cursor-pointer"
                    >
                      <span className="truncate">
                        {selectedCards.length > 0 ? selectedCards.join(', ') : 'Select accepted credit cards...'}
                      </span>
                      <svg className={`w-4 h-4 text-slate-500 transition-transform ${cardDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {cardDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setCardDropdownOpen(false)} />
                        <div className="absolute left-0 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-20 space-y-1">
                          {cardOptions.map(card => {
                            const isChecked = selectedCards.includes(card);
                            return (
                              <label
                                key={card}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm text-slate-900 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCardToggle(card)}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="font-medium">{card}</span>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">Select the credit card brands you want to accept during payment transactions.</p>
                </div>

                {/* Issue Number/Start Date */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer self-center">
                  <input
                    type="checkbox"
                    checked={config.issue_number_start_date === 'enabled'}
                    onChange={e => setConfig({ ...config, issue_number_start_date: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Issue Number/Start Date</p>
                    <p className="text-[11px] text-slate-500">Check to show these fields for credit card payments.</p>
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
