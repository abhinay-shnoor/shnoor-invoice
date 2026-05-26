import React, { useState } from 'react';
import {
  TrendingDown, Search, Plus, Trash2, Edit, CreditCard, DollarSign,
  Calendar, FileText, CheckCircle, Clock, Check, X, Tag, User, Building2,
  Wallet, Filter, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { createPortal } from 'react-dom';

export default function ExpensesTab(props) {
  const {
    expenses,
    expenseForm, setExpenseForm,
    expenseSearch, setExpenseSearch,
    handleCreateExpense,
    handleDeleteExpense,
    handleEditExpense,
    handleCancelEditExpense,
    isEditingExpense,
    filteredExpenses,
    isAuthorized
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMonthStr, setSelectedMonthStr] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);

  // Derived stats
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const selectedYear = parseInt(selectedMonthStr.split('-')[0]);
  const selectedMonth = parseInt(selectedMonthStr.split('-')[1]) - 1;
  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === selectedMonth && expDate.getFullYear() === selectedYear;
  }).reduce((acc, curr) => acc + curr.amount, 0);

  const pendingExpenses = expenses
    .filter(exp => exp.status === 'Pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const localFilteredExpenses = filteredExpenses.filter(exp => {
    if (statusFilter === 'All') return true;
    return exp.status === statusFilter;
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    handleCancelEditExpense();
    setIsModalOpen(false);
  };

  const handleEditClick = (id) => {
    handleEditExpense(id);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    await handleCreateExpense(e);
    setIsModalOpen(false);
  };

  const categories = [
    'Employee Salary', 'Maintenance', 'Utilities', 'Travel', 
    'Office Supplies', 'Software & APIs', 'Meals & Events', 
    'Rent & Offices', 'Others'
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Paid':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Paid</span>;
      case 'Reimbursed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 flex items-center gap-1 w-fit"><CreditCard className="w-3 h-3" /> Reimbursed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Corporate Expenses
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage, track and analyze your organizational spending.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-md shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Log New Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">₹{totalExpenses.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Wallet className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Expenses</p>
                <input 
                  type="month" 
                  value={selectedMonthStr}
                  onChange={(e) => setSelectedMonthStr(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">₹{monthlyExpenses.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pending Clearance</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">₹{pendingExpenses.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Expense Ledger</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Filter className="w-3.5 h-3.5" />
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 pl-8 pr-8 py-1.5 text-xs focus:outline-none focus:border-indigo-500 dark:border-slate-800 dark:text-white font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Reimbursed">Reimbursed</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search ledger..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 dark:border-slate-800 dark:text-white w-full sm:w-48"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Title & Vendor</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Amount</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {localFilteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors group">
                  <td className="py-3 px-5">
                    <p className="font-semibold text-slate-900 dark:text-white">{exp.title}</p>
                    {exp.vendor && <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"><Building2 className="w-3 h-3" /> {exp.vendor}</p>}
                  </td>
                  <td className="py-3 px-5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-600 dark:text-slate-400 font-medium">
                    {new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-5">
                    {getStatusBadge(exp.status)}
                  </td>
                  <td className="py-3 px-5 font-bold font-mono text-slate-900 dark:text-white text-right">
                    ₹{exp.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title="Edit Expense"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {localFilteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <TrendingDown className="w-10 h-10 mx-auto mb-3 text-slate-200 dark:text-slate-700" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No expenses found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Adjust your filters or add a new expense record.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {isEditingExpense ? <Edit className="w-5 h-5 text-indigo-500" /> : <Plus className="w-5 h-5 text-indigo-500" />}
                    {isEditingExpense ? 'Edit Expense Record' : 'Log New Expense'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <form id="expense-form" onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Basic Info */}
                      <div className="space-y-4 md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Basic Details</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Expense Title <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FileText className="w-4 h-4" /></span>
                              <input
                                type="text"
                                required
                                value={expenseForm.title}
                                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                                placeholder="e.g. AWS Cloud Hosting"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pl-10 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><DollarSign className="w-4 h-4" /></span>
                              <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={expenseForm.amount}
                                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                placeholder="0.00"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pl-10 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Categorization & Status */}
                      <div className="space-y-4 md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mt-2">Classification</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Tag className="w-4 h-4" /></span>
                              <select
                                value={expenseForm.category}
                                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pl-10 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all"
                              >
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                            <select
                              value={expenseForm.status}
                              onChange={(e) => setExpenseForm({ ...expenseForm, status: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all font-medium"
                            >
                              <option value="Paid">Paid</option>
                              <option value="Pending">Pending</option>
                              <option value="Reimbursed">Reimbursed</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date <span className="text-red-500">*</span></label>
                            <input
                              type="date"
                              required
                              value={expenseForm.date}
                              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Payee Details */}
                      <div className="space-y-4 md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mt-2">Vendor & Payment</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Vendor / Paid To</label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Building2 className="w-4 h-4" /></span>
                              <input
                                type="text"
                                value={expenseForm.vendor}
                                onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                                placeholder="e.g. Amazon Web Services"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pl-10 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Payment Method</label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><CreditCard className="w-4 h-4" /></span>
                              <input
                                type="text"
                                value={expenseForm.paymentMethod}
                                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                                placeholder="e.g. Corporate Credit Card"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pl-10 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 mt-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Additional Notes</label>
                        <textarea
                          value={expenseForm.notes}
                          onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                          placeholder="Add any relevant details or references here..."
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all resize-none"
                        />
                      </div>
                    </div>
                  </form>
                </div>
                
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="expense-form"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
                  >
                    {isEditingExpense ? 'Update Expense' : 'Save Expense'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
