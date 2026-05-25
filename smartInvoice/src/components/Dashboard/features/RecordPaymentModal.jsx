import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Calendar, CreditCard, Hash, FileText } from 'lucide-react';
import client from '../../../api/client';

export default function RecordPaymentModal({ invoice, onClose, onPaymentSuccess, addLog }) {
  const [amount, setAmount] = useState(invoice.amount - (invoice.amount_paid || 0));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const remaining = invoice.amount - (invoice.amount_paid || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount <= 0 || amount > remaining) {
      alert("Invalid payment amount.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        notes: notes
      };
      const response = await client.post(`/invoices/${invoice.dbId}/payments`, payload);
      
      addLog(`Payment of ₹${amount} recorded for Invoice ${invoice.id}`, 'success');
      onPaymentSuccess(invoice.id, response.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Payment</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Invoice {invoice.id} • {invoice.clientName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Summary */}
        <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-150 dark:border-slate-850 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 font-semibold">Remaining Balance</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">₹{remaining.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full" 
              style={{ width: `${((invoice.amount_paid || 0) / invoice.amount) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            <span>Total: ₹{invoice.amount.toLocaleString('en-IN')}</span>
            <span>Paid: ₹{(invoice.amount_paid || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Payment Amount (₹)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="number" 
                max={remaining}
                step="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Payment Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date"
                  required
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Method</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white transition appearance-none"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Transaction ID (Optional)</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                placeholder="e.g. TXN-902348"
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Notes (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any payment notes..."
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white transition min-h-[80px]"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg shadow-indigo-500/20"
            >
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
