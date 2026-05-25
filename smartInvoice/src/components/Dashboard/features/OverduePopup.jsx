import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CalendarClock, CreditCard, CalendarRange, X } from 'lucide-react';

export default function OverduePopup({ invoice, onClose, onRecordPayment, onExtendDueDate }) {
  // Calculate days overdue
  const dueDate = new Date(invoice.dueDate || invoice.due_date);
  const today = new Date();
  const diffTime = Math.abs(today - dueDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const remaining = invoice.amount - (invoice.amount_paid || 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-red-500/10 relative z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
        
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-4 mb-6">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Overdue</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Invoice <span className="font-bold text-slate-700 dark:text-slate-300">{invoice.id}</span> for <span className="font-bold text-slate-700 dark:text-slate-300">{invoice.clientName}</span> is {diffDays} days past due.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-150 dark:border-slate-850 mb-6 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Outstanding</span>
            <span className="text-lg font-bold text-red-600 dark:text-red-400 font-mono">₹{remaining.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Due Date</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{invoice.dueDate || invoice.due_date}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { onClose(); onRecordPayment(); }}
            className="flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-md shadow-indigo-500/20"
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[11px] font-bold">Record Payment</span>
          </button>
          
          <button
            onClick={() => { onClose(); onExtendDueDate(); }}
            className="flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700"
          >
            <CalendarRange className="w-5 h-5" />
            <span className="text-[11px] font-bold">Extend Due Date</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
