import React from 'react';
import {
  LayoutDashboard, FileSpreadsheet, Layers, History, TrendingDown, Percent, Users, Terminal,
  Settings, LogOut, Plus, Trash2, Printer, CheckCircle, Clock, ShieldAlert, AlertTriangle,
  UserCheck, Search, Eye, Info, DollarSign, Briefcase, UserPlus, Building2, CalendarCheck,
  Wallet, Clock3, Check, ChevronRight, Sparkles, Palette, ArrowRight, UserCheck2, FileText,
  X, Chrome, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuditLogsTab(props) {
  const { user, onLogout, adminEmail, setAdminEmail, currentRole, setCurrentRole, activeTab, setActiveTab, viewingInvoice, setViewingInvoice, invoiceTemplate, setInvoiceTemplate, invoices, setInvoices, expenses, setExpenses, clients, setClients, items, setItems, users, setUsers, auditLogs, setAuditLogs, invoiceForm, setInvoiceForm, expenseForm, setExpenseForm, clientForm, setClientForm, itemForm, setItemForm, selectedProduct, setSelectedProduct, addLog, fetchUsers, fetchData, totalInvoiced, paidInvoiced, outstandingInvoiced, totalGST, invoiceSearch, setInvoiceSearch, expenseSearch, setExpenseSearch, clientSearch, setClientSearch, itemSearch, setItemSearch, handleAddItemRow, handleRemoveItemRow, handleItemChange, handleSelectPredefinedItem, handleSelectPredefinedClient, calculateInvoiceTotal, handleCreateInvoice, handleUpdateStatus, handleDeleteInvoice, handleCreateExpense, handleCreateClient, handleDeleteClient, handleCreateItem, handleDeleteItem, toggleUserRole, handleAddUser, handlePrintSelectedInvoice, handleDeleteUser, filteredInvoices, filteredExpenses, filteredClients, filteredItems, isAuthorized, isAdminTab, shouldRenderAccessDenied } = props;

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-red-500" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Security Audit Registry Console</h3>
                      </div>
                      
                      <button
                        onClick={() => {
                          setAuditLogs([{ time: new Date().toTimeString().split(' ')[0], event: 'Audit logs wiped', type: 'info' }])
                        }}
                        className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline"
                      >
                        Purge Registry History
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      Captured live requests and administrative workspace state modifications.
                    </p>

                    <div className="bg-slate-950 text-slate-200 font-mono text-xs rounded-2xl border border-slate-850 p-5 space-y-2 h-[350px] overflow-y-auto shadow-inner">
                      {auditLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-3 leading-relaxed">
                          <span className="text-slate-500 font-medium shrink-0">[{log.time}]</span>
                          <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[8px] tracking-wider shrink-0 ${
                            log.type === 'error'
                              ? 'bg-red-500/25 text-red-400 border border-red-500/10 animate-pulse'
                              : log.type === 'success'
                              ? 'bg-emerald-500/25 text-emerald-450'
                              : 'bg-blue-500/25 text-blue-400'
                          }`}>
                            {log.type}
                          </span>
                          <span className={log.type === 'error' ? 'text-red-300 font-semibold' : 'text-slate-350'}>
                            {log.event}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
    </>
  );
}
