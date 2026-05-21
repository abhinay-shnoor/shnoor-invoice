import React from 'react';
import {
  LayoutDashboard, FileSpreadsheet, Layers, History, TrendingDown, Percent, Users, Terminal,
  Settings, LogOut, Plus, Trash2, Printer, CheckCircle, Clock, ShieldAlert, AlertTriangle,
  UserCheck, Search, Eye, Info, DollarSign, Briefcase, UserPlus, Building2, CalendarCheck,
  Wallet, Clock3, Check, ChevronRight, Sparkles, Palette, ArrowRight, UserCheck2, FileText,
  X, Chrome, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSettingsTab(props) {
  const { user, onLogout, adminEmail, setAdminEmail, currentRole, setCurrentRole, activeTab, setActiveTab, viewingInvoice, setViewingInvoice, invoiceTemplate, setInvoiceTemplate, invoices, setInvoices, expenses, setExpenses, clients, setClients, items, setItems, users, setUsers, auditLogs, setAuditLogs, invoiceForm, setInvoiceForm, expenseForm, setExpenseForm, clientForm, setClientForm, itemForm, setItemForm, selectedProduct, setSelectedProduct, addLog, fetchUsers, fetchData, totalInvoiced, paidInvoiced, outstandingInvoiced, totalGST, invoiceSearch, setInvoiceSearch, expenseSearch, setExpenseSearch, clientSearch, setClientSearch, itemSearch, setItemSearch, handleAddItemRow, handleRemoveItemRow, handleItemChange, handleSelectPredefinedItem, handleSelectPredefinedClient, calculateInvoiceTotal, handleCreateInvoice, handleUpdateStatus, handleDeleteInvoice, handleCreateExpense, handleCreateClient, handleDeleteClient, handleCreateItem, handleDeleteItem, toggleUserRole, handleAddUser, handlePrintSelectedInvoice, handleDeleteUser, filteredInvoices, filteredExpenses, filteredClients, filteredItems, isAuthorized, isAdminTab, shouldRenderAccessDenied } = props;

  return (
    <>
      <div className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                      <Settings className="w-5 h-5 text-indigo-650" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Workspace Configuration Registry</h3>
                    </div>

                    <div className="space-y-6">
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-655 dark:text-slate-300 uppercase tracking-wider">
                          Authorized Designated Super Admin Email
                        </label>
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => {
                            setAdminEmail(e.target.value)
                          }}
                          placeholder="admin@yourcorp.com"
                          className="w-full text-xs font-mono rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-normal">
                          * Note: Shifting this config will require matching Google/Manual credentials on future workspace initializations.
                        </p>
                      </div>

                      {/* Mock corporate settings */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-650 dark:text-slate-350 uppercase tracking-widest">Global Currency Defaults</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Domestic GST Tax Rate (%)</label>
                            <input
                              type="number"
                              disabled
                              value="18"
                              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-100 dark:bg-slate-950 px-4 py-2 text-slate-500 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Corporate Currency</label>
                            <input
                              type="text"
                              disabled
                              value="INR (₹)"
                              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-100 dark:bg-slate-950 px-4 py-2 text-slate-500 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            addLog(`Workspace configuration updates applied`, 'success')
                            alert("Corporate configurations applied to Shnoor Workspace database core.")
                          }}
                          className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-650 dark:hover:bg-indigo-550 px-5 py-2.5 text-xs font-bold text-white transition shadow"
                        >
                          Apply System Configurations
                        </button>
                      </div>

                    </div>
                  </div>
    </>
  );
}
