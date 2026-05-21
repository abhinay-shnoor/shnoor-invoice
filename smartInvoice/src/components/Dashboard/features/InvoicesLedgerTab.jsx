import React from 'react';
import {
  LayoutDashboard, FileSpreadsheet, Layers, History, TrendingDown, Percent, Users, Terminal,
  Settings, LogOut, Plus, Trash2, Printer, CheckCircle, Clock, ShieldAlert, AlertTriangle,
  UserCheck, Search, Eye, Info, DollarSign, Briefcase, UserPlus, Building2, CalendarCheck,
  Wallet, Clock3, Check, ChevronRight, Sparkles, Palette, ArrowRight, UserCheck2, FileText,
  X, Chrome, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InvoicesLedgerTab(props) {
  const { user, onLogout, adminEmail, setAdminEmail, currentRole, setCurrentRole, activeTab, setActiveTab, viewingInvoice, setViewingInvoice, invoiceTemplate, setInvoiceTemplate, invoices, setInvoices, expenses, setExpenses, clients, setClients, items, setItems, users, setUsers, auditLogs, setAuditLogs, invoiceForm, setInvoiceForm, expenseForm, setExpenseForm, clientForm, setClientForm, itemForm, setItemForm, selectedProduct, setSelectedProduct, addLog, fetchUsers, fetchData, totalInvoiced, paidInvoiced, outstandingInvoiced, totalGST, invoiceSearch, setInvoiceSearch, expenseSearch, setExpenseSearch, clientSearch, setClientSearch, itemSearch, setItemSearch, handleAddItemRow, handleRemoveItemRow, handleItemChange, handleSelectPredefinedItem, handleSelectPredefinedClient, calculateInvoiceTotal, handleCreateInvoice, handleUpdateStatus, handleDeleteInvoice, handleCreateExpense, handleCreateClient, handleDeleteClient, handleCreateItem, handleDeleteItem, toggleUserRole, handleAddUser, handlePrintSelectedInvoice, handleDownloadPDF, handlePreviewInvoice, handleDeleteUser, filteredInvoices, filteredExpenses, filteredClients, filteredItems, isAuthorized, isAdminTab, shouldRenderAccessDenied } = props;

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-650" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Workspace Invoices Ledger</h3>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                            <Search className="w-3.5 h-3.5" />
                          </span>
                          <input
                            type="text"
                            placeholder="Search recipient..."
                            value={invoiceSearch}
                            onChange={(e) => setInvoiceSearch(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white w-48"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-slate-450 dark:text-slate-400 border-b border-slate-200 dark:border-slate-850 pb-2">
                            <th className="py-3">Invoice ID</th>
                            <th className="py-3">Recipient</th>
                            <th className="py-3">Created</th>
                            <th className="py-3">Item Count</th>
                            <th className="py-3">Amount Due</th>
                            <th className="py-3">Status</th>
                            <th className="py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                              <td className="py-3.5 font-mono font-bold text-indigo-650 dark:text-indigo-400">{inv.id}</td>
                              <td className="py-3.5">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{inv.clientName}</p>
                                  <p className="text-[10px] text-slate-450 font-mono">{inv.clientEmail}</p>
                                </div>
                              </td>
                              <td className="py-3.5 text-slate-550 dark:text-slate-450">{inv.date}</td>
                              <td className="py-3.5 font-semibold text-slate-650 dark:text-slate-350">{inv.items.length} lines</td>
                              <td className="py-3.5 font-bold font-mono text-slate-900 dark:text-white">₹{inv.amount.toLocaleString('en-IN')}</td>
                              <td className="py-3.5">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                  inv.status === 'Paid'
                                    ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 border border-emerald-500/10'
                                    : inv.status === 'Pending'
                                    ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-500/10'
                                    : 'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/10'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-right space-x-1">
                                {inv.status !== 'Paid' && (
                                  <button
                                    onClick={() => handleUpdateStatus(inv.id, 'Paid')}
                                    className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 transition inline-block align-middle"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setViewingInvoice(inv)
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[9px] font-bold text-slate-700 dark:text-slate-300 transition inline-block align-middle"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownloadPDF(inv)}
                                  className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 text-[9px] font-bold text-indigo-650 dark:text-indigo-400 transition inline-block align-middle"
                                >
                                  Download
                                </button>
                                <button
                                  onClick={() => handleDeleteInvoice(inv.id)}
                                  className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition inline-block align-middle"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {filteredInvoices.length === 0 && (
                            <tr>
                              <td colSpan="7" className="text-center py-12 text-slate-400">
                                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-xs">No invoices found matching search query</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
    </>
  );
}
