import React from 'react';
import {
  LayoutDashboard, FileSpreadsheet, Layers, History, TrendingDown, Percent, Users, Terminal,
  Settings, LogOut, Plus, Trash2, Printer, CheckCircle, Clock, ShieldAlert, AlertTriangle,
  UserCheck, Search, Eye, Info, DollarSign, Briefcase, UserPlus, Building2, CalendarCheck,
  Wallet, Clock3, Check, ChevronRight, Sparkles, Palette, ArrowRight, UserCheck2, FileText,
  X, Chrome, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientsTab(props) {
  const { user, onLogout, adminEmail, setAdminEmail, currentRole, setCurrentRole, activeTab, setActiveTab, viewingInvoice, setViewingInvoice, invoiceTemplate, setInvoiceTemplate, invoices, setInvoices, expenses, setExpenses, clients, setClients, items, setItems, users, setUsers, auditLogs, setAuditLogs, invoiceForm, setInvoiceForm, expenseForm, setExpenseForm, clientForm, setClientForm, itemForm, setItemForm, selectedProduct, setSelectedProduct, addLog, fetchUsers, fetchData, totalInvoiced, paidInvoiced, outstandingInvoiced, totalGST, invoiceSearch, setInvoiceSearch, expenseSearch, setExpenseSearch, clientSearch, setClientSearch, itemSearch, setItemSearch, handleAddItemRow, handleRemoveItemRow, handleItemChange, handleSelectPredefinedItem, handleSelectPredefinedClient, calculateInvoiceTotal, handleCreateInvoice, handleUpdateStatus, handleDeleteInvoice, handleCreateExpense, handleCreateClient, handleDeleteClient, handleCreateItem, handleDeleteItem, toggleUserRole, handleAddUser, handlePrintSelectedInvoice, handleDeleteUser, filteredInvoices, filteredExpenses, filteredClients, filteredItems, isAuthorized, isAdminTab, shouldRenderAccessDenied } = props;

  return (
    <>
      <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Register Client Customer */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 h-fit">
                        <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <UserPlus className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Register Customer</h4>
                        </div>

                        <form onSubmit={handleCreateClient} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">Enterprise Name</label>
                            <input
                              type="text"
                              required
                              value={clientForm.name}
                              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                              placeholder="e.g. Google India Private Ltd"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">Billing Email</label>
                            <input
                              type="email"
                              required
                              value={clientForm.email}
                              onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                              placeholder="e.g. finance@google.com"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">Contact Phone</label>
                            <input
                              type="text"
                              value={clientForm.phone}
                              onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                              placeholder="e.g. +91 99999 88888"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">Billing Address</label>
                            <textarea
                              rows="2"
                              value={clientForm.address}
                              onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                              placeholder="e.g. Level 5, Signature Towers, Gurugram, India"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-sans resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">Client GSTIN / Tax ID</label>
                            <input
                              type="text"
                              value={clientForm.gst}
                              onChange={(e) => setClientForm({ ...clientForm, gst: e.target.value })}
                              placeholder="e.g. 07AAAAA1111A1Z5"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono uppercase"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 py-2.5 text-xs font-bold transition shadow-md shadow-indigo-500/10"
                          >
                            Add Customer Profile
                          </button>
                        </form>
                      </div>

                      {/* Customer Client Directory List */}
                      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Customer Database</h4>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                              <Search className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="text"
                              placeholder="Filter customer list..."
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:text-white w-48"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredClients.map((c) => (
                            <div key={c.id} className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 relative group hover:border-indigo-650 transition duration-300">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300 uppercase shrink-0">
                                  {c.name.slice(0, 2)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{c.name}</h5>
                                  <p className="text-[10px] text-slate-500 font-mono truncate">{c.email}</p>
                                  <p className="text-[10px] text-slate-450 mt-1">{c.phone}</p>
                                  <p className="text-[10px] text-slate-450 line-clamp-1 italic">{c.address}</p>
                                  <p className="text-[9px] text-indigo-650 dark:text-indigo-400 font-mono mt-2 uppercase font-bold">GSTIN: {c.gst}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteClient(c.id, c.name)}
                                className="absolute top-2 right-2 p-1.5 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/20 transition duration-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {filteredClients.length === 0 && (
                            <div className="col-span-2 text-center py-12 text-slate-400">
                              <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p className="text-xs">No customer profiles found</p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
    </>
  );
}
