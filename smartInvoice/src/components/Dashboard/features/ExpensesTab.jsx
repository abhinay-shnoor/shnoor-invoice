import React from 'react';
import {
  LayoutDashboard, FileSpreadsheet, Layers, History, TrendingDown, Percent, Users, Terminal,
  Settings, LogOut, Plus, Trash2, Printer, CheckCircle, Clock, ShieldAlert, AlertTriangle,
  UserCheck, Search, Eye, Info, DollarSign, Briefcase, UserPlus, Building2, CalendarCheck,
  Wallet, Clock3, Check, ChevronRight, Sparkles, Palette, ArrowRight, UserCheck2, FileText,
  X, Chrome, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpensesTab(props) {
  const { user, onLogout, adminEmail, setAdminEmail, currentRole, setCurrentRole, activeTab, setActiveTab, viewingInvoice, setViewingInvoice, invoiceTemplate, setInvoiceTemplate, invoices, setInvoices, expenses, setExpenses, clients, setClients, items, setItems, users, setUsers, auditLogs, setAuditLogs, invoiceForm, setInvoiceForm, expenseForm, setExpenseForm, clientForm, setClientForm, itemForm, setItemForm, selectedProduct, setSelectedProduct, addLog, fetchUsers, fetchData, totalInvoiced, paidInvoiced, outstandingInvoiced, totalGST, invoiceSearch, setInvoiceSearch, expenseSearch, setExpenseSearch, clientSearch, setClientSearch, itemSearch, setItemSearch, handleAddItemRow, handleRemoveItemRow, handleItemChange, handleSelectPredefinedItem, handleSelectPredefinedClient, calculateInvoiceTotal, handleCreateInvoice, handleUpdateStatus, handleDeleteInvoice, handleCreateExpense, handleCreateClient, handleDeleteClient, handleCreateItem, handleDeleteItem, toggleUserRole, handleAddUser, handlePrintSelectedInvoice, handleDeleteUser, filteredInvoices, filteredExpenses, filteredClients, filteredItems, isAuthorized, isAdminTab, shouldRenderAccessDenied } = props;

  return (
    <>
      <div className="space-y-6">
                    {/* If normal user, render AI Expense Insights header section */}
                    {!isAuthorized && (
                      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-emerald-50/50 p-5 dark:border-indigo-950/20 dark:from-indigo-950/10 dark:to-slate-900/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Financial Insights & Recommendation Engine</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block mb-1">AI Cost Burn Rate</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                              {expenses.length === 0 ? "No Active Costs" : `₹${expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}`}
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              Burn rate is well within acceptable limits. projected runway exceeds 12+ months.
                            </p>
                          </div>
                          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block mb-1">Primary Cost Vector</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                              {expenses.length === 0 ? "No Data" : (
                                Object.entries(expenses.reduce((acc, curr) => {
                                  acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                                  return acc;
                                }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"
                              )}
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              Highest outgoings stem from this category. Consider negotiating yearly terms to save up to 15%.
                            </p>
                          </div>
                          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block mb-1">AI Recommendation</span>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              Resource Allocation Stable
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              Automate SaaS renewals check. Consolidating overlapping cloud subscriptions can optimize budget.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left: Form to add */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 h-fit">
                      <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-slate-150 dark:border-slate-800">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Register Corporate Expense</h4>
                      </div>

                      <form onSubmit={handleCreateExpense} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 mb-1.5">Expense Title</label>
                          <input
                            type="text"
                            required
                            value={expenseForm.title}
                            onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                            placeholder="e.g. AWS Cloud Hosting Subscription"
                            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 mb-1.5">Category</label>
                          <select
                            value={expenseForm.category}
                            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          >
                            <option value="Software">Software & APIs</option>
                            <option value="Rent">Rent & Offices</option>
                            <option value="Meals">Meals & Events</option>
                            <option value="Travel">Corporate Travel</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 mb-1.5">Expense Date</label>
                          <input
                            type="date"
                            required
                            value={expenseForm.date}
                            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 mb-1.5">Amount (₹)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={expenseForm.amount}
                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                            placeholder="Price"
                            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 py-2.5 text-xs font-bold transition shadow-md shadow-indigo-500/10"
                        >
                          Log Expense Item
                        </button>
                      </form>
                    </div>

                    {/* Right: Table list */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Historical Outgoings Ledger</h4>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                            <Search className="w-3.5 h-3.5" />
                          </span>
                          <input
                            type="text"
                            placeholder="Search outgoings..."
                            value={expenseSearch}
                            onChange={(e) => setExpenseSearch(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:text-white w-48"
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="text-slate-450 border-b border-slate-200 dark:border-slate-850 pb-2">
                              <th className="py-2.5">Title</th>
                              <th className="py-2.5">Category</th>
                              <th className="py-2.5">Date</th>
                              <th className="py-2.5 text-right">Sum</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredExpenses.map((exp) => (
                              <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/15">
                                <td className="py-3 font-semibold text-slate-900 dark:text-white">{exp.title}</td>
                                <td className="py-3">
                                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-300 font-semibold">
                                    {exp.category}
                                  </span>
                                </td>
                                <td className="py-3 text-slate-500">{exp.date}</td>
                                <td className="py-3 font-bold font-mono text-red-600 dark:text-red-400 text-right">₹{exp.amount.toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                            {filteredExpenses.length === 0 && (
                              <tr>
                                <td colSpan="4" className="text-center py-12 text-slate-400">
                                  <TrendingDown className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                  <p className="text-xs">No expenses logged matching query</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
    </>
  );
}
