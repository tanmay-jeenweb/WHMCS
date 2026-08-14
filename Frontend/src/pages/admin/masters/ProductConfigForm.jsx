import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { 
  getProductConfigDetails, 
  saveProductConfigDetails,
  getProductConfigPricing,
  saveProductConfigPricing,
  getProductConfigModule,
  saveProductConfigModule,
  getProductConfigCustomFields,
  saveProductConfigCustomFields,
  getProductConfigOptions,
  saveProductConfigOptions,
  getProductConfigUpgrades,
  saveProductConfigUpgrades,
  getProductConfigCrossSells,
  saveProductConfigCrossSells,
  getProductConfigLinks,
  saveProductConfigLinks
} from "../../../api/productMasterApi.js";

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

  // Fetch product configurations from separate backend endpoints on mount/row change
  useEffect(() => {
    if (row?.id) {
      Promise.all([
        getProductConfigDetails(row.id),
        getProductConfigPricing(row.id),
        getProductConfigModule(row.id),
        getProductConfigCustomFields(row.id),
        getProductConfigOptions(row.id),
        getProductConfigUpgrades(row.id),
        getProductConfigCrossSells(row.id),
        getProductConfigLinks(row.id)
      ])
        .then(([resDetails, resPricing, resModule, resCustomFields, resOptions, resUpgrades, resCrossSells, resLinks]) => {
          // Details
          if (resDetails.data?.success && resDetails.data.data) {
            const d = resDetails.data.data;
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
          }
          // Pricing
          if (resPricing.data?.success && resPricing.data.data) {
            const p = resPricing.data.data;
            setPaymentType(p.payment_type || "recurring");
            setMonthlyPrice(p.monthly_price || "");
            setMonthlySetup(p.monthly_setup || "");
            setQuarterlyPrice(p.quarterly_price || "");
            setQuarterlySetup(p.quarterly_setup || "");
            setSemiannuallyPrice(p.semiannually_price || "");
            setSemiannuallySetup(p.semiannually_setup || "");
            setAnnuallyPrice(p.annually_price || "");
            setAnnuallySetup(p.annually_setup || "");
            setBienniallyPrice(p.biennially_price || "");
            setBienniallySetup(p.biennially_setup || "");
            setTrienniallyPrice(p.triennially_price || "");
            setTrienniallySetup(p.triennially_setup || "");
            setAllowMultipleQuantities(p.allow_multiple_quantities || "no");
            setRecurringCyclesLimit(p.recurring_cycles_limit ?? 0);
            setFixedTerm(p.fixed_term ?? 0);
            setTerminationEmail(p.termination_email || "None");
            setProrataBilling(p.prorata_billing === 1);
            setProrataDate(p.prorata_date ?? 0);
            setChargeNextMonth(p.charge_next_month ?? 0);
            setOnDemandRenewals(p.ondemand_renewals || "system_default");
            setAllowEarlyRenewals(p.allow_early_renewals === 1);
            setEarlyRenewalMonthly(p.early_renewal_monthly ?? 31);
            setEarlyRenewalQuarterly(p.early_renewal_quarterly ?? 92);
            setEarlyRenewalSemiannually(p.early_renewal_semiannually ?? 184);
            setEarlyRenewalAnnually(p.early_renewal_annually ?? 366);
            setEarlyRenewalBiennially(p.early_renewal_biennially ?? 731);
            setEarlyRenewalTriennially(p.early_renewal_triennially ?? 1096);
          }
          // Module Settings
          if (resModule.data?.success && resModule.data.data) {
            const m = resModule.data.data;
            setServerGroup(m.server_group || "None");
            setCpanelPackage(m.cpanel_package || "");
            setCpanelQuota(m.cpanel_quota || "");
            setCpanelBandwidth(m.cpanel_bandwidth || "");
            setCpanelMaxFtp(m.cpanel_max_ftp || "");
            setProvisionType(m.provision_type || "manual");
          }
          // Custom Fields
          if (resCustomFields.data?.success && resCustomFields.data.data) {
            setCustomFields(resCustomFields.data.data || []);
          }
          // Options
          if (resOptions.data?.success && resOptions.data.data) {
            try {
              const opts = typeof resOptions.data.data.assigned_option_groups === 'string' 
                ? JSON.parse(resOptions.data.data.assigned_option_groups) 
                : (resOptions.data.data.assigned_option_groups || []);
              setConfigurableOptions(opts);
            } catch (e) {
              setConfigurableOptions([]);
            }
          }
          // Upgrades
          if (resUpgrades.data?.success && resUpgrades.data.data) {
            try {
              const upgs = typeof resUpgrades.data.data.upgrade_packages === 'string' 
                ? JSON.parse(resUpgrades.data.data.upgrade_packages) 
                : (resUpgrades.data.data.upgrade_packages || []);
              setUpgrades(upgs);
            } catch (e) {
              setUpgrades([]);
            }
            setUpgradeConfigOptions(resUpgrades.data.data.upgrade_config_options === 1);
            setUpgradeEmail(resUpgrades.data.data.upgrade_email || "None");
          }
          // Cross-sells
          if (resCrossSells.data?.success && resCrossSells.data.data) {
            try {
              const sells = typeof resCrossSells.data.data.cross_sells === 'string' 
                ? JSON.parse(resCrossSells.data.data.cross_sells) 
                : (resCrossSells.data.data.cross_sells || []);
              setCrossSells(sells);
            } catch (e) {
              setCrossSells([]);
            }
          }
          // Links
          if (resLinks.data?.success && resLinks.data.data) {
            setCustomCheckoutUrl(resLinks.data.data.custom_checkout_url || "");
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
      await Promise.all([
        saveProductConfigDetails(row.id, {
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
          retired: retired
        }),
        saveProductConfigPricing(row.id, {
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
          early_renewal_triennially: earlyRenewalTriennially
        }),
        saveProductConfigModule(row.id, {
          server_group: serverGroup,
          cpanel_package: cpanelPackage,
          cpanel_quota: cpanelQuota,
          cpanel_bandwidth: cpanelBandwidth,
          cpanel_max_ftp: cpanelMaxFtp,
          provision_type: provisionType,
          module_name: moduleName
        }),
        saveProductConfigCustomFields(row.id, {
          custom_fields: customFields
        }),
        saveProductConfigOptions(row.id, {
          assigned_option_groups: configurableOptions
        }),
        saveProductConfigUpgrades(row.id, {
          upgrade_packages: upgrades,
          upgrade_config_options: upgradeConfigOptions,
          upgrade_email: upgradeEmail
        }),
        saveProductConfigCrossSells(row.id, {
          cross_sells: crossSells
        }),
        saveProductConfigLinks(row.id, {
          custom_checkout_url: customCheckoutUrl
        })
      ]);

      toast.success("All configuration modules saved successfully!");
      // onClose();
    } catch (error) {
      console.error("Error saving configurations:", error);
      toast.error("An error occurred while saving configuration modules.");
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
                productGroups={productGroups}
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
