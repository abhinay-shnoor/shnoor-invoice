import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileSpreadsheet,
  Layers,
  History,
  TrendingDown,
  Percent,
  Users,
  Terminal,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Printer,
  CheckCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  Search,
  Eye,
  Info,
  DollarSign,
  Briefcase,
  UserPlus,
  Building2,
  CalendarCheck,
  Wallet,
  Clock3,
  Check,
  ChevronRight,
  Sparkles,
  Palette,
  ArrowRight,
  UserCheck2,
  FileText,
  X,
  Chrome
} from 'lucide-react'
import client from '../../api/client'

export default function Dashboard({ user, onLogout, adminEmail, setAdminEmail }) {
  const [currentRole, setCurrentRole] = useState(user.role)

  // Sidebar tab state
  const [activeTab, setActiveTab] = useState('overview')
  const [viewingInvoice, setViewingInvoice] = useState(null)

  // Live styling template for the PDF Previewer
  const [invoiceTemplate, setInvoiceTemplate] = useState('sleek_indigo')

  // Synchronize dynamic role changes from the backend when the user changes
  useEffect(() => {
    setCurrentRole(user.role)
  }, [user.role])

  const getSidebarItemClass = (tabId) => {
    const isActive = activeTab === tabId
    if (isActive) {
      return 'w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 shadow-sm shadow-indigo-500/5'
    }
    return 'w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800/40'
  }

  // --- REAL BACKEND INTEGRATION ---
  const [invoices, setInvoices] = useState([])
  const [expenses, setExpenses] = useState([])
  const [clients, setClients] = useState([])
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [dbSource, setDbSource] = useState('neon-postgres')

  const fetchUsers = async () => {
    if (user.role !== 'admin') return;
    try {
      const response = await client.get('/users')
      setUsers(response.data || [])
    } catch (err) {
      console.error("Error fetching users from FastAPI server:", err)
    }
  }

  const fetchData = async () => {
    try {
      const [invRes, expRes, cliRes, itmRes] = await Promise.all([
        client.get('/invoices/'),
        client.get('/expenses/'),
        client.get('/clients/'),
        client.get('/products/')
      ]);
      
      const mappedClients = (cliRes.data || []).map(c => ({
        ...c,
        gst: c.gst_number || c.gst || 'GSTIN Unprovided'
      }));
      
      const mappedItems = (itmRes.data || []).map(i => ({
        ...i,
        rate: i.price,
        tax: i.tax || 18,
        liveLink: i.live_link || ''
      }));

      const mappedInvoices = (invRes.data || []).map(inv => {
        const clientObj = mappedClients.find(c => c.id === inv.client_id) || {};
        return {
          id: inv.invoice_number,
          dbId: inv.id,
          clientName: clientObj.name || 'Unknown Client',
          clientEmail: clientObj.email || '',
          clientAddress: clientObj.address || '',
          date: inv.date,
          dueDate: inv.due_date,
          amount: inv.total || 0,
          status: inv.status || 'Pending',
          items: inv.items || []
        };
      });

      setInvoices(mappedInvoices);
      setExpenses(expRes.data || []);
      setClients(mappedClients);
      setItems(mappedItems);
    } catch (error) {
      console.error("Failed to sync data with server", error);
    }
  };

  useEffect(() => {
    fetchUsers()
    fetchData()
  }, [])

  // Sync logs to local storage temporarily (audit logs are not fully modeled yet)
  useEffect(() => {
    const saved = localStorage.getItem('shnoor_logs')
    if (saved) setAuditLogs(JSON.parse(saved))
  }, [])
  useEffect(() => {
    localStorage.setItem('shnoor_logs', JSON.stringify(auditLogs))
  }, [auditLogs])

  // --- Real-time invoice formulation state ---
  const [invoiceForm, setInvoiceForm] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ desc: '', qty: 1, rate: 0, tax: 18 }]
  })

  // Expense formulation state
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'Software',
    date: new Date().toISOString().split('T')[0],
    amount: ''
  })

  // Client directory formulation state
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gst: ''
  })

  // Catalog item formulation state
  const [itemForm, setItemForm] = useState({
    name: '',
    desc: '',
    rate: '',
    tax: 18,
    liveLink: ''
  })

  const [selectedProduct, setSelectedProduct] = useState(null)


  // Log system actions helper
  const addLog = (event, type = 'info') => {
    const time = new Date().toTimeString().split(' ')[0]
    setAuditLogs(prev => [{ time, event, type }, ...prev])
  }

  // Effect to log security role mismatches
  useEffect(() => {
    if (user.attemptedAdmin && user.role !== 'admin') {
      addLog(`SECURITY ALERT: ${user.name} (${user.email}) attempted Admin Login - Clearance Denied`, 'error')
    }
  }, [user])

  // Synchronize admin users email config changes
  useEffect(() => {
    fetchUsers()
  }, [adminEmail])

  // Core calculations
  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.amount, 0)
  const paidInvoiced = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0)
  const outstandingInvoiced = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0)
  
  // Dynamic Tax calculations
  const totalGST = invoices.reduce((acc, curr) => {
    const invoiceTax = curr.items.reduce((itemAcc, item) => itemAcc + (item.qty * item.rate * (item.tax / 100)), 0)
    return acc + invoiceTax
  }, 0)

  // Search/Filter states
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [expenseSearch, setExpenseSearch] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [itemSearch, setItemSearch] = useState('')

  // Invoice handlers
  const handleAddItemRow = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { desc: '', qty: 1, rate: 0, tax: 18 }]
    })
  }

  const handleRemoveItemRow = (index) => {
    if (invoiceForm.items.length <= 1) return
    setInvoiceForm({
      ...invoiceForm,
      items: invoiceForm.items.filter((_, i) => i !== index)
    })
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceForm.items]
    updatedItems[index][field] = field === 'desc' ? value : parseFloat(value) || 0
    setInvoiceForm({ ...invoiceForm, items: updatedItems })
  }

  const handleSelectPredefinedItem = (rowIndex, itemId) => {
    const selected = items.find(itm => itm.id === itemId)
    if (!selected) return
    const updatedItems = [...invoiceForm.items]
    updatedItems[rowIndex].desc = selected.name
    updatedItems[rowIndex].rate = selected.rate
    updatedItems[rowIndex].tax = selected.tax
    setInvoiceForm({ ...invoiceForm, items: updatedItems })
    addLog(`Auto-populated row ${rowIndex + 1} with ${selected.name}`, 'info')
  }

  const handleSelectPredefinedClient = (clientName) => {
    const selected = clients.find(c => c.name === clientName)
    if (!selected) return
    setInvoiceForm({
      ...invoiceForm,
      clientName: selected.name,
      clientEmail: selected.email,
      clientAddress: selected.address
    })
    addLog(`Auto-populated client with ${selected.name} credentials`, 'info')
  }

  const calculateInvoiceTotal = (form) => {
    return form.items.reduce((acc, item) => {
      const sub = item.qty * item.rate
      const tax = sub * (item.tax / 100)
      return acc + sub + tax
    }, 0)
  }

  const handleCreateInvoice = async (e) => {
    e.preventDefault()
    if (!invoiceForm.clientName || !invoiceForm.clientEmail || invoiceForm.items[0].desc === '') {
      alert("Please fill client details and write at least one line item description.")
      return
    }

    const grandTotal = calculateInvoiceTotal(invoiceForm)
    const subtotal = invoiceForm.items.reduce((acc, item) => acc + (item.qty * item.rate), 0)
    const taxAmount = grandTotal - subtotal
    const selectedClient = clients.find(c => c.name === invoiceForm.clientName || c.email === invoiceForm.clientEmail)
    const client_id = selectedClient ? selectedClient.id : null

    const payload = {
      client_id: client_id,
      invoice_number: `INV-2026-00${invoices.length + 1}`,
      date: invoiceForm.date,
      due_date: invoiceForm.dueDate,
      status: 'Pending',
      subtotal: subtotal,
      tax_rate: 18.0,
      tax_amount: taxAmount,
      total: grandTotal,
      notes: '',
      items: invoiceForm.items
    }

    try {
      const response = await client.post('/invoices/', payload)
      const inv = response.data

      const newInvoice = {
        id: inv.invoice_number,
        dbId: inv.id,
        clientName: invoiceForm.clientName,
        clientEmail: invoiceForm.clientEmail,
        clientAddress: invoiceForm.clientAddress,
        date: inv.date,
        dueDate: inv.due_date,
        amount: inv.total || 0,
        status: inv.status || 'Pending',
        items: inv.items || []
      }

      setInvoices([newInvoice, ...invoices])
      addLog(`Invoice ${newInvoice.id} created for ${newInvoice.clientName} (Total: ₹${newInvoice.amount.toLocaleString('en-IN')})`, 'success')
      
      setInvoiceForm({
        clientName: '',
        clientEmail: '',
        clientAddress: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ desc: '', qty: 1, rate: 0, tax: 18 }]
      })
      
      setActiveTab('overview')
    } catch (err) {
      console.error("Failed to create invoice:", err)
      alert("Failed to save invoice to backend.")
    }
  }

  const handleUpdateStatus = async (id, nextStatus) => {
    const inv = invoices.find(i => i.id === id)
    if (!inv) return
    try {
      await client.put(`/invoices/${inv.dbId}`, { status: nextStatus })
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: nextStatus } : inv))
      addLog(`Invoice ${id} state marked as ${nextStatus.toUpperCase()}`, 'info')
    } catch (err) {
      console.error("Failed to update status:", err)
      alert("Failed to update status on backend.")
    }
  }

  const handleDeleteInvoice = async (id) => {
    const inv = invoices.find(i => i.id === id)
    if (!inv) return
    try {
      await client.delete(`/invoices/${inv.dbId}`)
      setInvoices(invoices.filter(inv => inv.id !== id))
      addLog(`Invoice ${id} permanently wiped from registry`, 'info')
    } catch (err) {
      console.error("Failed to delete invoice:", err)
      alert("Failed to delete invoice from backend.")
    }
  }

  // Expense Handlers
  const handleCreateExpense = async (e) => {
    e.preventDefault()
    if (!expenseForm.title || !expenseForm.amount) return

    try {
      const response = await client.post('/expenses/', {
        title: expenseForm.title,
        category: expenseForm.category,
        date: expenseForm.date,
        amount: parseFloat(expenseForm.amount)
      })

      setExpenses([response.data, ...expenses])
      addLog(`Expense recorded: ${response.data.title} (₹${response.data.amount.toLocaleString('en-IN')})`, 'info')
      
      setExpenseForm({
        title: '',
        category: 'Software',
        date: new Date().toISOString().split('T')[0],
        amount: ''
      })
    } catch (err) {
      console.error("Failed to create expense:", err)
      alert("Failed to save expense to backend.")
    }
  }

  // Customer Directory Handlers
  const handleCreateClient = async (e) => {
    e.preventDefault()
    if (!clientForm.name || !clientForm.email) return

    try {
      const response = await client.post('/clients/', {
        name: clientForm.name,
        email: clientForm.email,
        phone: clientForm.phone || '+1 (555) 000-0000',
        address: clientForm.address || 'Address unspecified',
        gst_number: clientForm.gst || 'GSTIN Unprovided'
      })

      const newClient = {
        ...response.data,
        gst: response.data.gst_number || response.data.gst || 'GSTIN Unprovided'
      }

      setClients([...clients, newClient])
      addLog(`Customer client registered: ${newClient.name} (${newClient.email})`, 'success')
      setClientForm({ name: '', email: '', phone: '', address: '', gst: '' })
    } catch (err) {
      console.error("Failed to create client:", err)
      alert("Failed to save client to backend.")
    }
  }

  const handleDeleteClient = async (id, name) => {
    try {
      await client.delete(`/clients/${id}`)
      setClients(clients.filter(c => c.id !== id))
      addLog(`Customer ${name} deleted from contacts list`, 'info')
    } catch (err) {
      console.error("Failed to delete client:", err)
      alert("Failed to delete client from backend.")
    }
  }

  // Items Catalog Handlers
  const handleCreateItem = async (e) => {
    e.preventDefault()
    if (!itemForm.name || !itemForm.rate) return

    try {
      const response = await client.post('/products/', {
        name: itemForm.name,
        description: itemForm.desc || 'No item description available',
        price: parseFloat(itemForm.rate),
        category: 'Workspace Item',
        stock: 0,
        live_link: itemForm.liveLink || ''
      })

      const newItem = {
        ...response.data,
        rate: response.data.price,
        tax: 18,
        liveLink: response.data.live_link || ''
      }

      setItems([...items, newItem])
      addLog(`Catalog item added: ${newItem.name} (Rate: ₹${newItem.rate.toLocaleString('en-IN')})`, 'success')
      setItemForm({ name: '', desc: '', rate: '', tax: 18, liveLink: '' })
    } catch (err) {
      console.error("Failed to create item:", err)
      alert("Failed to save item to backend.")
    }
  }

  const handleDeleteItem = async (id, name) => {
    try {
      await client.delete(`/products/${id}`)
      setItems(items.filter(itm => itm.id !== id))
      addLog(`Item ${name} removed from workspace catalog`, 'info')
    } catch (err) {
      console.error("Failed to delete item:", err)
      alert("Failed to delete item from backend.")
    }
  }



  // Admin user promotions/demotions via server API
  const toggleUserRole = async (id, currentVal) => {
    if (currentRole !== 'admin') return
    const nextRole = currentVal === 'admin' ? 'user' : 'admin'
    const targetUser = users.find(u => u.id === id)
    if (!targetUser) return
    const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:3001/api'

    try {
      const response = await fetch(`${USER_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Re-adding with toggled role acts as an update in our SQLite/Postgres UPSERT
        body: JSON.stringify({ email: targetUser.email, name: targetUser.name, role: nextRole }),
      })
      if (response.ok) {
        addLog(`Authorization shifted: ${targetUser.name} role changed to ${nextRole.toUpperCase()}`, 'success')
        fetchUsers()
      } else {
        const err = await response.json()
        alert(err.error || "Failed to toggle role")
      }
    } catch (err) {
      console.error("Error toggling role:", err)
    }
  }

  // Add new user via Neon Express API
  const handleAddUser = async () => {
    const name = prompt("Enter new user name:")
    if (!name) return
    const email = prompt("Enter new user email:")
    if (!email) return
    const role = prompt("Enter user role (admin or user):", "user")
    if (!role) return
    const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:3001/api'

    try {
      const response = await fetch(`${USER_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role: role.toLowerCase().trim() }),
      })
      if (response.ok) {
        addLog(`New user registered to Neon Database: ${name} (${email})`, 'success')
        fetchUsers()
      } else {
        const errData = await response.json()
        alert(errData.error || "Failed to add user.")
      }
    } catch (err) {
      console.error("Error adding user:", err)
      alert("Unable to connect to the backend server.")
    }
  }

  // Generate a beautiful, print-ready printable/downloadable invoice card pop-up window
  const handlePrintSelectedInvoice = (invoice) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900')
    const itemsHtml = (invoice.items && invoice.items.length > 0 ? invoice.items : [{ desc: 'Standard Supply Items', qty: 1, rate: invoice.amount }]).map(itm => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 14px 0; font-size: 13px; color: #334155; font-weight: 550;">${itm.desc}</td>
        <td style="padding: 14px 0; font-size: 13px; color: #475569; text-align: center;">${itm.qty}</td>
        <td style="padding: 14px 0; font-size: 13px; color: #475569; text-align: right; font-family: monospace;">₹${(itm.rate || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 14px 0; font-size: 13px; color: #1e293b; text-align: right; font-family: monospace; font-weight: bold;">₹${((itm.qty * itm.rate) || 0).toLocaleString('en-IN')}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 40px;
              color: #1e293b;
              background-color: #f8fafc;
            }
            .invoice-card {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              border-radius: 24px;
              padding: 48px;
              background-color: #ffffff;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 28px;
              margin-bottom: 28px;
            }
            .brand {
              font-weight: 800;
              font-size: 22px;
              color: #4f46e5;
              letter-spacing: -0.02em;
            }
            .title {
              font-weight: 800;
              font-size: 26px;
              text-align: right;
              letter-spacing: -0.02em;
              color: #0f172a;
            }
            .meta-grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 32px;
              margin-bottom: 40px;
            }
            .meta-label {
              font-size: 10px;
              font-weight: 750;
              text-transform: uppercase;
              color: #64748b;
              letter-spacing: 0.08em;
              margin-bottom: 6px;
            }
            .meta-value {
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            .table th {
              border-bottom: 2px solid #f1f5f9;
              color: #475569;
              font-weight: 700;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding-bottom: 12px;
            }
            .totals {
              margin-left: auto;
              width: 300px;
              margin-top: 28px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              font-size: 13px;
            }
            .grand-total {
              font-size: 18px;
              font-weight: 800;
              border-top: 2px solid #4f46e5;
              padding-top: 14px;
              color: #4f46e5;
            }
            .badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .badge-paid { background-color: #ecfdf5; color: #047857; }
            .badge-pending { background-color: #fffbeb; color: #b45309; }
            @media print {
              body {
                background-color: #fff;
                padding: 0;
              }
              .invoice-card {
                border: none;
                box-shadow: none;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <div class="header">
              <div>
                <div class="brand">Shnoor Invoice</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500;">Smart Invoicing Solution</div>
              </div>
              <div>
                <div class="title">INVOICE</div>
                <div style="font-size: 15px; font-weight: 700; color: #4f46e5; margin-top: 4px; font-family: monospace; text-align: right;">${invoice.id}</div>
              </div>
            </div>
            
            <div class="meta-grid">
              <div>
                <div class="meta-label">Billed To</div>
                <div class="meta-value" style="font-size: 16px;">${invoice.clientName}</div>
                <div style="font-size: 13px; color: #475569; margin-top: 2px; font-weight: 500;">${invoice.clientEmail}</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 2px; font-weight: 500;">${invoice.clientAddress || ''}</div>
              </div>
              <div style="text-align: right;">
                <div class="meta-label">Invoice Details</div>
                <div style="margin-bottom: 14px;">
                  <span class="badge ${invoice.status === 'Paid' ? 'badge-paid' : 'badge-pending'}">${invoice.status}</span>
                </div>
                <div style="font-size: 13px; color: #475569; font-weight: 500;"><strong>Issued:</strong> ${invoice.date}</div>
                <div style="font-size: 13px; color: #475569; margin-top: 4px; font-weight: 500;"><strong>Due Date:</strong> ${invoice.dueDate || invoice.due_date || ''}</div>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th style="text-align: left; padding-bottom: 12px;">Description</th>
                  <th style="text-align: center; width: 80px; padding-bottom: 12px;">Qty</th>
                  <th style="text-align: right; width: 120px; padding-bottom: 12px;">Rate</th>
                  <th style="text-align: right; width: 120px; padding-bottom: 12px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span style="color: #64748b; font-weight: 500;">Subtotal</span>
                <span style="font-family: monospace; font-weight: 600; color: #334155;">₹${(invoice.amount / 1.18).toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
              </div>
              <div class="total-row">
                <span style="color: #64748b; font-weight: 500;">GST (18% Included)</span>
                <span style="font-family: monospace; font-weight: 600; color: #334155;">₹${(invoice.amount - (invoice.amount / 1.18)).toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
              </div>
              <div class="total-row grand-total">
                <span>Grand Total</span>
                <span style="font-family: monospace;">₹${invoice.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div style="margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 500;">
              Thank you for your business! If you have any questions regarding this invoice, please contact support.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Delete user via Neon Express API
  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Are you sure you want to permanently delete user ${name}?`)) return
    const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:3001/api'
    try {
      const response = await fetch(`${USER_API_URL}/users/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        addLog(`Permanently deleted user: ${name}`, 'info')
        fetchUsers()
      } else {
        const errData = await response.json()
        alert(errData.error || "Failed to delete user.")
      }
    } catch (err) {
      console.error("Error deleting user:", err)
    }
  }

  // Filtering systems
  const filteredInvoices = invoices.filter(inv => 
    inv.clientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    inv.id.toLowerCase().includes(invoiceSearch.toLowerCase())
  )

  const filteredExpenses = expenses.filter(exp => 
    exp.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
    exp.category.toLowerCase().includes(expenseSearch.toLowerCase())
  )

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const filteredItems = items.filter(itm => 
    itm.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    itm.desc.toLowerCase().includes(itemSearch.toLowerCase())
  )

  // Guard system check for Admin clearances
  const isAdminTab = activeTab.startsWith('admin_') || activeTab === 'tax'
  const isAuthorized = currentRole === 'admin'
  const shouldRenderAccessDenied = isAdminTab && !isAuthorized

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

          {!isAuthorized && (
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
                <Sparkles className="w-4 h-4 shrink-0 text-slate-500" />
                <span>AI Expense Insight</span>
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
                onClick={() => setActiveTab('admin_logs')}
                className={getSidebarItemClass('admin_logs')}
              >
                <Terminal className="w-4 h-4 shrink-0" />
                <span>Security Audit Logs</span>
              </button>

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
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 dark:border-slate-850 shrink-0"
              alt="Avatar"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                currentRole === 'admin' 
                  ? 'bg-indigo-100 text-indigo-750 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/20' 
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {currentRole === 'admin' ? 'Super Admin' : 'Standard User'}
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
              {activeTab === 'items' && <Layers className="w-3.5 h-3.5 text-indigo-650" />}
              {activeTab === 'generator' && <Plus className="w-3.5 h-3.5 text-indigo-650" />}
              {activeTab === 'invoices' && <History className="w-3.5 h-3.5 text-indigo-650" />}
              {activeTab === 'expenses' && (
                !isAuthorized ? <Sparkles className="w-3.5 h-3.5 text-indigo-650" /> : <TrendingDown className="w-3.5 h-3.5 text-indigo-650" />
              )}
              {activeTab === 'items' 
                ? 'Products' 
                : activeTab === 'generator'
                  ? 'Create Invoice'
                  : activeTab === 'expenses' && !isAuthorized 
                    ? 'AI Expense Insight' 
                    : activeTab.replace('admin_', 'Admin > ').replace('tax', 'GST & Tax Reports')}
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
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Welcome banner */}
                    <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/70 to-indigo-50/80 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-indigo-950/20 rounded-3xl p-6 border border-indigo-100/55 dark:border-indigo-900/30 shadow-sm text-slate-800 dark:text-slate-100 relative overflow-hidden">
                      <div className="absolute right-0 top-0 -mr-24 -mt-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2 py-0.5 rounded bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-200/20">Active Workspace</span>
                            {currentRole === 'admin' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450 text-[10px] font-bold uppercase tracking-wider border border-emerald-250/20">Super Admin Console</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Standard Access Ledger</span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Good day, {user.name}!</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 max-w-xl">
                            {currentRole === 'admin' 
                              ? 'Manage enterprise tax compliance, view organizational cash flow indexes, audit logs, and log invoicing systems.'
                              : 'Log invoices, register corporate expenses, manage customers, catalog items, and track timesheet billable hours.'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Stats Metrics Cards grid based on Role */}
                    {currentRole === 'admin' ? (
                      /* Admin Financial Statistics View */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Total Invoiced</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-slate-900 dark:text-white">₹{totalInvoiced.toLocaleString('en-IN')}</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Historical billing records</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Wallet className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Collected Capital</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-emerald-600 dark:text-emerald-400">₹{paidInvoiced.toLocaleString('en-IN')}</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Settled ledger accounts</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Clock3 className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Outstanding Balances</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-amber-500">₹{outstandingInvoiced.toLocaleString('en-IN')}</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Pending customer payout</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                            <Percent className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Output GST Liability</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-indigo-650 dark:text-indigo-400 font-mono">₹{Math.round(totalGST).toLocaleString('en-IN')}</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <Info className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Aggregated supply rates</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Standard User Personal Statistics View */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-650">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Active Invoices</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-slate-900 dark:text-white">{invoices.length} Registered</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Ready to dispatch to clients</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-650">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Managed Customers</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-slate-900 dark:text-white">{clients.length} Clients</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>Saved in contact directory</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group hover:border-slate-350 transition duration-300">
                          <div className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-650">
                            <TrendingDown className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">My Logged Expenses</span>
                          <h4 className="text-2xl font-bold mt-1.5 text-red-500">₹{expenses.reduce((a,c) => a + c.amount, 0).toLocaleString('en-IN')}</h4>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-450 dark:text-slate-400">
                            <Info className="w-3.5 h-3.5 text-red-400" />
                            <span>Outgoings registered</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick activity and breakdown grids */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Column: Recent Invoices Ledger */}
                      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                            <span>Recent Active Invoices</span>
                          </h4>
                          <button
                            onClick={() => setActiveTab('invoices')}
                            className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Ledger</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="text-slate-450 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <th className="py-2.5">Invoice ID</th>
                                <th className="py-2.5">Recipient Enterprise</th>
                                <th className="py-2.5">Issued</th>
                                <th className="py-2.5">Total (inc. GST)</th>
                                <th className="py-2.5 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {invoices.slice(0, 4).map((invoice) => (
                                <tr 
                                  key={invoice.id} 
                                  onClick={() => setViewingInvoice(invoice)}
                                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition cursor-pointer"
                                >
                                  <td className="py-3 font-mono font-bold text-indigo-650 dark:text-indigo-400">{invoice.id}</td>
                                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{invoice.clientName}</td>
                                  <td className="py-3 text-slate-550 dark:text-slate-450">{invoice.date}</td>
                                  <td className="py-3 font-bold font-mono text-slate-900 dark:text-white">₹{invoice.amount.toLocaleString('en-IN')}</td>
                                  <td className="py-3 text-right">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                      invoice.status === 'Paid'
                                        ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 border border-emerald-500/10'
                                        : invoice.status === 'Pending'
                                        ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-500/10'
                                        : 'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/10'
                                    }`}>
                                      {invoice.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right Column: Expense Distributions */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span>Corporate Expenses</span>
                          </h4>
                          <button
                            onClick={() => setActiveTab('expenses')}
                            className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Trackers</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Chart calculations */}
                        <div className="space-y-4 pt-1">
                          {['Software', 'Rent', 'Meals', 'Travel'].map((cat) => {
                            const catAmt = expenses.filter(e => e.category === cat).reduce((acc, curr) => acc + curr.amount, 0)
                            const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0)
                            const pct = totalExp ? Math.round((catAmt / totalExp) * 100) : 0
                            
                            return (
                              <div key={cat} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-slate-600 dark:text-slate-350">{cat}</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">₹{catAmt.toLocaleString('en-IN')} ({pct}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      cat === 'Software' ? 'bg-indigo-500' : 
                                      cat === 'Rent' ? 'bg-emerald-500' : 
                                      cat === 'Meals' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Catalog and Customer quick insights */}
                    <div className={`grid grid-cols-1 ${!isAuthorized ? 'md:grid-cols-2' : ''} gap-6`}>
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-slate-850 text-indigo-650 flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Quick Client Directory</h4>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{clients.length} Customers Enrolled</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('clients')}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-650 dark:text-indigo-400 transition"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {!isAuthorized && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 flex items-center justify-between">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-slate-850 text-emerald-600 flex items-center justify-center">
                              <Layers className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Products Catalog</h4>
                              <p className="text-sm font-bold text-slate-800 dark:text-white">{items.length} Predefined Products</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('items')}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-650 dark:text-indigo-400 transition"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* 2. CUSTOMER CLIENTS DIRECTORY */}
                {activeTab === 'clients' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Register Client Customer */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 h-fit">
                        <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <UserPlus className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Register Customer</h4>
                        </div>

                        <form onSubmit={handleCreateClient} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">Enterprise Name</label>
                            <input
                              type="text"
                              required
                              value={clientForm.name}
                              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                              placeholder="e.g. Google India Private Ltd"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">Billing Email</label>
                            <input
                              type="email"
                              required
                              value={clientForm.email}
                              onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                              placeholder="e.g. finance@google.com"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">Contact Phone</label>
                            <input
                              type="text"
                              value={clientForm.phone}
                              onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                              placeholder="e.g. +91 99999 88888"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">Billing Address</label>
                            <textarea
                              rows="2"
                              value={clientForm.address}
                              onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                              placeholder="e.g. Level 5, Signature Towers, Gurugram, India"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-sans resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">Client GSTIN / Tax ID</label>
                            <input
                              type="text"
                              value={clientForm.gst}
                              onChange={(e) => setClientForm({ ...clientForm, gst: e.target.value })}
                              placeholder="e.g. 07AAAAA1111A1Z5"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono uppercase"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 py-2.5 text-xs font-bold transition shadow-md shadow-indigo-500/10"
                          >
                            Add Customer Profile
                          </button>
                        </form>
                      </div>

                      {/* Customer Client Directory List */}
                      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Customer Database</h4>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                              <Search className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="text"
                              placeholder="Filter customer list..."
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:text-white w-48"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredClients.map((c) => (
                            <div key={c.id} className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 relative group hover:border-indigo-650 transition duration-300">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300 uppercase shrink-0">
                                  {c.name.slice(0, 2)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{c.name}</h5>
                                  <p className="text-[10px] text-slate-500 font-mono truncate">{c.email}</p>
                                  <p className="text-[10px] text-slate-450 mt-1">{c.phone}</p>
                                  <p className="text-[10px] text-slate-450 line-clamp-1 italic">{c.address}</p>
                                  <p className="text-[9px] text-indigo-650 dark:text-indigo-400 font-mono mt-2 uppercase font-bold">GSTIN: {c.gst}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteClient(c.id, c.name)}
                                className="absolute top-2 right-2 p-1.5 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/20 transition duration-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {filteredClients.length === 0 && (
                            <div className="col-span-2 text-center py-12 text-slate-400">
                              <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p className="text-xs">No customer profiles found</p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {activeTab === 'items' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Register Item */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 h-fit">
                        <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <Plus className="w-4 h-4 text-emerald-500" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Register Product</h4>
                        </div>

                        <form onSubmit={handleCreateItem} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-355 mb-1.5">Product Name</label>
                            <input
                              type="text"
                              required
                              value={itemForm.name}
                              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                              placeholder="e.g. AWS Cloud Consultancy"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-355 mb-1.5">Description</label>
                            <textarea
                              rows="2"
                              value={itemForm.desc}
                              onChange={(e) => setItemForm({ ...itemForm, desc: e.target.value })}
                              placeholder="e.g. Corporate deployment hours including IAM & VPC configurations"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-sans resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-650 dark:text-slate-355 mb-1.5">Live Link (Optional)</label>
                            <input
                              type="url"
                              value={itemForm.liveLink}
                              onChange={(e) => setItemForm({ ...itemForm, liveLink: e.target.value })}
                              placeholder="e.g. https://myproduct.com"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-650 dark:text-slate-355 mb-1.5">Base Rate (₹)</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={itemForm.rate}
                                onChange={(e) => setItemForm({ ...itemForm, rate: e.target.value })}
                                placeholder="Price"
                                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-650 dark:text-slate-355 mb-1.5">GST Rate (%)</label>
                              <select
                                value={itemForm.tax}
                                onChange={(e) => setItemForm({ ...itemForm, tax: parseFloat(e.target.value) })}
                                className="w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                              >
                                <option value="18">18% GST (Standard)</option>
                                <option value="12">12% GST</option>
                                <option value="5">5% GST (Reduced)</option>
                                <option value="28">28% GST (Luxury)</option>
                                <option value="0">0% Exempt</option>
                              </select>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 py-2.5 text-xs font-bold transition shadow-md shadow-indigo-500/10"
                          >
                            Add Catalog Product
                          </button>
                        </form>
                      </div>

                      {/* Items catalog inventory list */}
                      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Products Catalog</h4>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                              <Search className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="text"
                              placeholder="Filter catalog products..."
                              value={itemSearch}
                              onChange={(e) => setItemSearch(e.target.value)}
                              className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:text-white w-48"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredItems.map((itm) => (
                            <div
                              key={itm.id}
                              onClick={() => setSelectedProduct(itm)}
                              className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 relative group hover:border-indigo-650 cursor-pointer hover:shadow-md transition duration-300"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 uppercase shrink-0">
                                  <Layers className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{itm.name}</h5>
                                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{itm.desc}</p>
                                  <div className="flex items-center gap-3 mt-3">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">₹{itm.rate.toLocaleString('en-IN')}</span>
                                    <span className="text-[9px] bg-indigo-550/10 text-indigo-600 dark:text-indigo-400 font-mono px-2 py-0.5 rounded font-bold uppercase">
                                      {itm.tax}% GST
                                    </span>
                                    {itm.liveLink && (
                                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 font-bold px-2 py-0.5 rounded uppercase">
                                        Live Page
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(itm.id, itm.name);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/20 transition duration-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {filteredItems.length === 0 && (
                            <div className="col-span-2 text-center py-12 text-slate-400">
                              <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p className="text-xs">No catalog items found</p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 4. STATEFUL INVOICE GENERATOR & REAL-TIME PDF PREVIEWER */}
                {activeTab === 'generator' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      
                      {/* Left: Input Formulate Panel */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 justify-between">
                          <div className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-650" />
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Formulate New Invoice</h3>
                          </div>
                          
                          {/* Live Template Picker */}
                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <Palette className="w-3.5 h-3.5 text-indigo-600" />
                            <select
                              value={invoiceTemplate}
                              onChange={(e) => setInvoiceTemplate(e.target.value)}
                              className="text-[10px] font-bold bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                            >
                              <option value="sleek_indigo">Sleek Indigo Theme</option>
                              <option value="emerald_pro">Emerald Pro Theme</option>
                              <option value="minimalist">Minimalist Charcoal</option>
                              <option value="gold_luxury">Gold Luxury Theme</option>
                            </select>
                          </div>
                        </div>

                        <form onSubmit={handleCreateInvoice} className="space-y-6">
                          
                          {/* Predefined Client Selection Dropdown */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                Predefined Customer Selector
                              </label>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">* Auto-Fill</span>
                            </div>
                            <select
                              onChange={(e) => handleSelectPredefinedClient(e.target.value)}
                              defaultValue=""
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-bold"
                            >
                              <option value="" disabled>--- Click to Auto-Fill Client Details ---</option>
                              {clients.map(c => (
                                <option key={c.id} value={c.name}>{c.name} ({c.email})</option>
                              ))}
                            </select>
                          </div>

                          {/* Client fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Client Enterprise Name</label>
                              <input
                                type="text"
                                required
                                value={invoiceForm.clientName}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                                placeholder="Tesla India Corp"
                                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 mb-1.5">Client Billing Email</label>
                              <input
                                type="email"
                                required
                                value={invoiceForm.clientEmail}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, clientEmail: e.target.value })}
                                placeholder="billing@tesla.in"
                                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                              />
                            </div>
                          </div>

                          {/* Billing Address Field */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Client Billing Address</label>
                            <input
                              type="text"
                              value={invoiceForm.clientAddress}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, clientAddress: e.target.value })}
                              placeholder="3500 Deer Creek Road, Palo Alto, CA"
                              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          {/* Date inputs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Issue Date</label>
                              <input
                                type="date"
                                required
                                value={invoiceForm.date}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 mb-1.5">Due Date</label>
                              <input
                                type="date"
                                required
                                value={invoiceForm.dueDate}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                              />
                            </div>
                          </div>

                          {/* Line items dynamic ledger block */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                Line Items
                              </label>
                              <button
                                type="button"
                                onClick={handleAddItemRow}
                                className="flex items-center gap-1 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] font-bold transition text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Row
                              </button>
                            </div>

                            <div className="space-y-3.5">
                              {invoiceForm.items.map((item, index) => (
                                <div key={index} className="p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/10 space-y-3">
                                  
                                  {/* Predefined Item dropdown selector */}
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-400">Row {index + 1}:</span>
                                    <select
                                      onChange={(e) => handleSelectPredefinedItem(index, e.target.value)}
                                      defaultValue=""
                                      className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[10px] focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-white font-semibold"
                                    >
                                      <option value="" disabled>--- Select Predefined Product Catalog to Auto-Fill ---</option>
                                      {items.map(itm => (
                                        <option key={itm.id} value={itm.id}>{itm.name} (₹{itm.rate.toLocaleString('en-IN')})</option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Direct input line fields */}
                                  <div className="grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-12 sm:col-span-5">
                                      <input
                                        type="text"
                                        required
                                        value={item.desc}
                                        onChange={(e) => handleItemChange(index, 'desc', e.target.value)}
                                        placeholder="Service or product description detail"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                      />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                      <input
                                        type="number"
                                        min="1"
                                        required
                                        value={item.qty}
                                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                        placeholder="Qty"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-center focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                      />
                                    </div>
                                    <div className="col-span-5 sm:col-span-3">
                                      <input
                                        type="number"
                                        min="0"
                                        required
                                        value={item.rate || ''}
                                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                        placeholder="Rate (₹)"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono"
                                      />
                                    </div>
                                    <div className="col-span-3 sm:col-span-2 text-right">
                                      <button
                                        type="button"
                                        disabled={invoiceForm.items.length <= 1}
                                        onClick={() => handleRemoveItemRow(index)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition disabled:opacity-40"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => {
                                window.print()
                              }}
                              className="rounded-xl border border-slate-350 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 px-5 py-2.5 text-xs font-bold transition text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                            >
                              <Printer className="w-4 h-4" /> Print Setup
                            </button>
                            <button
                              type="submit"
                              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold transition shadow-lg shadow-indigo-500/10"
                            >
                              Register & Issue Invoice
                            </button>
                          </div>

                        </form>
                      </div>

                      {/* Right: Real-Time Live PDF Invoice Preview Canvas */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 relative">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-indigo-650" />
                            <span>Real-time PDF Canvas</span>
                          </h4>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-widest animate-pulse">
                            A4 Visual Mock
                          </span>
                        </div>

                        {/* Visual A4 paper sheet container */}
                        <div className="w-full bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-inner overflow-hidden font-sans">
                          
                          {/* Inner Visual Sheet with custom Template styling */}
                          <div className={`p-6 bg-white text-slate-900 shadow-lg rounded-lg border min-h-[500px] text-left flex flex-col justify-between ${
                            invoiceTemplate === 'sleek_indigo' ? 'border-indigo-600/30' :
                            invoiceTemplate === 'emerald_pro' ? 'border-emerald-600/30' :
                            invoiceTemplate === 'gold_luxury' ? 'border-amber-600/30' :
                            'border-slate-300'
                          }`}>
                            
                            <div>
                              {/* Invoice branding header */}
                              <div className="flex justify-between items-start gap-4 mb-6">
                                <div>
                                  <h2 className={`text-lg font-bold tracking-tight uppercase ${
                                    invoiceTemplate === 'sleek_indigo' ? 'text-indigo-750' :
                                    invoiceTemplate === 'emerald_pro' ? 'text-emerald-700' :
                                    invoiceTemplate === 'gold_luxury' ? 'text-amber-700' :
                                    'text-slate-800'
                                  }`}>Shnoor Workspace</h2>
                                  <p className="text-[8px] text-slate-450 uppercase tracking-widest font-semibold">Smart Invoice Platform</p>
                                  <p className="text-[8px] text-slate-450 mt-1 max-w-[180px]">Level 8, Shnoor Tech Park, Phase 1, Bangalore, IN</p>
                                </div>
                                <div className="text-right">
                                  <h3 className="text-xl font-bold uppercase tracking-wide text-slate-450">INVOICE</h3>
                                  <p className="text-[9px] text-slate-450 font-mono mt-1">#INV-2026-TBD</p>
                                </div>
                              </div>

                              {/* Billing details block */}
                              <div className="grid grid-cols-2 gap-4 mb-6 border-t border-b border-slate-100 py-3">
                                <div>
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Bill To:</span>
                                  <h5 className="font-bold text-xs mt-1 text-slate-800">{invoiceForm.clientName || '--- Client Enterprise Name ---'}</h5>
                                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{invoiceForm.clientEmail || '--- Client Email ---'}</p>
                                  <p className="text-[8px] text-slate-450 mt-1 leading-relaxed max-w-[160px]">
                                    {invoiceForm.clientAddress || '--- Client Address Details ---'}
                                  </p>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className="text-[8px]">
                                    <span className="font-semibold text-slate-400 uppercase mr-1">Date Issued:</span>
                                    <span className="font-mono font-semibold text-slate-700">{invoiceForm.date}</span>
                                  </div>
                                  <div className="text-[8px]">
                                    <span className="font-semibold text-slate-400 uppercase mr-1">Due Date:</span>
                                    <span className="font-mono font-semibold text-slate-750">{invoiceForm.dueDate}</span>
                                  </div>
                                  <div className="text-[8px]">
                                    <span className="font-semibold text-slate-400 uppercase mr-1">Currency:</span>
                                    <span className="font-bold text-slate-750">INR (₹)</span>
                                  </div>
                                </div>
                              </div>

                              {/* Items Table layout */}
                              <div className="mb-6">
                                <table className="w-full text-[9px] text-left">
                                  <thead>
                                    <tr className={`text-[8px] uppercase font-bold text-white border-b ${
                                      invoiceTemplate === 'sleek_indigo' ? 'bg-indigo-900 border-indigo-750' :
                                      invoiceTemplate === 'emerald_pro' ? 'bg-emerald-900 border-emerald-700' :
                                      invoiceTemplate === 'gold_luxury' ? 'bg-amber-900 border-amber-700' :
                                      'bg-slate-800 border-slate-900'
                                    }`}>
                                      <th className="py-1.5 px-2 rounded-l">Description</th>
                                      <th className="py-1.5 px-2 text-center">Qty</th>
                                      <th className="py-1.5 px-2 text-right">Price</th>
                                      <th className="py-1.5 px-2 text-right">GST %</th>
                                      <th className="py-1.5 px-2 text-right rounded-r">Line Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {invoiceForm.items.map((itm, i) => {
                                      const lineTotal = itm.qty * itm.rate
                                      return (
                                        <tr key={i} className="hover:bg-slate-50/50">
                                          <td className="py-2.5 px-2 font-medium text-slate-800 leading-tight max-w-[150px] truncate">{itm.desc || '--- Product description ---'}</td>
                                          <td className="py-2.5 px-2 text-center text-slate-650">{itm.qty}</td>
                                          <td className="py-2.5 px-2 text-right font-mono text-slate-650">₹{itm.rate.toLocaleString('en-IN')}</td>
                                          <td className="py-2.5 px-2 text-right font-mono text-slate-650">{itm.tax}%</td>
                                          <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-800">₹{lineTotal.toLocaleString('en-IN')}</td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Summary Totals Calculation */}
                            <div className="flex flex-col items-end space-y-1.5 border-t border-slate-100 pt-4">
                              <div className="text-[9px] text-slate-500">
                                Subtotal: <span className="font-mono text-slate-850 font-semibold ml-2">₹{
                                  invoiceForm.items.reduce((acc, curr) => acc + (curr.qty * curr.rate), 0).toLocaleString('en-IN')
                                }</span>
                              </div>
                              <div className="text-[9px] text-slate-500">
                                GST Taxes (18% Avg): <span className="font-mono text-slate-850 font-semibold ml-2">₹{
                                  Math.round(invoiceForm.items.reduce((acc, curr) => acc + (curr.qty * curr.rate * (curr.tax / 100)), 0)).toLocaleString('en-IN')
                                }</span>
                              </div>
                              <div className={`text-xs font-bold border-t border-slate-150 pt-2 w-full max-w-[200px] text-right flex justify-between items-center ${
                                invoiceTemplate === 'sleek_indigo' ? 'text-indigo-750' :
                                invoiceTemplate === 'emerald_pro' ? 'text-emerald-700' :
                                invoiceTemplate === 'gold_luxury' ? 'text-amber-700' :
                                'text-slate-850'
                              }`}>
                                <span>Total Amount:</span>
                                <span className="font-mono font-bold">₹{
                                  Math.round(calculateInvoiceTotal(invoiceForm)).toLocaleString('en-IN')
                                }</span>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                )}

                {/* 5. INVOICES LEDGER / LIST */}
                {activeTab === 'invoices' && (
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
                                    className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 transition"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setViewingInvoice(inv)
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[9px] font-bold text-slate-700 dark:text-slate-300 transition"
                                >
                                  View
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
                )}

                {/* 6. EXPENSES LEDGER */}
                {activeTab === 'expenses' && (
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
              )}

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
                                  {u.role === 'admin' ? 'Super Admin' : 'Standard User'}
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

                {/* 10. SECURITY LIVE AUDIT LOGS CONSOLE */}
                {activeTab === 'admin_logs' && isAuthorized && (
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
                )}

                {/* 11. ADMIN CORE WORKSPACE SETTINGS */}
                {activeTab === 'admin_settings' && isAuthorized && (
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
                )}

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

              {/* Totals Section */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">₹{(viewingInvoice.amount / 1.18).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">GST (18% Included)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">₹{(viewingInvoice.amount - (viewingInvoice.amount / 1.18)).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-indigo-650 dark:text-indigo-400 border-t border-dashed border-slate-200 dark:border-slate-850 pt-2.5">
                    <span>Grand Total</span>
                    <span className="font-mono text-base">₹{viewingInvoice.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-7 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3">
              <button
                onClick={() => handlePrintSelectedInvoice(viewingInvoice)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-indigo-500/10 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print & Save PDF</span>
              </button>

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
