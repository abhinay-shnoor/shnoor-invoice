import React from 'react';
import {
  LayoutDashboard, FileSpreadsheet, Layers, History, TrendingDown, Percent, Users, Terminal,
  Settings, LogOut, Plus, Trash2, Printer, CheckCircle, Clock, ShieldAlert, AlertTriangle,
  UserCheck, Search, Eye, Info, DollarSign, Briefcase, UserPlus, Building2, CalendarCheck,
  Wallet, Clock3, Check, ChevronRight, Sparkles, Palette, ArrowRight, UserCheck2, FileText,
  X, Chrome, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateInvoiceTab(props) {
  const { user, onLogout, adminEmail, setAdminEmail, currentRole, setCurrentRole, activeTab, setActiveTab, viewingInvoice, setViewingInvoice, invoiceTemplate, setInvoiceTemplate, invoices, setInvoices, expenses, setExpenses, clients, setClients, items, setItems, users, setUsers, auditLogs, setAuditLogs, invoiceForm, setInvoiceForm, expenseForm, setExpenseForm, clientForm, setClientForm, itemForm, setItemForm, selectedProduct, setSelectedProduct, addLog, fetchUsers, fetchData, totalInvoiced, paidInvoiced, outstandingInvoiced, totalGST, invoiceSearch, setInvoiceSearch, expenseSearch, setExpenseSearch, clientSearch, setClientSearch, itemSearch, setItemSearch, handleAddItemRow, handleRemoveItemRow, handleItemChange, handleSelectPredefinedItem, handleSelectPredefinedClient, calculateInvoiceTotal, handleCreateInvoice, handleUpdateStatus, handleDeleteInvoice, handleCreateExpense, handleCreateClient, handleDeleteClient, handleCreateItem, handleDeleteItem, toggleUserRole, handleAddUser, handlePrintSelectedInvoice, handleDeleteUser, filteredInvoices, filteredExpenses, filteredClients, filteredItems, isAuthorized, isAdminTab, shouldRenderAccessDenied, handlePreviewInvoice } = props;

  return (
    <>
      <div className="space-y-6">
        <div className="max-w-4xl mx-auto gap-6 items-start">
                      
          {/* Left: Input Formulate Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-650" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Formulate New Invoice</h3>
              </div>
              
              {/* Live Template Picker */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <select
                  value={invoiceTemplate}
                  onChange={(e) => setInvoiceTemplate(e.target.value)}
                  className="text-[10px] font-bold bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="sleek_indigo">Sleek Indigo Theme</option>
                  <option value="emerald_pro">Emerald Pro Theme</option>
                  <option value="minimalist">Minimalist Charcoal</option>
                  <option value="gold_luxury">Gold Luxury Theme</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-6">
              
              {/* Predefined Client Selection Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    Predefined Customer Selector
                  </label>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">* Auto-Fill</span>
                </div>
                <select
                  onChange={(e) => handleSelectPredefinedClient(e.target.value)}
                  defaultValue=""
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-bold"
                >
                  <option value="" disabled>--- Click to Auto-Fill Client Details ---</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Client fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Client Enterprise Name</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.clientName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                    placeholder="Tesla India Corp"
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 mb-1.5">Client Billing Email</label>
                  <input
                    type="email"
                    required
                    value={invoiceForm.clientEmail}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientEmail: e.target.value })}
                    placeholder="billing@tesla.in"
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Billing Address Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Client Billing Address</label>
                <input
                  type="text"
                  value={invoiceForm.clientAddress}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, clientAddress: e.target.value })}
                  placeholder="3500 Deer Creek Road, Palo Alto, CA"
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Date inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Line items dynamic ledger block */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] font-bold transition text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-3.5">
                  {invoiceForm.items.map((item, index) => (
                    <div key={index} className="p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/10 space-y-3">
                      
                      {/* Predefined Item dropdown selector */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400">Row {index + 1}:</span>
                        <select
                          onChange={(e) => handleSelectPredefinedItem(index, e.target.value)}
                          defaultValue=""
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[10px] focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-white font-semibold"
                        >
                          <option value="" disabled>--- Select Predefined Product Catalog to Auto-Fill ---</option>
                          {items.map(itm => (
                            <option key={itm.id} value={itm.id}>{itm.name} (₹{itm.rate.toLocaleString('en-IN')})</option>
                          ))}
                        </select>
                      </div>

                      {/* Direct input line fields */}
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-12 sm:col-span-5">
                          <input
                            type="text"
                            required
                            value={item.desc}
                            onChange={(e) => handleItemChange(index, 'desc', e.target.value)}
                            placeholder="Service or product description detail"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                            placeholder="Qty"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-center focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>
                        <div className="col-span-5 sm:col-span-3">
                          <input
                            type="number"
                            min="0"
                            required
                            value={item.rate || ''}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            placeholder="Rate (₹)"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono"
                          />
                        </div>
                        <div className="col-span-3 sm:col-span-2 text-right">
                          <button
                            type="button"
                            disabled={invoiceForm.items.length <= 1}
                            onClick={() => handleRemoveItemRow(index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handlePreviewInvoice}
                  className="rounded-xl border border-slate-350 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 px-5 py-2.5 text-xs font-bold transition text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold transition shadow-lg shadow-indigo-500/10"
                >
                  Create Invoice
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}
