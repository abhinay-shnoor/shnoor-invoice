import React from 'react';
import {
  LayoutDashboard, FileSpreadsheet, Layers, History, TrendingDown, Percent, Users, Terminal,
  Settings, LogOut, Plus, Trash2, Printer, CheckCircle, Clock, ShieldAlert, AlertTriangle,
  UserCheck, Search, Eye, Info, DollarSign, Briefcase, UserPlus, Building2, CalendarCheck,
  Wallet, Clock3, Check, ChevronRight, Sparkles, Palette, ArrowRight, UserCheck2, FileText,
  X, Chrome, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OverviewTab(props) {
  const { user, onLogout, adminEmail, setAdminEmail, currentRole, setCurrentRole, activeTab, setActiveTab, viewingInvoice, setViewingInvoice, invoiceTemplate, setInvoiceTemplate, invoices, setInvoices, expenses, setExpenses, clients, setClients, items, setItems, users, setUsers, auditLogs, setAuditLogs, invoiceForm, setInvoiceForm, expenseForm, setExpenseForm, clientForm, setClientForm, itemForm, setItemForm, selectedProduct, setSelectedProduct, addLog, fetchUsers, fetchData, totalInvoiced, paidInvoiced, outstandingInvoiced, totalGST, invoiceSearch, setInvoiceSearch, expenseSearch, setExpenseSearch, clientSearch, setClientSearch, itemSearch, setItemSearch, handleAddItemRow, handleRemoveItemRow, handleItemChange, handleSelectPredefinedItem, handleSelectPredefinedClient, calculateInvoiceTotal, handleCreateInvoice, handleUpdateStatus, handleDeleteInvoice, handleCreateExpense, handleCreateClient, handleDeleteClient, handleCreateItem, handleDeleteItem, toggleUserRole, handleAddUser, handlePrintSelectedInvoice, handleDeleteUser, filteredInvoices, filteredExpenses, filteredClients, filteredItems, isAuthorized, isAdminTab, shouldRenderAccessDenied } = props;

  return (
    <>
      <div className="space-y-6">
                    {/* Welcome banner */}
                    <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/70 to-indigo-50/80 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-indigo-950/20 rounded-3xl p-6 border border-indigo-100/55 dark:border-indigo-900/30 shadow-sm text-slate-800 dark:text-slate-100 relative overflow-hidden">
                      <div className="absolute right-0 top-0 -mr-24 -mt-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2 py-0.5 rounded bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-200/20">Active Workspace</span>
                            {currentRole === 'admin' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450 text-[10px] font-bold uppercase tracking-wider border border-emerald-250/20">Super Admin Console</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Standard Access Ledger</span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Good day, {user.name}!</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 max-w-xl">
                            {currentRole === 'admin' 
                              ? 'Manage enterprise tax compliance, view organizational cash flow indexes, audit logs, and log invoicing systems.'
                              : 'Log invoices, register corporate expenses, manage customers, catalog items, and track timesheet billable hours.'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Stats Metrics Cards grid based on Role */}
                    {currentRole === 'admin' ? (
                      /* Admin Financial Statistics View */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Total Invoiced</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-slate-900 dark:text-white">₹{totalInvoiced.toLocaleString('en-IN')}</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Historical billing records</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Wallet className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Collected Capital</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-emerald-600 dark:text-emerald-400">₹{paidInvoiced.toLocaleString('en-IN')}</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Settled ledger accounts</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Clock3 className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Outstanding Balances</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-amber-500">₹{outstandingInvoiced.toLocaleString('en-IN')}</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Pending customer payout</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                            <Percent className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Output GST Liability</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-indigo-650 dark:text-indigo-400 font-mono">₹{Math.round(totalGST).toLocaleString('en-IN')}</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <Info className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Aggregated supply rates</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Standard User Personal Statistics View */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-650">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Active Invoices</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-slate-900 dark:text-white">{invoices.length} Registered</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Ready to dispatch to clients</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-650">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Managed Customers</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-slate-900 dark:text-white">{clients.length} Clients</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>Saved in contact directory</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-650">
                            <TrendingDown className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">My Logged Expenses</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-red-500">₹{expenses.reduce((a,c) => a + c.amount, 0).toLocaleString('en-IN')}</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <Info className="w-3.5 h-3.5 text-red-400" />
                            <span>Outgoings registered</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick activity and breakdown grids */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Column: Recent Invoices Ledger */}
                      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                            <span>Recent Active Invoices</span>
                          </h4>
                          <button
                            onClick={() => setActiveTab('invoices')}
                            className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Ledger</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="text-slate-450 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <th className="py-2.5">Invoice ID</th>
                                <th className="py-2.5">Recipient Enterprise</th>
                                <th className="py-2.5">Issued</th>
                                <th className="py-2.5">Total (inc. GST)</th>
                                <th className="py-2.5 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {invoices.slice(0, 4).map((invoice) => (
                                <tr 
                                  key={invoice.id} 
                                  onClick={() => setViewingInvoice(invoice)}
                                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition cursor-pointer"
                                >
                                  <td className="py-3 font-mono font-bold text-indigo-650 dark:text-indigo-400">{invoice.id}</td>
                                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{invoice.clientName}</td>
                                  <td className="py-3 text-slate-550 dark:text-slate-450">{invoice.date}</td>
                                  <td className="py-3 font-bold font-mono text-slate-900 dark:text-white">₹{invoice.amount.toLocaleString('en-IN')}</td>
                                  <td className="py-3 text-right">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                      invoice.status === 'Paid'
                                        ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 border border-emerald-500/10'
                                        : invoice.status === 'Pending'
                                        ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-500/10'
                                        : 'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/10'
                                    }`}>
                                      {invoice.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right Column: Expense Distributions */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span>Corporate Expenses</span>
                          </h4>
                          <button
                            onClick={() => setActiveTab('expenses')}
                            className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Trackers</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Chart calculations */}
                        <div className="space-y-4 pt-1">
                          {['Software', 'Rent', 'Meals', 'Travel'].map((cat) => {
                            const catAmt = expenses.filter(e => e.category === cat).reduce((acc, curr) => acc + curr.amount, 0)
                            const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0)
                            const pct = totalExp ? Math.round((catAmt / totalExp) * 100) : 0
                            
                            return (
                              <div key={cat} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-slate-600 dark:text-slate-350">{cat}</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">₹{catAmt.toLocaleString('en-IN')} ({pct}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      cat === 'Software' ? 'bg-indigo-500' : 
                                      cat === 'Rent' ? 'bg-emerald-500' : 
                                      cat === 'Meals' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Catalog and Customer quick insights */}
                    <div className={`grid grid-cols-1 ${!isAuthorized ? 'md:grid-cols-2' : ''} gap-6`}>
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-slate-850 text-indigo-650 flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Quick Client Directory</h4>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{clients.length} Customers Enrolled</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('clients')}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-650 dark:text-indigo-400 transition"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {!isAuthorized && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 flex items-center justify-between">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-slate-850 text-emerald-600 flex items-center justify-center">
                              <Layers className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Products Catalog</h4>
                              <p className="text-sm font-bold text-slate-800 dark:text-white">{items.length} Predefined Products</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('items')}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-650 dark:text-indigo-400 transition"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
    </>
  );
}
