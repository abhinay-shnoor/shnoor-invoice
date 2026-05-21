import React from 'react';
import {
  LayoutDashboard, FileSpreadsheet, Layers, History, TrendingDown, Percent, Users, Terminal,
  Settings, LogOut, Plus, Trash2, Printer, CheckCircle, Clock, ShieldAlert, AlertTriangle,
  UserCheck, Search, Eye, Info, DollarSign, Briefcase, UserPlus, Building2, CalendarCheck,
  Wallet, Clock3, Check, ChevronRight, Sparkles, Palette, ArrowRight, UserCheck2, FileText,
  X, Chrome, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsTab(props) {
  const { user, onLogout, adminEmail, setAdminEmail, currentRole, setCurrentRole, activeTab, setActiveTab, viewingInvoice, setViewingInvoice, invoiceTemplate, setInvoiceTemplate, invoices, setInvoices, expenses, setExpenses, clients, setClients, items, setItems, users, setUsers, auditLogs, setAuditLogs, invoiceForm, setInvoiceForm, expenseForm, setExpenseForm, clientForm, setClientForm, itemForm, setItemForm, selectedProduct, setSelectedProduct, addLog, fetchUsers, fetchData, totalInvoiced, paidInvoiced, outstandingInvoiced, totalGST, invoiceSearch, setInvoiceSearch, expenseSearch, setExpenseSearch, clientSearch, setClientSearch, itemSearch, setItemSearch, handleAddItemRow, handleRemoveItemRow, handleItemChange, handleSelectPredefinedItem, handleSelectPredefinedClient, calculateInvoiceTotal, handleCreateInvoice, handleUpdateStatus, handleDeleteInvoice, handleCreateExpense, handleCreateClient, handleDeleteClient, handleCreateItem, handleDeleteItem, toggleUserRole, handleAddUser, handlePrintSelectedInvoice, handleDeleteUser, filteredInvoices, filteredExpenses, filteredClients, filteredItems, isAuthorized, isAdminTab, shouldRenderAccessDenied } = props;

  return (
    <>
      <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Register Item */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 h-fit">
                        <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <Plus className="w-4 h-4 text-emerald-500" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Register Product</h4>
                        </div>

                        <form onSubmit={handleCreateItem} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-355 mb-1.5">Product Name</label>
                            <input
                              type="text"
                              required
                              value={itemForm.name}
                              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                              placeholder="e.g. AWS Cloud Consultancy"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-355 mb-1.5">Description</label>
                            <textarea
                              rows="2"
                              value={itemForm.desc}
                              onChange={(e) => setItemForm({ ...itemForm, desc: e.target.value })}
                              placeholder="e.g. Corporate deployment hours including IAM & VPC configurations"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-sans resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-355 mb-1.5">Live Link (Optional)</label>
                            <input
                              type="url"
                              value={itemForm.liveLink}
                              onChange={(e) => setItemForm({ ...itemForm, liveLink: e.target.value })}
                              placeholder="e.g. https://myproduct.com"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-650 dark:text-slate-355 mb-1.5">Base Rate (₹)</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={itemForm.rate}
                                onChange={(e) => setItemForm({ ...itemForm, rate: e.target.value })}
                                placeholder="Price"
                                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-650 dark:text-slate-355 mb-1.5">GST Rate (%)</label>
                              <select
                                value={itemForm.tax}
                                onChange={(e) => setItemForm({ ...itemForm, tax: parseFloat(e.target.value) })}
                                className="w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                              >
                                <option value="18">18% GST (Standard)</option>
                                <option value="12">12% GST</option>
                                <option value="5">5% GST (Reduced)</option>
                                <option value="28">28% GST (Luxury)</option>
                                <option value="0">0% Exempt</option>
                              </select>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 py-2.5 text-xs font-bold transition shadow-md shadow-indigo-500/10"
                          >
                            Add Catalog Product
                          </button>
                        </form>
                      </div>

                      {/* Items catalog inventory list */}
                      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Products Catalog</h4>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                              <Search className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="text"
                              placeholder="Filter catalog products..."
                              value={itemSearch}
                              onChange={(e) => setItemSearch(e.target.value)}
                              className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:text-white w-48"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredItems.map((itm) => (
                            <div
                              key={itm.id}
                              onClick={() => setSelectedProduct(itm)}
                              className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 relative group hover:border-indigo-650 cursor-pointer hover:shadow-md transition duration-300"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 uppercase shrink-0">
                                  <Layers className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{itm.name}</h5>
                                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{itm.desc}</p>
                                  <div className="flex items-center gap-3 mt-3">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">₹{itm.rate.toLocaleString('en-IN')}</span>
                                    <span className="text-[9px] bg-indigo-550/10 text-indigo-600 dark:text-indigo-400 font-mono px-2 py-0.5 rounded font-bold uppercase">
                                      {itm.tax}% GST
                                    </span>
                                    {itm.liveLink && (
                                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 font-bold px-2 py-0.5 rounded uppercase">
                                        Live Page
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(itm.id, itm.name);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/20 transition duration-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {filteredItems.length === 0 && (
                            <div className="col-span-2 text-center py-12 text-slate-400">
                              <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p className="text-xs">No catalog items found</p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
    </>
  );
}
