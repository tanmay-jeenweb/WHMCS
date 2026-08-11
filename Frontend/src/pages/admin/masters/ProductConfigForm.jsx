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
  const [fixedTerm, setFixedTerm] = useState(0);

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
  const [configurableOptions, setConfigurableOptions] = useState([
    { id: 1, name: "Extra RAM", type: "Dropdown", choices: "1 GB, 2 GB, 4 GB" }
  ]);

  // Tab 6 Upgrade path
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
                fixedTerm={fixedTerm}
                setFixedTerm={setFixedTerm}
              />
            )}

            {/* 3. MODULE SETTINGS TAB */}
            {activeTab === "module" && (
              <ModuleTab
                moduleName={moduleName}
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
                configurableOptions={configurableOptions}
                setConfigurableOptions={setConfigurableOptions}
              />
            )}

            {/* 6. UPGRADES TAB */}
            {activeTab === "upgrades" && (
              <UpgradesTab
                items={items}
                row={row}
                upgrades={upgrades}
                setUpgrades={setUpgrades}
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
