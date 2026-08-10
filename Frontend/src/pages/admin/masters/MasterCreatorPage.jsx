import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import DataTable from '../../../components/DataTable';
import {
  getMasterCreatorConfig,
  updateMasterCreatorConfig,
  getAllCustomMasters,
  createCustomMaster,
  deleteCustomMaster
} from '../../../api/masterCreatorApi';
import toast from 'react-hot-toast';

export default function MasterCreatorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'records'

  // Master Creator Config State
  const [config, setConfig] = useState({
    allow_custom_master_creation: 'enabled',
    auto_generate_crud_routes: 'enabled',
    auto_add_to_navbar: 'enabled',
    default_database_engine: 'InnoDB',
    allowed_field_types: 'VARCHAR,TEXT,INT,DECIMAL,ENUM,BOOLEAN,DATETIME'
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // DataTable State for Tab 2
  const [customMasters, setCustomMasters] = useState([]);
  const [mastersLoading, setMastersLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaster, setNewMaster] = useState({
    master_name: '',
    master_key: '',
    icon_class: 'fa-solid fa-cube',
    description: '',
    table_name: '',
    fields_json: '',
    status: 'active'
  });
  const [creatingMaster, setCreatingMaster] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await getMasterCreatorConfig();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setConfig({
          allow_custom_master_creation: data.allow_custom_master_creation || 'enabled',
          auto_generate_crud_routes: data.auto_generate_crud_routes || 'enabled',
          auto_add_to_navbar: data.auto_add_to_navbar || 'enabled',
          default_database_engine: data.default_database_engine || 'InnoDB',
          allowed_field_types: data.allowed_field_types || 'VARCHAR,TEXT,INT,DECIMAL,ENUM,BOOLEAN,DATETIME'
        });
      }
    } catch (err) {
      console.error("Failed to load master creator config", err);
    }
  };

  const fetchCustomMasters = async () => {
    setMastersLoading(true);
    try {
      const res = await getAllCustomMasters();
      if (res.data?.success) {
        setCustomMasters(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load custom masters", err);
    } finally {
      setMastersLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchCustomMasters();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateMasterCreatorConfig(config);
      toast.success("Master Creator configuration saved to database!");
    } catch (err) {
      toast.error("Failed to save master creator configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateMaster = async (e) => {
    e.preventDefault();
    if (!newMaster.master_name || !newMaster.master_key || !newMaster.table_name) {
      toast.error("Please fill in Master Name, Master Key, and Table Name.");
      return;
    }
    setCreatingMaster(true);
    try {
      await createCustomMaster(newMaster);
      toast.success("New Custom Master created successfully!");
      setShowAddModal(false);
      setNewMaster({
        master_name: '',
        master_key: '',
        icon_class: 'fa-solid fa-cube',
        description: '',
        table_name: '',
        fields_json: '',
        status: 'active'
      });
      fetchCustomMasters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create custom master.");
    } finally {
      setCreatingMaster(false);
    }
  };

  const handleDeleteMaster = async (id) => {
    if (!window.confirm("Are you sure you want to delete this custom master definition?")) return;
    try {
      await deleteCustomMaster(id);
      toast.success("Custom master definition deleted successfully!");
      fetchCustomMasters();
    } catch (err) {
      toast.error("Failed to delete custom master definition.");
    }
  };

  // DataTable Columns definition for Tab 2
  const masterColumns = [
    { key: 'id', label: 'ID', minWidth: '80px', sortable: true },
    { key: 'master_name', label: 'Master Title', minWidth: '200px', sortable: true, render: row => <span className="font-bold text-blue-900">{row.master_name}</span> },
    { key: 'master_key', label: 'Key Identifier', minWidth: '180px', sortable: true, render: row => <span className="font-mono text-xs text-slate-700">{row.master_key}</span> },
    { key: 'table_name', label: 'MySQL Table', minWidth: '200px', sortable: true, render: row => <span className="font-mono text-xs text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{row.table_name}</span> },
    { key: 'description', label: 'Description', minWidth: '240px', sortable: true, render: row => <span className="text-xs text-slate-600 truncate max-w-xs">{row.description || 'N/A'}</span> },
    {
      key: 'status', label: 'Status', minWidth: '120px', sortable: true, render: row => (
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
          row.status === 'active'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : row.status === 'draft'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions', label: 'Actions', minWidth: '110px', sortable: false, render: row => (
        <button
          onClick={() => handleDeleteMaster(row.id)}
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
            <h1 className="text-xl font-bold text-slate-900">Master Creator Master</h1>
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
              🛠️ Master Creator Configuration
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'records'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 Created Custom Masters Directory
            </button>
          </div>
        </div>

        {/* TAB 1: MASTER CREATOR CONFIGURATION */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    🛠️
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Dynamic Master Generator Settings</h2>
                    <p className="text-xs text-slate-500">Configure global engine parameters for generating dynamic master tables and CRUD routes.</p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Default Database Storage Engine</label>
                  <select
                    value={config.default_database_engine}
                    onChange={e => setConfig({ ...config, default_database_engine: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="InnoDB">InnoDB (Transactions & Foreign Keys)</option>
                    <option value="MyISAM">MyISAM (High Performance Read)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">MySQL table engine used when creating new dynamic master tables.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Allowed Column Field Types</label>
                  <input
                    type="text"
                    value={config.allowed_field_types}
                    onChange={e => setConfig({ ...config, allowed_field_types: e.target.value })}
                    placeholder="VARCHAR,TEXT,INT,DECIMAL,ENUM,BOOLEAN,DATETIME"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-mono text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">Comma-separated database data types allowed for custom fields.</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allow_custom_master_creation === 'enabled'}
                    onChange={e => setConfig({ ...config, allow_custom_master_creation: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Custom Master Creation</p>
                    <p className="text-[11px] text-slate-500">Enable creation of new custom master entities.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.auto_generate_crud_routes === 'enabled'}
                    onChange={e => setConfig({ ...config, auto_generate_crud_routes: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Auto-Generate REST API</p>
                    <p className="text-[11px] text-slate-500">Automatically map CRUD endpoints for dynamic tables.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.auto_add_to_navbar === 'enabled'}
                    onChange={e => setConfig({ ...config, auto_add_to_navbar: e.target.checked ? 'enabled' : 'disabled' })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Auto-Mount in Navbar</p>
                    <p className="text-[11px] text-slate-500">Append newly generated masters to the navbar dropdown.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingConfig}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-900 text-white hover:bg-blue-800 shadow-md transition-all flex items-center gap-2"
              >
                {savingConfig ? <><span>⏳</span> Saving Configuration...</> : <><span>💾</span> Save Master Creator Configuration</>}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: CREATED CUSTOM MASTERS DIRECTORY (DataTable.jsx) */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <DataTable
              tableId="master_creator_registry"
              title="Created Custom Masters Registry"
              data={customMasters}
              columns={masterColumns}
              loading={mastersLoading}
              searchPlaceholder="Search custom masters by title, key, table..."
              actionButton={
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-800 shadow-md"
                >
                  <span>+</span> Create New Custom Master
                </button>
              }
            />
          </div>
        )}

        {/* Add Custom Master Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Create New Dynamic Master</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleCreateMaster} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Master Title *</label>
                    <input
                      type="text"
                      required
                      value={newMaster.master_name}
                      onChange={e => setNewMaster({ ...newMaster, master_name: e.target.value })}
                      placeholder="Vendor Master"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Key Identifier *</label>
                    <input
                      type="text"
                      required
                      value={newMaster.master_key}
                      onChange={e => setNewMaster({ ...newMaster, master_key: e.target.value })}
                      placeholder="vendor_master"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">MySQL Table Name *</label>
                    <input
                      type="text"
                      required
                      value={newMaster.table_name}
                      onChange={e => setNewMaster({ ...newMaster, table_name: e.target.value })}
                      placeholder="vendors_table"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Icon FontAwesome Class</label>
                    <input
                      type="text"
                      value={newMaster.icon_class}
                      onChange={e => setNewMaster({ ...newMaster, icon_class: e.target.value })}
                      placeholder="fa-solid fa-truck-field"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    value={newMaster.description}
                    onChange={e => setNewMaster({ ...newMaster, description: e.target.value })}
                    placeholder="Describe the purpose of this master module..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={newMaster.status}
                    onChange={e => setNewMaster({ ...newMaster, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-600 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
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
                    disabled={creatingMaster}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800"
                  >
                    {creatingMaster ? 'Creating...' : 'Create Dynamic Master'}
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
