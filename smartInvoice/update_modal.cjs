const fs = require('fs');

function updateModal(file) {
  let text = fs.readFileSync(file, 'utf-8');
  
  // Let's first restore the end of UserDashboard since it got mangled.
  if (file.includes('UserDashboard')) {
    // If it's missing the ending, we'll replace everything after the totals section
    const marker = "                  <div className=\"flex justify-between items-center text-sm font-bold text-indigo-650 dark:text-indigo-400 border-t border-dashed border-slate-200 dark:border-slate-850 pt-2.5\">\n                    <span>Grand Total</span>\n                    <span className=\"font-mono text-base\">₹{viewingInvoice.amount.toLocaleString('en-IN')}</span>\n                  </div>\n                </div>";
    const markerIndex = text.indexOf(marker);
    if (markerIndex !== -1) {
      const remaining = `
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
      text = text.substring(0, markerIndex + marker.length) + remaining;
      fs.writeFileSync(file, text);
      console.log('Restored and updated ' + file);
    } else {
      console.log('Marker not found in ' + file);
    }
  } else {
    // For AdminDashboard, just replace the exact text
    const searchStr = `            {/* Modal Actions */}
            <div className="mt-7 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3">
              <button
                onClick={() => handlePrintSelectedInvoice(viewingInvoice)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-indigo-500/10 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print & Save PDF</span>
              </button>`;

    const replaceStr = `            {/* Modal Actions */}
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
              </div>`;

    if (text.includes(searchStr)) {
      text = text.replace(searchStr, replaceStr);
      fs.writeFileSync(file, text);
      console.log('Updated ' + file);
    } else {
      console.log('Could not find search string in ' + file);
    }
  }
}

updateModal('src/components/Dashboard/User/UserDashboard.jsx');
updateModal('src/components/Dashboard/Admin/AdminDashboard.jsx');
