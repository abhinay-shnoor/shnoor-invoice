import AdminDashboard from './Admin/AdminDashboard';
import UserDashboard from './User/UserDashboard';
import OverviewTab from './features/OverviewTab';
import ClientsTab from './features/ClientsTab';
import ProductsTab from './features/ProductsTab';
import CreateInvoiceTab from './features/CreateInvoiceTab';
import InvoicesLedgerTab from './features/InvoicesLedgerTab';
import ExpensesTab from './features/ExpensesTab';
import AdminSettingsTab from './features/AdminSettingsTab';
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
          items: inv.items || [],
          amount_paid: inv.amount_paid || 0,
          payments: inv.payments || [],
          logs: inv.logs || []
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

  // --- Real-time invoice formulation state ---
  const [invoiceForm, setInvoiceForm] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ desc: '', qty: 1, rate: 0, tax: 18 }]
  })
  
  const [isEditingInvoice, setIsEditingInvoice] = useState(false)

  const handleEditInvoice = (id) => {
    const inv = invoices.find(i => i.id === id)
    if (!inv) return
    
    setInvoiceForm({
      id: inv.id,
      dbId: inv.dbId,
      clientName: inv.clientName,
      clientEmail: inv.clientEmail,
      clientAddress: inv.clientAddress,
      date: inv.date,
      dueDate: inv.dueDate,
      items: inv.items.length > 0 ? inv.items : [{ desc: '', qty: 1, rate: 0, tax: 18 }]
    })
    setIsEditingInvoice(true)
    setActiveTab('generator')
  }

  const handleCancelEditInvoice = () => {
    setIsEditingInvoice(false)
    setInvoiceForm({
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ desc: '', qty: 1, rate: 0, tax: 18 }]
    })
  }

  // Expense formulation state
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'Software & APIs',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    vendor: '',
    paymentMethod: '',
    notes: '',
    status: 'Pending'
  })
  
  const [isEditingExpense, setIsEditingExpense] = useState(false)
  
  const handleEditExpense = (id) => {
    const exp = expenses.find(e => e.id === id)
    if (!exp) return
    setExpenseForm({
      id: exp.id,
      title: exp.title,
      category: exp.category || 'Software & APIs',
      date: exp.date,
      amount: exp.amount,
      vendor: exp.vendor || '',
      paymentMethod: exp.payment_method || '',
      notes: exp.notes || '',
      status: exp.status || 'Pending'
    })
    setIsEditingExpense(true)
  }
  
  const handleCancelEditExpense = () => {
    setIsEditingExpense(false)
    setExpenseForm({
      title: '',
      category: 'Software & APIs',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      vendor: '',
      paymentMethod: '',
      notes: '',
      status: 'Pending'
    })
  }

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
    const level = type === 'error' ? 'error' : type === 'success' ? 'info' : 'log'
    console[level](`[${new Date().toISOString()}] ${type.toUpperCase()}: ${event}`)
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
      date: invoiceForm.date,
      due_date: invoiceForm.dueDate,
      subtotal: subtotal,
      tax_rate: 18.0,
      tax_amount: taxAmount,
      total: grandTotal,
      notes: '',
      items: invoiceForm.items
    }

    try {
      if (isEditingInvoice) {
        // Editing existing invoice
        const response = await client.put(`/invoices/${invoiceForm.dbId}`, payload)
        const inv = response.data
        const updatedInvoice = {
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
        setInvoices(invoices.map(i => i.id === updatedInvoice.id ? updatedInvoice : i))
        addLog(`Invoice ${updatedInvoice.id} updated successfully`, 'success')
        setIsEditingInvoice(false)
      } else {
        // Creating new invoice
        payload.invoice_number = `INV-2026-00${invoices.length + 1}`
        payload.status = 'Pending'
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
      }

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
      console.error("Failed to save invoice:", err)
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

    const payload = {
      title: expenseForm.title,
      category: expenseForm.category,
      date: expenseForm.date,
      amount: parseFloat(expenseForm.amount),
      vendor: expenseForm.vendor,
      payment_method: expenseForm.paymentMethod,
      notes: expenseForm.notes,
      status: expenseForm.status
    }

    try {
      if (isEditingExpense) {
        const response = await client.put(`/expenses/${expenseForm.id}`, payload)
        setExpenses(expenses.map(exp => exp.id === expenseForm.id ? response.data : exp))
        addLog(`Expense updated: ${response.data.title}`, 'success')
        setIsEditingExpense(false)
      } else {
        const response = await client.post('/expenses/', payload)
        setExpenses([response.data, ...expenses])
        addLog(`Expense recorded: ${response.data.title} (₹${response.data.amount.toLocaleString('en-IN')})`, 'info')
      }
      
      setExpenseForm({
        title: '',
        category: 'Software & APIs',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        vendor: '',
        paymentMethod: '',
        notes: '',
        status: 'Pending'
      })
    } catch (err) {
      console.error("Failed to save expense:", err)
      alert("Failed to save expense to backend.")
    }
  }

  const handleDeleteExpense = async (id) => {
    try {
      await client.delete(`/expenses/${id}`)
      setExpenses(expenses.filter(exp => exp.id !== id))
      addLog(`Expense ${id} permanently deleted`, 'info')
    } catch (err) {
      console.error("Failed to delete expense:", err)
      alert("Failed to delete expense from backend.")
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

  
  // Dynamic PDF Downloader using html2pdf.js
  const handleDownloadPDF = async (invoice) => {
    const itemsHtml = (invoice.items && invoice.items.length > 0 ? invoice.items : [{ desc: 'Standard Supply Items', qty: 1, rate: invoice.amount }]).map(itm => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 14px 0; font-size: 13px; color: #334155; font-weight: 550;">${itm.desc}</td>
        <td style="padding: 14px 0; font-size: 13px; color: #475569; text-align: center;">${itm.qty}</td>
        <td style="padding: 14px 0; font-size: 13px; color: #475569; text-align: right; font-family: monospace;">₹${(itm.rate || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 14px 0; font-size: 13px; color: #1e293b; text-align: right; font-family: monospace; font-weight: bold;">₹${((itm.qty * itm.rate) || 0).toLocaleString('en-IN')}</td>
      </tr>
    `).join('')

    const htmlString = `
      <div style="font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background-color: #ffffff; width: 750px; box-sizing: border-box;">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        </style>
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 28px; margin-bottom: 28px;">
          <div>
            <div style="font-weight: 800; font-size: 22px; color: #4f46e5; letter-spacing: -0.02em;">Shnoor Invoice</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500;">Smart Invoicing Solution</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; font-size: 26px; letter-spacing: -0.02em; color: #0f172a;">INVOICE</div>
            <div style="font-size: 15px; font-weight: 700; color: #4f46e5; margin-top: 4px; font-family: monospace;">${invoice.id}</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 32px; margin-bottom: 40px;">
          <div>
            <div style="font-size: 10px; font-weight: 750; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; margin-bottom: 6px;">Billed To</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${invoice.clientName}</div>
            <div style="font-size: 13px; color: #475569; margin-top: 2px; font-weight: 500;">${invoice.clientEmail}</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 2px; font-weight: 500;">${invoice.clientAddress || ''}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; font-weight: 750; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; margin-bottom: 6px;">Invoice Details</div>
            <div style="margin-bottom: 14px;">
              <span style="display: inline-block; padding: 6px 12px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${invoice.status === 'Paid' ? '#ecfdf5' : '#fffbeb'}; color: ${invoice.status === 'Paid' ? '#047857' : '#b45309'};">${invoice.status}</span>
            </div>
            <div style="font-size: 13px; color: #475569; font-weight: 500;"><strong>Issued:</strong> ${invoice.date}</div>
            <div style="font-size: 13px; color: #475569; margin-top: 4px; font-weight: 500;"><strong>Due Date:</strong> ${invoice.dueDate || invoice.due_date || ''}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <thead>
            <tr style="border-bottom: 2px solid #f1f5f9;">
              <th style="text-align: left; padding-bottom: 12px; color: #475569; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Description</th>
              <th style="text-align: center; width: 80px; padding-bottom: 12px; color: #475569; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
              <th style="text-align: right; width: 120px; padding-bottom: 12px; color: #475569; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Rate</th>
              <th style="text-align: right; width: 120px; padding-bottom: 12px; color: #475569; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-left: auto; width: 300px; margin-top: 28px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px;">
            <span style="color: #64748b; font-weight: 500;">Subtotal</span>
            <span style="font-family: monospace; font-weight: 600; color: #334155;">₹${(invoice.amount / 1.18).toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px;">
            <span style="color: #64748b; font-weight: 500;">GST (18% Included)</span>
            <span style="font-family: monospace; font-weight: 600; color: #334155;">₹${(invoice.amount - (invoice.amount / 1.18)).toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 14px 0; font-size: 18px; font-weight: 800; border-top: 2px solid #4f46e5; color: #4f46e5;">
            <span>Grand Total</span>
            <span style="font-family: monospace;">₹${invoice.amount.toLocaleString('en-IN')}</span>
          </div>
        </div>
        
        <div style="margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 500;">
          Thank you for your business! If you have any questions regarding this invoice, please contact support.
        </div>
      </div>
    `

    try {
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      const opt = {
        margin:       10,
        filename:     invoice.isDraft ? 'Invoice-Draft.pdf' : `Invoice-${invoice.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      await window.html2pdf().set(opt).from(htmlString).save()
      addLog(`Downloaded PDF copy of invoice ${invoice.id || 'draft'}`, 'info')
    } catch (err) {
      console.error("PDF download failed:", err)
      alert("Failed to generate PDF. Falling back to print setup.")
      handlePrintSelectedInvoice(invoice)
    }
  }

  // Invoice Draft Preview Helper
  const handlePreviewInvoice = () => {
    const grandTotal = calculateInvoiceTotal(invoiceForm)
    const tempInvoice = {
      id: 'INV-DRAFT',
      clientName: invoiceForm.clientName || '--- Client Enterprise Name ---',
      clientEmail: invoiceForm.clientEmail || '--- Client Email ---',
      clientAddress: invoiceForm.clientAddress || '--- Client Address Details ---',
      date: invoiceForm.date || new Date().toISOString().split('T')[0],
      dueDate: invoiceForm.dueDate || new Date().toISOString().split('T')[0],
      items: invoiceForm.items,
      amount: grandTotal,
      status: 'Draft',
      isDraft: true
    }
    setViewingInvoice(tempInvoice)
  }

  const sharedProps = { user, onLogout, adminEmail, setAdminEmail, currentRole, setCurrentRole, activeTab, setActiveTab, viewingInvoice, setViewingInvoice, invoiceTemplate, setInvoiceTemplate, invoices, setInvoices, expenses, setExpenses, clients, setClients, items, setItems, users, setUsers, invoiceForm, setInvoiceForm, expenseForm, setExpenseForm, clientForm, setClientForm, itemForm, setItemForm, selectedProduct, setSelectedProduct, addLog, fetchUsers, fetchData, totalInvoiced, paidInvoiced, outstandingInvoiced, totalGST, invoiceSearch, setInvoiceSearch, expenseSearch, setExpenseSearch, clientSearch, setClientSearch, itemSearch, setItemSearch, handleAddItemRow, handleRemoveItemRow, handleItemChange, handleSelectPredefinedItem, handleSelectPredefinedClient, calculateInvoiceTotal, handleCreateInvoice, handleUpdateStatus, handleDeleteInvoice, handleCreateExpense, handleDeleteExpense, handleEditExpense, handleCancelEditExpense, isEditingExpense, handleCreateClient, handleDeleteClient, handleCreateItem, handleDeleteItem, toggleUserRole, handleAddUser, handlePrintSelectedInvoice, handleDownloadPDF, handlePreviewInvoice, handleDeleteUser, filteredInvoices, filteredExpenses, filteredClients, filteredItems, isAuthorized, isAdminTab, shouldRenderAccessDenied, isEditingInvoice, handleEditInvoice, handleCancelEditInvoice };

  if (currentRole === 'admin') {
    return <AdminDashboard {...sharedProps} />;
  }
  return <UserDashboard {...sharedProps} />;
}
