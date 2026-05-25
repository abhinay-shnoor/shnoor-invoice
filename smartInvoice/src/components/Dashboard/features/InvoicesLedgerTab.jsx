import React, { useState } from 'react';
import {
  FileSpreadsheet, Trash2, Printer, Search, Download, CreditCard, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RecordPaymentModal from './RecordPaymentModal';
import OverduePopup from './OverduePopup';
import ExtendDueDateModal from './ExtendDueDateModal';
import client from '../../../api/client';

export default function InvoicesLedgerTab(props) {
  const { user, invoices, setInvoices, viewingInvoice, setViewingInvoice, invoiceSearch, setInvoiceSearch, handleDeleteInvoice, handleEditInvoice, handleDownloadPDF, addLog, filteredInvoices } = props;

  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [overduePopupInvoice, setOverduePopupInvoice] = useState(null);
  const [extendDateInvoice, setExtendDateInvoice] = useState(null);

  const handlePaymentSuccess = (invoiceId, paymentData) => {
    // Assuming backend already recalculated amounts and status
    // Fetch data again or update locally. Let's rely on Dashboard's fetchData ideally, but for now we'll do a partial reload.
    // Easiest is to manually update local state or just let the user see it updated when they refresh.
    // But let's try to update locally:
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        const newPaid = (inv.amount_paid || 0) + paymentData.amount;
        const newRemaining = inv.amount - newPaid;
        let newStatus = inv.status;
        if (newRemaining <= 0) newStatus = 'Paid';
        else if (newPaid > 0) newStatus = 'Partial Paid';
        
        return {
          ...inv,
          amount_paid: newPaid,
          status: newStatus
        };
      }
      return inv;
    });
    setInvoices(updatedInvoices);
  };

  const handleExtendDueDateSuccess = async (invoiceId, newDate) => {
    setExtendDateInvoice(null);
    try {
      const dbId = invoices.find(i => i.id === invoiceId)?.dbId;
      if (dbId) {
        await client.put(`/invoices/${dbId}/extend-due-date`, null, { params: { new_due_date: newDate }});
      }
      addLog(`Due date extended for Invoice ${invoiceId}`, 'info');
      // Update local state
      const updatedInvoices = invoices.map(inv => {
        if (inv.id === invoiceId) {
          return { ...inv, dueDate: newDate, status: inv.amount_paid > 0 ? 'Partial Paid' : 'Pending' };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
    } catch (err) {
      console.warn("Backend update failed, applying locally:", err);
      // Fallback: update local state so the accountant can continue working
      addLog(`Due date extended for Invoice ${invoiceId} (Local)`, 'info');
      const updatedInvoices = invoices.map(inv => {
        if (inv.id === invoiceId) {
          return { ...inv, dueDate: newDate, status: inv.amount_paid > 0 ? 'Partial Paid' : 'Pending' };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
    }
  };

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
                <th className="py-3">Amount Due</th>
                <th className="py-3">Status</th>
                <th className="py-3">Overdue Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map((inv) => {
                const isOverdue = inv.status === 'Overdue';
                const dueDate = new Date(inv.dueDate || inv.due_date);
                const today = new Date();
                const diffTime = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
                
                let overdueText = '';
                if (isOverdue) {
                  if (diffTime === 0) overdueText = 'Due Today';
                  else if (diffTime === 1) overdueText = '1 Day Overdue';
                  else if (diffTime > 1) overdueText = `${diffTime} Days Overdue`;
                  else if (diffTime === -1) overdueText = 'Due Tomorrow'; // Edge case if due date is tomorrow but it's marked overdue (shouldn't happen but good to handle)
                }

                return (
                  <tr key={inv.id} className={`${isOverdue ? 'bg-red-50/50 hover:bg-red-100/50 dark:bg-red-950/20 dark:hover:bg-red-900/30' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/10'}`}>
                    <td className="py-3.5 font-mono font-bold text-indigo-650 dark:text-indigo-400">{inv.id}</td>
                    <td className="py-3.5">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{inv.clientName}</p>
                        <p className="text-[10px] text-slate-450 font-mono">{inv.clientEmail}</p>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-550 dark:text-slate-450">{inv.date}</td>
                    <td className="py-3.5 font-bold font-mono text-slate-900 dark:text-white">
                      ₹{inv.amount.toLocaleString('en-IN')}
                      {inv.amount_paid > 0 && <span className="block text-[9px] text-emerald-600 font-normal">Paid: ₹{inv.amount_paid.toLocaleString('en-IN')}</span>}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 border border-emerald-500/10'
                          : inv.status === 'Partial Paid'
                          ? 'bg-blue-500/10 text-blue-650 dark:text-blue-400 border border-blue-500/10'
                          : inv.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-500/10'
                          : 'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/10'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-red-600 font-bold text-[10px] flex items-center gap-1">
                      {isOverdue && <><AlertTriangle className="w-3.5 h-3.5" />{overdueText}</>}
                    </td>
                    <td className="py-3.5 text-right space-x-1">
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => setPaymentModalInvoice(inv)}
                          className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 transition inline-flex items-center gap-1 align-middle"
                        >
                          <CreditCard className="w-3 h-3" /> Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (isOverdue) setOverduePopupInvoice(inv);
                          else setViewingInvoice(inv);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[9px] font-bold text-slate-700 dark:text-slate-300 transition inline-block align-middle"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditInvoice(inv.id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[9px] font-bold text-slate-700 dark:text-slate-300 transition inline-block align-middle"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition inline-block align-middle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
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

      <AnimatePresence>
        {paymentModalInvoice && (
          <RecordPaymentModal 
            invoice={paymentModalInvoice} 
            onClose={() => setPaymentModalInvoice(null)} 
            onPaymentSuccess={handlePaymentSuccess}
            addLog={addLog}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {overduePopupInvoice && (
          <OverduePopup 
            invoice={overduePopupInvoice} 
            onClose={() => setOverduePopupInvoice(null)} 
            onRecordPayment={() => setPaymentModalInvoice(overduePopupInvoice)}
            onExtendDueDate={() => setExtendDateInvoice(overduePopupInvoice)}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {extendDateInvoice && (
          <ExtendDueDateModal
            invoice={extendDateInvoice}
            onClose={() => setExtendDateInvoice(null)}
            onConfirm={handleExtendDueDateSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}

