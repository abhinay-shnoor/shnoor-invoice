const fs = require('fs');
let text = fs.readFileSync('src/components/Dashboard/Dashboard.jsx', 'utf-8');

// Insert imports at the top
const imports = `import AdminDashboard from './Admin/AdminDashboard';
import UserDashboard from './User/UserDashboard';
import OverviewTab from './features/OverviewTab';
import ClientsTab from './features/ClientsTab';
import ProductsTab from './features/ProductsTab';
import CreateInvoiceTab from './features/CreateInvoiceTab';
import InvoicesLedgerTab from './features/InvoicesLedgerTab';
import ExpensesTab from './features/ExpensesTab';
import AuditLogsTab from './features/AuditLogsTab';
import AdminSettingsTab from './features/AdminSettingsTab';`;

text = imports + '\n' + text;

// Make handleCreateInvoice take optional e
text = text.replace(/const handleCreateInvoice = async \(e\) => \{\n    e\.preventDefault\(\)/, 'const handleCreateInvoice = async (e) => {\n    if (e) e.preventDefault()');

// Replace the entire return statement block with our sharedProps and component returns
const returnStart = text.indexOf('return (\n    <div className="flex h-screen bg-slate-50 text-slate-900');
if (returnStart !== -1) {
  text = text.substring(0, returnStart);
}

// Add the new methods and shared props
const additions = `
  // Dynamic PDF Downloader using html2pdf.js
  const handleDownloadPDF = async (invoice) => {
    const itemsHtml = (invoice.items && invoice.items.length > 0 ? invoice.items : [{ desc: 'Standard Supply Items', qty: 1, rate: invoice.amount }]).map(itm => \`
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 14px 0; font-size: 13px; color: #334155; font-weight: 550;">\${itm.desc}</td>
        <td style="padding: 14px 0; font-size: 13px; color: #475569; text-align: center;">\${itm.qty}</td>
        <td style="padding: 14px 0; font-size: 13px; color: #475569; text-align: right; font-family: monospace;">₹\${(itm.rate || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 14px 0; font-size: 13px; color: #1e293b; text-align: right; font-family: monospace; font-weight: bold;">₹\${((itm.qty * itm.rate) || 0).toLocaleString('en-IN')}</td>
      </tr>
    \`).join('')

    const htmlString = \`
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
            <div style="font-size: 15px; font-weight: 700; color: #4f46e5; margin-top: 4px; font-family: monospace;">\${invoice.id}</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 32px; margin-bottom: 40px;">
          <div>
            <div style="font-size: 10px; font-weight: 750; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; margin-bottom: 6px;">Billed To</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">\${invoice.clientName}</div>
            <div style="font-size: 13px; color: #475569; margin-top: 2px; font-weight: 500;">\${invoice.clientEmail}</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 2px; font-weight: 500;">\${invoice.clientAddress || ''}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; font-weight: 750; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; margin-bottom: 6px;">Invoice Details</div>
            <div style="margin-bottom: 14px;">
              <span style="display: inline-block; padding: 6px 12px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background-color: \${invoice.status === 'Paid' ? '#ecfdf5' : '#fffbeb'}; color: \${invoice.status === 'Paid' ? '#047857' : '#b45309'};">\${invoice.status}</span>
            </div>
            <div style="font-size: 13px; color: #475569; font-weight: 500;"><strong>Issued:</strong> \${invoice.date}</div>
            <div style="font-size: 13px; color: #475569; margin-top: 4px; font-weight: 500;"><strong>Due Date:</strong> \${invoice.dueDate || invoice.due_date || ''}</div>
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
            \${itemsHtml}
          </tbody>
        </table>

        <div style="margin-left: auto; width: 300px; margin-top: 28px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px;">
            <span style="color: #64748b; font-weight: 500;">Subtotal</span>
            <span style="font-family: monospace; font-weight: 600; color: #334155;">₹\${(invoice.amount / 1.18).toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px;">
            <span style="color: #64748b; font-weight: 500;">GST (18% Included)</span>
            <span style="font-family: monospace; font-weight: 600; color: #334155;">₹\${(invoice.amount - (invoice.amount / 1.18)).toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 14px 0; font-size: 18px; font-weight: 800; border-top: 2px solid #4f46e5; color: #4f46e5;">
            <span>Grand Total</span>
            <span style="font-family: monospace;">₹\${invoice.amount.toLocaleString('en-IN')}</span>
          </div>
        </div>
        
        <div style="margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 500;">
          Thank you for your business! If you have any questions regarding this invoice, please contact support.
        </div>
      </div>
    \`

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
        filename:     invoice.isDraft ? 'Invoice-Draft.pdf' : \`Invoice-\${invoice.id}.pdf\`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      await window.html2pdf().set(opt).from(htmlString).save()
      addLog(\`Downloaded PDF copy of invoice \${invoice.id || 'draft'}\`, 'info')
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

  const sharedProps = { user, onLogout, adminEmail, setAdminEmail, currentRole, setCurrentRole, activeTab, setActiveTab, viewingInvoice, setViewingInvoice, invoiceTemplate, setInvoiceTemplate, invoices, setInvoices, expenses, setExpenses, clients, setClients, items, setItems, users, setUsers, auditLogs, setAuditLogs, invoiceForm, setInvoiceForm, expenseForm, setExpenseForm, clientForm, setClientForm, itemForm, setItemForm, selectedProduct, setSelectedProduct, addLog, fetchUsers, fetchData, totalInvoiced, paidInvoiced, outstandingInvoiced, totalGST, invoiceSearch, setInvoiceSearch, expenseSearch, setExpenseSearch, clientSearch, setClientSearch, itemSearch, setItemSearch, handleAddItemRow, handleRemoveItemRow, handleItemChange, handleSelectPredefinedItem, handleSelectPredefinedClient, calculateInvoiceTotal, handleCreateInvoice, handleUpdateStatus, handleDeleteInvoice, handleCreateExpense, handleCreateClient, handleDeleteClient, handleCreateItem, handleDeleteItem, toggleUserRole, handleAddUser, handlePrintSelectedInvoice, handleDownloadPDF, handlePreviewInvoice, handleDeleteUser, filteredInvoices, filteredExpenses, filteredClients, filteredItems, isAuthorized, isAdminTab, shouldRenderAccessDenied };

  if (currentRole === 'admin') {
    return <AdminDashboard {...sharedProps} />;
  }
  return <UserDashboard {...sharedProps} />;
}
`;

text = text + additions;
fs.writeFileSync('src/components/Dashboard/Dashboard.jsx', text);
console.log('Restored Dashboard.jsx');
