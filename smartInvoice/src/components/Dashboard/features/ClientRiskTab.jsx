import React, { useState, useMemo } from 'react';
import {
  ShieldAlert, ShieldCheck, Shield, Search, Filter, TrendingUp,
  TrendingDown, Minus, ArrowRight, Download, MoreVertical,
  Activity, Bell, Mail, Clock, X, Building2, MapPin, Calendar, Mail as MailIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import clientApi from '../../../api/client';

export default function ClientRiskTab(props) {
  const { clients = [], invoices = [] } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedClientModal, setSelectedClientModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Derived client stats
  const clientStats = useMemo(() => {
    return clients.map(client => {
      const clientInvoices = invoices.filter(inv => inv.clientName === client.name || inv.clientEmail === client.email);
      const totalInvoices = clientInvoices.length;
      
      let outstandingAmount = 0;
      let totalAmount = 0;
      let maxOverdueDays = 0;
      let latestPaymentDate = null;

      clientInvoices.forEach(inv => {
        totalAmount += inv.amount || 0;
        const remaining = (inv.amount || 0) - (inv.amount_paid || 0);
        outstandingAmount += remaining;

        // Overdue calculation
        const dueStr = inv.dueDate || inv.due_date;
        if (dueStr && (inv.status === 'Overdue' || (remaining > 0 && new Date() > new Date(dueStr)))) {
          const due = new Date(dueStr);
          const diffDays = Math.ceil((new Date() - due) / (1000 * 60 * 60 * 24));
          if (diffDays > maxOverdueDays) maxOverdueDays = diffDays;
        }

        // Payments (assuming payments array exists or using simple last payment)
        if (inv.payments && inv.payments.length > 0) {
          inv.payments.forEach(p => {
             const pDate = new Date(p.payment_date || p.date);
             if (!latestPaymentDate || pDate > latestPaymentDate) {
               latestPaymentDate = pDate;
             }
          });
        }
      });

      const paymentReliability = totalAmount > 0 ? Math.round(((totalAmount - outstandingAmount) / totalAmount) * 100) : 100;
      
      let riskScore = 15; // default Low
      if (maxOverdueDays > 15) riskScore = 85;
      else if (maxOverdueDays > 0) riskScore = 50;
      else if (paymentReliability < 50 && totalInvoices > 0) riskScore = 60;
      
      return {
        ...client,
        totalInvoices,
        totalAmount,
        outstandingAmount,
        overdueDays: maxOverdueDays,
        paymentReliability,
        riskScore,
        lastPaymentDate: latestPaymentDate ? latestPaymentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'No Payments',
        trend: riskScore > 70 ? 'deteriorating' : riskScore < 30 ? 'improving' : 'stable'
      };
    });
  }, [clients, invoices]);

  const handleSendReminder = async (clientData) => {
    try {
      const status = clientData.totalInvoices === 0 ? 'Clear' : clientData.outstandingAmount === 0 ? 'Paid' : clientData.outstandingAmount < clientData.totalAmount ? 'Partial Paid' : 'Unpaid';
      let subject = '';
      let body = '';

      if (status === 'Unpaid' || status === 'Partial Paid') {
        subject = `Action Required: Outstanding Payment Reminder - ${clientData.name}`;
        body = `Dear ${clientData.name},\n\nThis is a formal reminder regarding your outstanding invoice payments. We kindly request you to process the pending balance at your earliest convenience to avoid any disruption in services.\n\nThank you for your prompt attention to this matter.\n\nBest regards,\nShnoor Invoice Management`;
      } else if (status === 'Paid') {
        subject = `Thank You for Your Payment - ${clientData.name}`;
        body = `Dear ${clientData.name},\n\nWe are writing to thank you for your recent payments. Your account is currently fully paid and up to date!\n\nWe appreciate doing business with you.\n\nBest regards,\nShnoor Invoice Management`;
      } else {
        subject = `Account Status - ${clientData.name}`;
        body = `Dear ${clientData.name},\n\nThis is a standard account update. You currently have no active invoices or outstanding balances with us.\n\nBest regards,\nShnoor Invoice Management`;
      }

      await clientApi.post('/clients/send-reminder', {
        subject,
        body,
        to_email: clientData.email,
        outstanding_amount: status === 'Unpaid' || status === 'Partial Paid' ? `₹${clientData.outstandingAmount.toLocaleString('en-IN')}` : null,
        overdue_days: clientData.overdueDays > 0 ? `${clientData.overdueDays} Days Overdue` : 'Current & On Time'
      });
      setToastMessage(`Email successfully sent to ${clientData.name}`);
      setTimeout(() => setToastMessage(''), 4000);
    } catch (error) {
      console.error("Failed to send email", error);
      setToastMessage('Failed to send email. Check configuration.');
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  // Logic to determine status
  const getRiskStatus = (score) => {
    if (score <= 30) return 'Low';
    if (score <= 70) return 'Moderate';
    return 'High';
  };

  const getRiskStyles = (status) => {
    switch (status) {
      case 'Low':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-500/20',
          text: 'text-emerald-700 dark:text-emerald-400',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          dot: 'bg-emerald-500',
          border: 'border-emerald-200 dark:border-emerald-800'
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-100 dark:bg-amber-500/20',
          text: 'text-amber-700 dark:text-amber-400',
          icon: <Shield className="w-3.5 h-3.5" />,
          dot: 'bg-amber-500',
          border: 'border-amber-200 dark:border-amber-800'
        };
      case 'High':
      default:
        return {
          bg: 'bg-red-100 dark:bg-red-500/20',
          text: 'text-red-700 dark:text-red-400',
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
          dot: 'bg-red-500',
          border: 'border-red-200 dark:border-red-800'
        };
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-3 h-3 text-emerald-500" />;
      case 'deteriorating': return <TrendingDown className="w-3 h-3 text-red-500" />;
      case 'stable': default: return <Minus className="w-3 h-3 text-slate-400" />;
    }
  };

  const filteredClients = useMemo(() => {
    return clientStats.filter(client => {
      const status = getRiskStatus(client.riskScore);
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            client.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = riskFilter === 'All' || status === riskFilter;
      return matchesSearch && matchesFilter;
    });
  }, [clientStats, searchQuery, riskFilter]);

  // Derived Stats
  const totalClients = clientStats.length;
  const lowRiskCount = clientStats.filter(c => getRiskStatus(c.riskScore) === 'Low').length;
  const moderateRiskCount = clientStats.filter(c => getRiskStatus(c.riskScore) === 'Moderate').length;
  const highRiskCount = clientStats.filter(c => getRiskStatus(c.riskScore) === 'High').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
      `}</style>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Client Risk Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor client payment behavior and identify potential default risks.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-500/5 rounded-full blur-2xl group-hover:bg-slate-500/10 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Clients</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{totalClients}</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase">Active Accounts</p>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Activity className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        </div>

        {/* Low Risk */}
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Low Risk</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{lowRiskCount}</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase">No overdue invoices</p>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Moderate Risk */}
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Moderate Risk</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{moderateRiskCount}</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase">1-15 overdue days</p>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">High Risk</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{highRiskCount}</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase">15+ overdue days</p>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Main Table Area */}
        <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40 overflow-hidden flex flex-col">
          
          {/* Table Header Controls */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Client Portfolio Risk</h4>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Filter className="w-3.5 h-3.5" />
                </span>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 pl-8 pr-8 py-1.5 text-xs focus:outline-none focus:border-indigo-500 dark:border-slate-800 dark:text-white font-medium w-full"
                >
                  <option value="All">All Risk Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Moderate">Moderate Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 dark:border-slate-800 dark:text-white w-full sm:w-48"
                />
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-5">Client Info</th>
                  <th className="py-3 px-5">Outstandings</th>
                  <th className="py-3 px-5 text-center">Overdue</th>
                  <th className="py-3 px-5">Payment Success Rate</th>
                  <th className="py-3 px-5">Risk Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredClients.length > 0 ? filteredClients.map((client) => {
                  const status = getRiskStatus(client.riskScore);
                  const styles = getRiskStyles(status);
                  return (
                    <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors group">
                      {/* Client Info */}
                      <td className="py-4 px-5">
                        <div 
                          className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-lg transition-colors"
                          onClick={() => setSelectedClientModal(client)}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${styles.bg} ${styles.text} shrink-0`}>
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                              {client.name}
                              {getTrendIcon(client.trend)}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{client.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Outstandings */}
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-900 dark:text-white font-mono">
                          ₹{client.outstandingAmount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {client.totalInvoices} Invoices Total
                        </p>
                      </td>

                      {/* Overdue */}
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          client.overdueDays > 15 ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                          client.overdueDays > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                          'text-slate-500 dark:text-slate-400'
                        }`}>
                          {client.overdueDays > 0 ? `${client.overdueDays} Days` : 'On Time'}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                          Status: {client.totalInvoices === 0 ? 'Clear' : client.outstandingAmount === 0 ? 'Paid' : client.outstandingAmount < client.totalAmount ? 'Partial Paid' : 'Unpaid'}
                        </p>
                      </td>

                      {/* Reliability */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${client.paymentReliability >= 80 ? 'bg-emerald-500' : client.paymentReliability >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${client.paymentReliability}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-400">{client.paymentReliability}%</span>
                        </div>
                      </td>

                      {/* Risk Status */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-fit ${styles.bg} ${styles.text}`}>
                            {styles.icon} {status} Risk
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-900/30 rounded-lg transition-colors" 
                            title="Send Reminder via SMTP"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendReminder(client);
                            }}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <Shield className="w-10 h-10 mx-auto mb-3 text-slate-200 dark:text-slate-700" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No clients match criteria</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Client Detail Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedClientModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedClientModal(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-500" />
                    Client Profile
                  </h3>
                  <button
                    onClick={() => setSelectedClientModal(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold border border-indigo-200 dark:border-indigo-800">
                      {selectedClientModal.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedClientModal.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">{selectedClientModal.gst ? `GSTIN: ${selectedClientModal.gst}` : 'Unregistered'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                      <MailIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Contact Email</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedClientModal.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Billing Address</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {selectedClientModal.address || 'Address not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                      <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Date Joined</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                           {/* Using fallback 'date' or a mocked one if not available */}
                          {selectedClientModal.date_joined || selectedClientModal.created_at ? new Date(selectedClientModal.date_joined || selectedClientModal.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedClientModal(null)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Close Profile
                  </button>
                  <a
                    href={`mailto:${selectedClientModal.email}`}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
                  >
                    <MailIcon className="w-4 h-4" />
                    Contact Client
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[150] border border-slate-800 dark:border-slate-200"
          >
            <div className="w-8 h-8 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            </div>
            <p className="text-sm font-semibold pr-4">{toastMessage}</p>
            <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white dark:text-slate-500 dark:hover:text-slate-900 transition">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
