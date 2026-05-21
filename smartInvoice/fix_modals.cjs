const fs = require('fs');

function fixModal(file) {
  let text = fs.readFileSync(file, 'utf-8');
  
  const marker = "              {/* Totals Section */}";
  const index = text.indexOf(marker);
  
  if (index !== -1) {
    const start = text.substring(0, index);
    const endBlock = `              {/* Totals Section */}
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
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrintSelectedInvoice(viewingInvoice)}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 px-5 py-2.5 text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => handleDownloadPDF(viewingInvoice)}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-indigo-500/10 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>

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
`;
    
    fs.writeFileSync(file, start + endBlock);
    console.log('Fixed ' + file);
  } else {
    console.log('Could not find Totals Section in ' + file);
  }
}

fixModal('src/components/Dashboard/User/UserDashboard.jsx');
fixModal('src/components/Dashboard/Admin/AdminDashboard.jsx');
