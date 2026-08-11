import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getProductConfigDetails, saveProductConfigDetails } from "../../../api/productMasterApi.js";

// Tab Sub-components
import DetailsTab from "./config/DetailsTab.jsx";
import PricingTab from "./config/PricingTab.jsx";
import ModuleTab from "./config/ModuleTab.jsx";
import CustomFieldsTab from "./config/CustomFieldsTab.jsx";
import OptionsTab from "./config/OptionsTab.jsx";
import UpgradesTab from "./config/UpgradesTab.jsx";
import CrossSellsTab from "./config/CrossSellsTab.jsx";
import LinksTab from "./config/LinksTab.jsx";

export default function ProductConfigForm({ row, productGroups, items = [], onClose }) {
  const [activeTab, setActiveTab] = useState("details");

  // Tab 1: Details States
  const [productName, setProductName] = useState(row?.product_name || "");
  const [productType, setProductType] = useState(row?.product_type || "Shared hosting");
  const [productGroupName, setProductGroupName] = useState(row?.product_group_name || "");
  const [productTagline, setProductTagline] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [productColor, setProductColor] = useState("#0056cf");
  const [welcomeEmail, setWelcomeEmail] = useState("hosting account welcome email");
  const [requireDomain, setRequireDomain] = useState(false);
  const [applyTax, setApplyTax] = useState(false);
  const [enableStock, setEnableStock] = useState(false);
  const [stockQty, setStockQty] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [retired, setRetired] = useState(false);

  // Tab 2: Pricing States
  const [paymentType, setPaymentType] = useState("recurring");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [monthlySetup, setMonthlySetup] = useState("");
  const [quarterlyPrice, setQuarterlyPrice] = useState("");
  const [quarterlySetup, setQuarterlySetup] = useState("");
  const [semiannuallyPrice, setSemiannuallyPrice] = useState("");
  const [semiannuallySetup, setSemiannuallySetup] = useState("");
  const [annuallyPrice, setAnnuallyPrice] = useState("");
  const [annuallySetup, setAnnuallySetup] = useState("");
  const [bienniallyPrice, setBienniallyPrice] = useState("");
  const [bienniallySetup, setBienniallySetup] = useState("");
  const [trienniallyPrice, setTrienniallyPrice] = useState("");
  const [trienniallySetup, setTrienniallySetup] = useState("");
  
  const [allowMultipleQuantities, setAllowMultipleQuantities] = useState("no");
  const [recurringCyclesLimit, setRecurringCyclesLimit] = useState(0);
  const [fixedTerm, setFixedTerm] = useState(0);
  const [terminationEmail, setTerminationEmail] = useState("None");
  const [prorataBilling, setProrataBilling] = useState(false);
  const [prorataDate, setProrataDate] = useState(0);
  const [chargeNextMonth, setChargeNextMonth] = useState(0);
  const [onDemandRenewals, setOnDemandRenewals] = useState("system_default");
  const [allowEarlyRenewals, setAllowEarlyRenewals] = useState(false);
  const [earlyRenewalMonthly, setEarlyRenewalMonthly] = useState(31);
  const [earlyRenewalQuarterly, setEarlyRenewalQuarterly] = useState(92);
  const [earlyRenewalSemiannually, setEarlyRenewalSemiannually] = useState(184);
  const [earlyRenewalAnnually, setEarlyRenewalAnnually] = useState(366);
  const [earlyRenewalBiennially, setEarlyRenewalBiennially] = useState(731);
  const [earlyRenewalTriennially, setEarlyRenewalTriennially] = useState(1096);

  // Tab 3: Module Settings States
  const [moduleName, setModuleName] = useState(row?.module_name || "No Module");
  const [serverGroup, setServerGroup] = useState("None");
  const [cpanelPackage, setCpanelPackage] = useState("");
  const [cpanelQuota, setCpanelQuota] = useState("");
  const [cpanelBandwidth, setCpanelBandwidth] = useState("");
  const [cpanelMaxFtp, setCpanelMaxFtp] = useState("");
  const [provisionType, setProvisionType] = useState("manual");

  // Tab 4: Custom Fields States
  const [customFields, setCustomFields] = useState([
    { id: 1, name: "OS Version", type: "Dropdown", description: "Select operating system", regex: "", required: true, showOnOrder: true }
  ]);

  // Tab 5: Configurable Options States
  const [assignedOptionGroups, setAssignedOptionGroups] = useState("");
  const [configurableOptions, setConfigurableOptions] = useState([
    { id: 1, name: "Extra RAM", type: "Dropdown", choices: "1 GB, 2 GB, 4 GB" }
  ]);

  // Tab 6 Upgrade path
  const [upgradePackages, setUpgradePackages] = useState([]);
  const [upgradeConfigOptions, setUpgradeConfigOptions] = useState(false);
  const [upgradeEmail, setUpgradeEmail] = useState("None");
  const [upgrades, setUpgrades] = useState([]);

  // Tab 7 Recommendation path
  const [crossSells, setCrossSells] = useState([]);

  // Tab 8 Link Options
  const [url, setUrl] = useState(row?.url || "");
  const [customCheckoutUrl, setCustomCheckoutUrl] = useState("");

  const TABS = [
    { id: "details", label: "Details" },
    { id: "pricing", label: "Pricing" },
    { id: "module", label: "Module Settings" },
    { id: "customFields", label: "Custom Fields" },
    { id: "configurableOptions", label: "Configurable Options" },
    { id: "upgrades", label: "Upgrades" },
    { id: "crossSells", label: "Cross-sells" },
    { id: "links", label: "Links" }
  ];

  // Fetch product configuration details from backend on mount/row change
  useEffect(() => {
    if (row?.id) {
      getProductConfigDetails(row.id)
        .then((res) => {
          if (res.data?.success && res.data.data) {
            const d = res.data.data;
            setProductTagline(d.product_tagline || "");
            setShortDescription(d.short_description || "");
            setDescription(d.description || "");
            setProductColor(d.product_color || "#0056cf");
            setWelcomeEmail(d.welcome_email || "hosting account welcome email");
            setRequireDomain(d.require_domain === 1);
            setApplyTax(d.apply_tax === 1);
            setFeatured(d.featured === 1);
            setHidden(d.hidden === 1);
            setEnableStock(d.enable_stock === 1);
            setStockQty(d.stock_qty || 0);
            setRetired(d.retired === 1);

            // Pricing fields
            setPaymentType(d.payment_type || "recurring");
            setMonthlyPrice(d.monthly_price || "");
            setMonthlySetup(d.monthly_setup || "");
            setQuarterlyPrice(d.quarterly_price || "");
            setQuarterlySetup(d.quarterly_setup || "");
            setSemiannuallyPrice(d.semiannually_price || "");
            setSemiannuallySetup(d.semiannually_setup || "");
            setAnnuallyPrice(d.annually_price || "");
            setAnnuallySetup(d.annually_setup || "");
            setBienniallyPrice(d.biennially_price || "");
            setBienniallySetup(d.biennially_setup || "");
            setTrienniallyPrice(d.triennially_price || "");
            setTrienniallySetup(d.triennially_setup || "");

            setAllowMultipleQuantities(d.allow_multiple_quantities || "no");
            setRecurringCyclesLimit(d.recurring_cycles_limit ?? 0);
            setFixedTerm(d.auto_terminate_fixed_term ?? 0);
            setTerminationEmail(d.termination_email || "None");
            setProrataBilling(d.prorata_billing === 1);
            setProrataDate(d.prorata_date ?? 0);
            setChargeNextMonth(d.charge_next_month ?? 0);
            setOnDemandRenewals(d.ondemand_renewals || "system_default");
            setAllowEarlyRenewals(d.allow_early_renewals === 1);
            setEarlyRenewalMonthly(d.early_renewal_monthly ?? 31);
            setEarlyRenewalQuarterly(d.early_renewal_quarterly ?? 92);
            setEarlyRenewalSemiannually(d.early_renewal_semiannually ?? 184);
            setEarlyRenewalAnnually(d.early_renewal_annually ?? 366);
            setEarlyRenewalBiennially(d.early_renewal_biennially ?? 731);
            setEarlyRenewalTriennially(d.early_renewal_triennially ?? 1096);

            // Module Settings
            setServerGroup(d.server_group || "None");
            setCpanelPackage(d.cpanel_package || "");
            setCpanelQuota(d.cpanel_quota || "");
            setCpanelBandwidth(d.cpanel_bandwidth || "");
            setCpanelMaxFtp(d.cpanel_max_ftp || "");
            setProvisionType(d.provision_type || "manual");

            // Configurable Options
            setAssignedOptionGroups(d.assigned_option_groups || "");

            // Upgrade Settings
            let parsedPackages = [];
            if (typeof d.upgrade_packages === 'string') {
              try { parsedPackages = JSON.parse(d.upgrade_packages); } catch(e) { parsedPackages = []; }
            } else if (Array.isArray(d.upgrade_packages)) {
              parsedPackages = d.upgrade_packages;
            }
            setUpgradePackages(parsedPackages);
            setUpgradeConfigOptions(d.upgrade_config_options === 1);
            setUpgradeEmail(d.upgrade_email || "None");

            // Cross-sells Settings
            let parsedCrossSells = [];
            if (typeof d.cross_sells === 'string') {
              try { parsedCrossSells = JSON.parse(d.cross_sells); } catch(e) { parsedCrossSells = []; }
            } else if (Array.isArray(d.cross_sells)) {
              parsedCrossSells = d.cross_sells;
            }
            setCrossSells(parsedCrossSells);

            // Custom Fields
            if (Array.isArray(d.custom_fields)) {
              setCustomFields(d.custom_fields);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load product configuration details:", err);
        });
    }
  }, [row]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const detailsData = {
        // Details
        product_tagline: productTagline,
        short_description: shortDescription,
        description: description,
        product_color: productColor,
        welcome_email: welcomeEmail,
        require_domain: requireDomain,
        apply_tax: applyTax,
        featured: featured,
        hidden: hidden,
        enable_stock: enableStock,
        stock_qty: stockQty,
        retired: retired,

        // Pricing
        payment_type: paymentType,
        monthly_price: monthlyPrice,
        monthly_setup: monthlySetup,
        quarterly_price: quarterlyPrice,
        quarterly_setup: quarterlySetup,
        semiannually_price: semiannuallyPrice,
        semiannually_setup: semiannuallySetup,
        annually_price: annuallyPrice,
        annually_setup: annuallySetup,
        biennially_price: bienniallyPrice,
        biennially_setup: bienniallySetup,
        triennially_price: trienniallyPrice,
        triennially_setup: trienniallySetup,

        allow_multiple_quantities: allowMultipleQuantities,
        recurring_cycles_limit: recurringCyclesLimit,
        auto_terminate_fixed_term: fixedTerm,
        termination_email: terminationEmail,
        prorata_billing: prorataBilling,
        prorata_date: prorataDate,
        charge_next_month: chargeNextMonth,
        ondemand_renewals: onDemandRenewals,
        allow_early_renewals: allowEarlyRenewals,
        early_renewal_monthly: earlyRenewalMonthly,
        early_renewal_quarterly: earlyRenewalQuarterly,
        early_renewal_semiannually: earlyRenewalSemiannually,
        early_renewal_annually: earlyRenewalAnnually,
        early_renewal_biennially: earlyRenewalBiennially,
        early_renewal_triennially: earlyRenewalTriennially,

        // Module Settings
        module_name: moduleName,
        server_group: serverGroup,
        cpanel_package: cpanelPackage,
        cpanel_quota: cpanelQuota,
        cpanel_bandwidth: cpanelBandwidth,
        cpanel_max_ftp: cpanelMaxFtp,
        provision_type: provisionType,

        // Configurable Options
        assigned_option_groups: assignedOptionGroups,

        // Upgrade Settings
        upgrade_packages: upgradePackages,
        upgrade_config_options: upgradeConfigOptions,
        upgrade_email: upgradeEmail,

        // Cross Sells
        cross_sells: crossSells,

        // Custom Fields
        custom_fields: customFields
      };

      const res = await saveProductConfigDetails(row.id, detailsData);
      if (res.data?.success) {
        toast.success("Product configuration details saved successfully!");
      } else {
        toast.error("Failed to save product details configuration.");
      }
      onClose();
    } catch (error) {
      console.error("Error saving product configuration details:", error);
      toast.error("An error occurred while saving configuration details.");
    }
  };

  return (
    <div className="flex-1 font-sans text-slate-900">
      {/* Form Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Configure Product Options - {productName}
          </h1>
          <p className="text-slate-500 mt-1">
            Setup custom pricing, custom fields, module logic, and client upgrade routes.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 font-medium text-sm flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Directory
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1 mb-[-1px] relative z-10">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-blue-600 border-slate-200 border-b-white shadow-sm"
                  : "bg-slate-50/50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
              }`}
              style={{ borderBottomColor: isActive ? '#ffffff' : undefined }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Container */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 rounded-tl-none">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="min-h-[350px]">
            {/* 1. DETAILS TAB */}
            {activeTab === "details" && (
              <DetailsTab
                productType={productType}
                productGroupName={productGroupName}
                productName={productName}
                productTagline={productTagline}
                setProductTagline={setProductTagline}
                url={url}
                productColor={productColor}
                setProductColor={setProductColor}
                welcomeEmail={welcomeEmail}
                setWelcomeEmail={setWelcomeEmail}
                shortDescription={shortDescription}
                setShortDescription={setShortDescription}
                description={description}
                setDescription={setDescription}
                requireDomain={requireDomain}
                setRequireDomain={setRequireDomain}
                applyTax={applyTax}
                setApplyTax={setApplyTax}
                featured={featured}
                setFeatured={setFeatured}
                hidden={hidden}
                setHidden={setHidden}
                enableStock={enableStock}
                setEnableStock={setEnableStock}
                stockQty={stockQty}
                setStockQty={setStockQty}
                retired={retired}
                setRetired={setRetired}
              />
            )}

            {/* 2. PRICING TAB */}
            {activeTab === "pricing" && (
              <PricingTab
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                monthlyPrice={monthlyPrice}
                setMonthlyPrice={setMonthlyPrice}
                monthlySetup={monthlySetup}
                setMonthlySetup={setMonthlySetup}
                quarterlyPrice={quarterlyPrice}
                setQuarterlyPrice={setQuarterlyPrice}
                quarterlySetup={quarterlySetup}
                setQuarterlySetup={setQuarterlySetup}
                semiannuallyPrice={semiannuallyPrice}
                setSemiannuallyPrice={setSemiannuallyPrice}
                semiannuallySetup={semiannuallySetup}
                setSemiannuallySetup={setSemiannuallySetup}
                annuallyPrice={annuallyPrice}
                setAnnuallyPrice={setAnnuallyPrice}
                annuallySetup={annuallySetup}
                setAnnuallySetup={setAnnuallySetup}
                bienniallyPrice={bienniallyPrice}
                setBienniallyPrice={setBienniallyPrice}
                bienniallySetup={bienniallySetup}
                setBienniallySetup={setBienniallySetup}
                trienniallyPrice={trienniallyPrice}
                setTrienniallyPrice={setTrienniallyPrice}
                trienniallySetup={trienniallySetup}
                setTrienniallySetup={setTrienniallySetup}
                allowMultipleQuantities={allowMultipleQuantities}
                setAllowMultipleQuantities={setAllowMultipleQuantities}
                recurringCyclesLimit={recurringCyclesLimit}
                setRecurringCyclesLimit={setRecurringCyclesLimit}
                fixedTerm={fixedTerm}
                setFixedTerm={setFixedTerm}
                terminationEmail={terminationEmail}
                setTerminationEmail={setTerminationEmail}
                prorataBilling={prorataBilling}
                setProrataBilling={setProrataBilling}
                prorataDate={prorataDate}
                setProrataDate={setProrataDate}
                chargeNextMonth={chargeNextMonth}
                setChargeNextMonth={setChargeNextMonth}
                onDemandRenewals={onDemandRenewals}
                setOnDemandRenewals={setOnDemandRenewals}
                allowEarlyRenewals={allowEarlyRenewals}
                setAllowEarlyRenewals={setAllowEarlyRenewals}
                earlyRenewalMonthly={earlyRenewalMonthly}
                setEarlyRenewalMonthly={setEarlyRenewalMonthly}
                earlyRenewalQuarterly={earlyRenewalQuarterly}
                setEarlyRenewalQuarterly={setEarlyRenewalQuarterly}
                earlyRenewalSemiannually={earlyRenewalSemiannually}
                setEarlyRenewalSemiannually={setEarlyRenewalSemiannually}
                earlyRenewalAnnually={earlyRenewalAnnually}
                setEarlyRenewalAnnually={setEarlyRenewalAnnually}
                earlyRenewalBiennially={earlyRenewalBiennially}
                setEarlyRenewalBiennially={setEarlyRenewalBiennially}
                earlyRenewalTriennially={earlyRenewalTriennially}
                setEarlyRenewalTriennially={setEarlyRenewalTriennially}
              />
            )}

            {/* 3. MODULE SETTINGS TAB */}
            {activeTab === "module" && (
              <ModuleTab
                moduleName={moduleName}
                setModuleName={setModuleName}
                serverGroup={serverGroup}
                setServerGroup={setServerGroup}
                cpanelPackage={cpanelPackage}
                setCpanelPackage={setCpanelPackage}
                cpanelQuota={cpanelQuota}
                setCpanelQuota={setCpanelQuota}
                cpanelBandwidth={cpanelBandwidth}
                setCpanelBandwidth={setCpanelBandwidth}
                cpanelMaxFtp={cpanelMaxFtp}
                setCpanelMaxFtp={setCpanelMaxFtp}
                provisionType={provisionType}
                setProvisionType={setProvisionType}
              />
            )}

            {/* 4. CUSTOM FIELDS TAB */}
            {activeTab === "customFields" && (
              <CustomFieldsTab
                customFields={customFields}
                setCustomFields={setCustomFields}
              />
            )}

            {/* 5. CONFIGURABLE OPTIONS TAB */}
            {activeTab === "configurableOptions" && (
              <OptionsTab
                assignedOptionGroups={assignedOptionGroups}
                setAssignedOptionGroups={setAssignedOptionGroups}
              />
            )}

            {/* 6. UPGRADES TAB */}
            {activeTab === "upgrades" && (
              <UpgradesTab
                items={items}
                row={row}
                upgradePackages={upgradePackages}
                setUpgradePackages={setUpgradePackages}
                upgradeConfigOptions={upgradeConfigOptions}
                setUpgradeConfigOptions={setUpgradeConfigOptions}
                upgradeEmail={upgradeEmail}
                setUpgradeEmail={setUpgradeEmail}
              />
            )}

            {/* 7. CROSS-SELLS TAB */}
            {activeTab === "crossSells" && (
              <CrossSellsTab
                items={items}
                row={row}
                crossSells={crossSells}
                setCrossSells={setCrossSells}
              />
            )}

            {/* 8. LINKS TAB */}
            {activeTab === "links" && (
              <LinksTab
                row={row}
                url={url}
                customCheckoutUrl={customCheckoutUrl}
                setCustomCheckoutUrl={setCustomCheckoutUrl}
              />
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 font-semibold text-sm cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#0056cf] hover:bg-[#0040a1] focus:ring-2 focus:ring-offset-2 focus:ring-[#0056cf] transition-colors cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
