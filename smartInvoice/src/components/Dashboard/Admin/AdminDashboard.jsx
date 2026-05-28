import React from 'react';
import {
  LayoutDashboard, FileSpreadsheet, Layers, History, TrendingDown, Percent, Users, Terminal,
  Settings, LogOut, Plus, Trash2, Printer, CheckCircle, Clock, ShieldAlert, AlertTriangle,
  UserCheck, Search, Eye, Info, DollarSign, Briefcase, UserPlus, Building2, CalendarCheck,
  Wallet, Clock3, Check, ChevronRight, Sparkles, Palette, ArrowRight, UserCheck2, FileText,
  X, Chrome, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import OverviewTab from '../features/OverviewTab';
import ClientsTab from '../features/ClientsTab';
import ProductsTab from '../features/ProductsTab';
import CreateInvoiceTab from '../features/CreateInvoiceTab';
import InvoicesLedgerTab from '../features/InvoicesLedgerTab';
import ExpensesTab from '../features/ExpensesTab';
import AdminSettingsTab from '../features/AdminSettingsTab';
import ClientRiskTab from '../features/ClientRiskTab';

import { useState } from 'react';

export default function AdminDashboard(props) {
  const {
    user, onLogout, adminEmail, setAdminEmail, currentRole, setCurrentRole, activeTab, setActiveTab,
    viewingInvoice, setViewingInvoice, invoiceTemplate, setInvoiceTemplate,
    invoices, setInvoices, expenses, setExpenses, clients, setClients, items, setItems, users, setUsers,
    auditLogs, setAuditLogs, invoiceForm, setInvoiceForm, expenseForm, setExpenseForm,
    clientForm, setClientForm, itemForm, setItemForm, selectedProduct, setSelectedProduct,
    addLog, fetchUsers, fetchData, totalInvoiced, paidInvoiced, outstandingInvoiced, totalGST,
    invoiceSearch, setInvoiceSearch, expenseSearch, setExpenseSearch, clientSearch, setClientSearch, itemSearch, setItemSearch,
    handleAddItemRow, handleRemoveItemRow, handleItemChange, handleSelectPredefinedItem, handleSelectPredefinedClient,
    calculateInvoiceTotal, handleCreateInvoice, handleUpdateStatus, handleDeleteInvoice, handleCreateExpense,
    handleCreateClient, handleDeleteClient, handleCreateItem, handleDeleteItem, toggleUserRole, handleAddUser,
    handlePrintSelectedInvoice, handleDeleteUser,
    filteredInvoices, filteredExpenses, filteredClients, filteredItems, isAuthorized, isAdminTab, shouldRenderAccessDenied
  } = props;




  const getSidebarItemClass = (tabId) => {
    const isActive = activeTab === tabId
    if (isActive) {
      return 'w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 shadow-sm shadow-indigo-500/5'
    }
    return 'w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800/40'
  }


  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* Dynamic Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 backdrop-blur-md">
        
        {/* Branding header */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-emerald-350" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Shnoor Invoice</h1>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          
          <div className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest px-3 mb-2">
            Operations
          </div>
          
          <button
            onClick={() => setActiveTab('overview')}
            className={getSidebarItemClass('overview')}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Dashboard Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={getSidebarItemClass('clients')}
          >
            <Building2 className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Client Directory</span>
          </button>


          {false && (
            <>
              <button
                onClick={() => setActiveTab('items')}
                className={getSidebarItemClass('items')}
              >
                <Layers className="w-4 h-4 shrink-0 text-slate-500" />
                <span>Products</span>
              </button>

              <button
                onClick={() => setActiveTab('generator')}
                className={getSidebarItemClass('generator')}
              >
                <Plus className="w-4 h-4 shrink-0 text-slate-500" />
                <span>Create Invoice</span>
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className={getSidebarItemClass('invoices')}
              >
                <History className="w-4 h-4 shrink-0 text-slate-500" />
                <span>Invoices Ledger</span>
              </button>

              <button
                onClick={() => setActiveTab('expenses')}
                className={getSidebarItemClass('expenses')}
              >
                <TrendingDown className="w-4 h-4 shrink-0" /> Expenses
              </button>

              <button
                onClick={() => setActiveTab('client_risk')}
                className={getSidebarItemClass('client_risk')}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-slate-500" />
                <span>Client Risk</span>
              </button>
            </>
          )}

          {isAuthorized && (
            <>
              <button
                onClick={() => setActiveTab('expenses')}
                className={getSidebarItemClass('expenses')}
              >
                <TrendingDown className="w-4 h-4 shrink-0 text-slate-500" />
                <span>Expense Ledger</span>
              </button>
            </>
          )}

          {/* DYNAMIC CLEARANCE VIEW: HIDES ADMIN ACCESS IN CRITICAL STANDARD ROLE STATE */}
          {isAuthorized && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-1">
              <div className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
                <span>Super Admin Gate</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <button
                onClick={() => setActiveTab('admin_settings')}
                className={getSidebarItemClass('admin_settings')}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Core Settings</span>
              </button>
            </div>
          )}

        </nav>

        {/* Profile Card & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <div 
            className="flex items-center gap-3 mb-3 p-2 rounded-xl transition-colors shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 dark:border-slate-850 shrink-0"
              alt="Avatar"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                true 
                  ? 'bg-indigo-100 text-indigo-750 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/20' 
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {true ? 'Super Admin' : 'Accountant'}
              </span>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/25 rounded-lg border border-red-200/30 dark:border-red-500/25 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        
        {/* Workspace Dynamic Premium Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/30 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize font-mono flex items-center gap-1.5">
              {activeTab === 'overview' && <LayoutDashboard className="w-3.5 h-3.5 text-indigo-650" />}
              {activeTab === 'clients' && <Building2 className="w-3.5 h-3.5 text-indigo-650" />}
              {activeTab === 'client_risk' && <ShieldAlert className="w-3.5 h-3.5 text-indigo-650" />}
              {activeTab === 'items' && <Layers className="w-3.5 h-3.5 text-indigo-650" />}
              {activeTab === 'generator' && <Plus className="w-3.5 h-3.5 text-indigo-650" />}
              {activeTab === 'invoices' && <History className="w-3.5 h-3.5 text-indigo-650" />}
              {activeTab === 'expenses' && (
                false ? <Sparkles className="w-3.5 h-3.5 text-indigo-650" /> : <TrendingDown className="w-3.5 h-3.5 text-indigo-650" />
              )}
              {activeTab === 'items' 
                ? 'Products' 
                : activeTab === 'generator'
                  ? 'Create Invoice'
                  : activeTab === 'client_risk'
                    ? 'Client Risk Management'
                    : activeTab === 'expenses' && false 
                      ? 'Expense Management' 
                      : activeTab === 'expenses' ? 'Expense Management' : activeTab.replace('admin_', 'Admin > ').replace('tax', 'GST & Tax Reports')}
            </span>
          </div>

          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* Viewport Content Panel */}
        <div className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* ACCESS DENIED INTERACTIVE ROUTE GATE */}
            {shouldRenderAccessDenied ? (
              <motion.div
                key="forbidden"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-2xl mx-auto py-8"
              >
                <div className="relative rounded-3xl overflow-hidden border border-red-500/20 bg-white dark:bg-slate-900/40 backdrop-blur-lg p-8 shadow-xl">
                  {/* Glowing warning effects */}
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="text-center relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/5">
                      <ShieldAlert className="w-8 h-8" />
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Clearance Blocked: Admin Role Required
                    </h2>
                    
                    <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                      Your current account is authenticated as <span className="font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>. 
                      You have loaded standard workspace limits. This area is strictly restricted to administrator clearance.
                    </p>

                    {/* Technical log block */}
                    <div className="mt-6 bg-slate-950 text-red-400 font-mono text-[11px] text-left p-4 rounded-xl border border-slate-900 space-y-1 shadow-inner">
                      <p className="text-slate-500">// Shnoor Core Security Protocol</p>
                      <p><span className="text-slate-500">TIMESTAMP:</span> {new Date().toISOString()}</p>
                      <p><span className="text-slate-500">REQUEST_URI:</span> /workspace/registry/admin_{activeTab.replace('admin_', '')}</p>
                      <p><span className="text-slate-500">AUTH_STATUS:</span> 403 Forbidden - Role Clearance Blocked</p>
                    </div>

                    {/* Go back */}
                    <div className="mt-8 flex justify-center gap-3">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className="rounded-xl border border-slate-350 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 px-5 py-2.5 text-xs font-bold transition text-slate-700 dark:text-slate-300"
                      >
                        Return to Hub
                      </button>
                    </div>

                  </div>
                </div>
              </motion.div>
            ) : (
              /* ACTIVE COMPONENT INJECTED ACCORDING TO TAB */
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* 1. DASHBOARD OVERVIEW HUB */}
                {activeTab === 'overview' && <OverviewTab {...props} />}

                {/* 2. CUSTOMER CLIENTS DIRECTORY */}
                {activeTab === 'clients' && <ClientsTab {...props} />}

                {/* 3. CLIENT RISK */}
                {activeTab === 'client_risk' && <ClientRiskTab {...props} />}

                {activeTab === 'items' && <ProductsTab {...props} />}

                {/* 4. STATEFUL INVOICE GENERATOR & REAL-TIME PDF PREVIEWER */}
                {activeTab === 'generator' && <CreateInvoiceTab {...props} />}

                {/* 5. INVOICES LEDGER / LIST */}
                {activeTab === 'invoices' && <InvoicesLedgerTab {...props} />}

                {/* 6. EXPENSES LEDGER */}
                {activeTab === 'expenses' && <ExpensesTab {...props} />}

                {/* 8. TAX & GST FILING CENTER (Super Admin Cleared) */}
                {activeTab === 'tax' && isAuthorized && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <Percent className="w-5 h-5 text-indigo-650" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">GST Output & Input Tax Credit Ledger</h3>
                      </div>
                      
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed mb-6">
                        GST returns are compiled dynamically from corporate invoices domestic trade logs (@18% default average supply rate rules under Indian CGST/SGST guidelines). Offset liabilities below.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Output GST Liability (Collected)</span>
                          <h4 className="text-xl font-bold font-mono mt-1 text-slate-900 dark:text-white">₹{Math.round(totalGST).toLocaleString('en-IN')}</h4>
                          <span className="text-[9px] text-slate-450">Payable on gross supplies registered</span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Input Tax Credit (ITC - Offset)</span>
                          <h4 className="text-xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">₹{
                            Math.round(expenses.reduce((acc, curr) => acc + (curr.amount * 0.18), 0)).toLocaleString('en-IN')
                          }</h4>
                          <span className="text-[9px] text-slate-450">Deductible tax on logged expenditures</span>
                        </div>

                        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 border border-indigo-200/40 dark:border-indigo-900/30 rounded-2xl text-left">
                          <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest">Net GST Cash Payable</span>
                          <h4 className="text-xl font-bold font-mono mt-1 text-indigo-750 dark:text-indigo-400">₹{
                            Math.max(0, Math.round(totalGST - expenses.reduce((acc, curr) => acc + (curr.amount * 0.18), 0))).toLocaleString('en-IN')
                          }</h4>
                          <span className="text-[9px] text-indigo-600 dark:text-indigo-300">Total liability after ITC deductions</span>
                        </div>

                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quarterly GST Worksheet Summary</h4>
                      
                      <div className="space-y-3.5 text-xs">
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-slate-655 dark:text-slate-350 font-semibold">GSTR-1 Summary (Gross outward sales)</span>
                          <span className="font-mono text-slate-900 dark:text-white font-bold">₹{totalInvoiced.toLocaleString('en-IN')} (₹{Math.round(totalGST).toLocaleString('en-IN')} GST)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-slate-655 dark:text-slate-350 font-semibold">GSTR-2B Summary (Auto-drafted Input Statement)</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-450 font-bold">₹{
                            Math.round(expenses.reduce((acc, curr) => acc + (curr.amount * 0.18), 0)).toLocaleString('en-IN')
                          } Claimable</span>
                        </div>
                        <div className="flex justify-between pt-1 font-bold text-sm">
                          <span className="text-slate-900 dark:text-white">Net Return Liability (GSTR-3B Cash Settlement)</span>
                          <span className="font-mono text-indigo-650 dark:text-indigo-400">₹{
                            Math.max(0, Math.round(totalGST - expenses.reduce((acc, curr) => acc + (curr.amount * 0.18), 0))).toLocaleString('en-IN')
                          }</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. ADMIN USER DIRECTORY Clearance */}
                {activeTab === 'admin_users' && isAuthorized && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-150 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-indigo-650" />
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">Core Organization Registry</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold">Database Mode:</span>
                            {dbSource === 'neon' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Neon Serverless DB
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                SQLite Fallback (db.json)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleAddUser}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition shadow"
                      >
                        <UserPlus className="w-4 h-4" /> Add Team Member
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-slate-450 border-b border-slate-200 dark:border-slate-850 pb-2">
                            <th className="py-3">Member ID</th>
                            <th className="py-3">Profile Info</th>
                            <th className="py-3">Role Clearance Authorization</th>
                            <th className="py-3">Status</th>
                            <th className="py-3 text-right font-semibold">Actions / Access Configs</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                              <td className="py-4 font-mono font-bold text-slate-450">#{u.id}</td>
                              <td className="py-4">
                                <div className="flex items-center gap-2.5">
                                  <img 
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`} 
                                    className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 dark:border-slate-700" 
                                    alt="User Avatar" 
                                  />
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                                    <p className="text-[10px] text-slate-455 font-mono">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  u.role === 'admin' 
                                    ? 'bg-indigo-100 text-indigo-750 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/20' 
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                  {u.role === 'admin' ? 'Super Admin' : 'Accountant'}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Active</span>
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {u.email.toLowerCase() !== user.email.toLowerCase() ? (
                                    <>
                                      <button
                                        onClick={() => toggleUserRole(u.id, u.role)}
                                        className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-750 dark:text-slate-250 transition"
                                      >
                                        Toggle Role
                                      </button>
                                      <button
                                        onClick={() => handleDeleteUser(u.id, u.name)}
                                        className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                        title="Delete user"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-450 italic px-2">Active Admin Session</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 10. ADMIN CORE WORKSPACE SETTINGS */}
                {activeTab === 'admin_settings' && isAuthorized && <AdminSettingsTab {...props} />}

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedProduct(null)}
          />

          {/* Modal box */}
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold text-indigo-650 dark:text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Product Catalog Item</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Product Specifications</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Name</label>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{selectedProduct.name}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Description</label>
                <p className="text-xs text-slate-600 dark:text-slate-355 mt-1 leading-relaxed whitespace-pre-wrap">
                  {selectedProduct.desc || selectedProduct.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Base Rate</label>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    ₹{selectedProduct.rate.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">GST Rate</label>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    {selectedProduct.tax}% GST
                  </p>
                </div>
              </div>

              {selectedProduct.liveLink && (
                <div className="pt-2">
                  <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Live Link</label>
                  <div className="mt-1.5">
                    <a
                      href={selectedProduct.liveLink.startsWith('http') ? selectedProduct.liveLink : `https://${selectedProduct.liveLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-650 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 dark:text-indigo-400 px-4 py-2.5 text-xs font-bold transition duration-200 border border-indigo-100/50 dark:border-indigo-900/35"
                    >
                      <Chrome className="w-4 h-4" />
                      <span>Visit Live Product Page</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3">
              <button
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete ${selectedProduct.name}?`)) {
                    await handleDeleteItem(selectedProduct.id, selectedProduct.name);
                    setSelectedProduct(null);
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 hover:border-red-300 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20 px-4 py-2 text-xs font-bold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Product</span>
              </button>

              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 px-4 py-2 text-xs font-bold transition"
              >
                Close Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. STATEFUL PREMIUM INVOICE CARD VIEWER OVERLAY MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-7 max-w-2xl w-full shadow-2xl relative overflow-hidden"
          >
            {/* Ambient background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Shnoor Invoice Manager</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5 font-sans">
                  <FileText className="w-4.5 h-4.5 text-indigo-650" />
                  <span>Invoice Card Details</span>
                </h3>
              </div>
              <button
                onClick={() => setViewingInvoice(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Invoice Details Section */}
            <div className="space-y-6">
              {/* Card Meta Row */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Billed To</label>
                  <p className="text-sm font-bold text-slate-850 dark:text-slate-200">{viewingInvoice.clientName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{viewingInvoice.clientEmail}</p>
                  {viewingInvoice.clientAddress && (
                    <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 italic">{viewingInvoice.clientAddress}</p>
                  )}
                </div>
                <div className="text-right">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Invoice Info</label>
                  <p className="text-sm font-mono font-bold text-indigo-650 dark:text-indigo-400">{viewingInvoice.id}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Issued: {viewingInvoice.date}</p>
                  {viewingInvoice.dueDate && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Due: {viewingInvoice.dueDate}</p>
                  )}
                </div>
              </div>

              {/* Status Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Payment Status</span>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  viewingInvoice.status === 'Paid'
                    ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 border border-emerald-500/10'
                    : viewingInvoice.status === 'Pending'
                    ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-500/10'
                    : 'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/10'
                }`}>
                  {viewingInvoice.status}
                </span>
              </div>

              {/* Line items table */}
              <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-450 border-b border-slate-150 dark:border-slate-850">
                      <th className="py-2.5 px-4 font-bold uppercase tracking-wider">Line Item</th>
                      <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-center w-12">Qty</th>
                      <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-right w-24">Rate</th>
                      <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-right w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {(viewingInvoice.items && viewingInvoice.items.length > 0 ? viewingInvoice.items : [{ desc: 'Workspace Service Supply Items', qty: 1, rate: viewingInvoice.amount }]).map((itm, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition">
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{itm.desc}</td>
                        <td className="py-3 px-2 text-center text-slate-600 dark:text-slate-400 font-mono">{itm.qty}</td>
                        <td className="py-3 px-2 text-right text-slate-650 dark:text-slate-350 font-mono">₹{(itm.rate || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white font-mono">₹{((itm.qty * itm.rate) || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment History & Logs / Totals Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                
                {/* Left Side: Payments & Logs */}
                <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wider">Payment History</h4>
                    {viewingInvoice.payments && viewingInvoice.payments.length > 0 ? (
                      <div className="space-y-2">
                        {viewingInvoice.payments.map((pay, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{pay.payment_method}</p>
                              <p className="text-[10px] text-slate-500">{pay.payment_date} {pay.transaction_id && `• ${pay.transaction_id}`}</p>
                            </div>
                            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              +₹{pay.amount.toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No payments recorded yet.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wider mt-4">Audit Logs</h4>
                    {viewingInvoice.logs && viewingInvoice.logs.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {viewingInvoice.logs.map((log, i) => (
                          <div key={i} className="flex gap-2 text-[10px] text-slate-500">
                            <span className="font-mono text-slate-400 shrink-0">{new Date(log.created_at).toLocaleDateString()}</span>
                            <span className="text-slate-700 dark:text-slate-300">{log.action}: {log.description}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No audit logs found.</p>
                    )}
                  </div>
                </div>

                {/* Right Side: Sticky Summary */}
                <div className="flex justify-end pt-3 lg:pt-0">
                  <div className="w-full max-w-[260px] space-y-2 border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl sticky top-4">
                    <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Invoice Summary</h4>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">₹{(viewingInvoice.amount / 1.18).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">GST (18% Included)</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">₹{(viewingInvoice.amount - (viewingInvoice.amount / 1.18)).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-slate-800 dark:text-slate-200 border-t border-dashed border-indigo-200 dark:border-indigo-800/50 pt-2.5 mt-2.5">
                      <span>Total Amount</span>
                      <span className="font-mono">₹{viewingInvoice.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 border-t border-dashed border-indigo-200 dark:border-indigo-800/50 pt-2.5 mt-2.5">
                      <span>Amount Paid</span>
                      <span className="font-mono">₹{(viewingInvoice.amount_paid || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-base font-black text-indigo-650 dark:text-indigo-400 border-t border-indigo-200 dark:border-indigo-800 pt-2.5 mt-2.5">
                      <span>Balance Due</span>
                      <span className="font-mono">₹{(viewingInvoice.amount - (viewingInvoice.amount_paid || 0)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-7 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrintSelectedInvoice(viewingInvoice)}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 px-5 py-2.5 text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => handleDownloadPDF(viewingInvoice)}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-indigo-500/10 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>

              <button
                onClick={() => setViewingInvoice(null)}
                className="rounded-xl bg-slate-150 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-250 px-5 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Close Card
              </button>
            </div>
          </motion.div>
        </div>
      )}


    </div>
  )
}
