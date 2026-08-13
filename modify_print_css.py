import os

files = [
    r"C:\Users\AQ-Khan\react\campus-manager\src\feature-module\accounts\vouchers\Journal-voucher.tsx",
    r"C:\Users\AQ-Khan\react\campus-manager\src\feature-module\accounts\vouchers\cash-receipt-voucher.tsx",
    r"C:\Users\AQ-Khan\react\campus-manager\src\feature-module\accounts\vouchers\cash-payment-voucher.tsx",
    r"C:\Users\AQ-Khan\react\campus-manager\src\feature-module\accounts\vouchers\bank-receipt-voucher.tsx",
    r"C:\Users\AQ-Khan\react\campus-manager\src\feature-module\accounts\vouchers\bank-payment-voucher.tsx"
]

old_block = '''                        <div className="modal-wrapper" id="print-area">
                            <style>{`
                                @media print {
                                    @page { size: A4; margin: 15mm; }
                                    body { background: #fff !important; -webkit-print-color-adjust: exact; }
                                    body * { visibility: hidden; color: #000 !important; }
                                    #print-area, #print-area * { visibility: visible; }
                                    #print-area { position: absolute; left: 0; top: 0; width: 100%; }
                                    .no-print { display: none !important; }
                                    .modal-dialog { max-width: 100% !important; margin: 0 !important; }
                                    .modal-content { border: none !important; box-shadow: none !important; }
                                }
                            `}</style>
                            <div className="d-flex justify-content-end mb-3 no-print">
                                <button className="btn btn-primary" onClick={() => window.print()}>
                                    <i className="ti ti-printer me-2"></i> Print / Download PDF
                                </button>
                            </div>'''

new_block = '''                        <div className="modal-wrapper" id="print-area">
                            <style>{`
                                @media print {
                                    @page { size: A4; margin: 15mm; }
                                    body { background: #fff !important; -webkit-print-color-adjust: exact; visibility: hidden; }
                                    body.modal-open { overflow: visible !important; height: auto !important; }
                                    #print-area, #print-area * { visibility: visible; color: #000 !important; }
                                    #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
                                    .modal { position: absolute !important; left: 0 !important; top: 0 !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; height: auto !important; }
                                    .modal-dialog { max-width: 100% !important; margin: 0 !important; transform: none !important; width: 100% !important; }
                                    .modal-content { border: none !important; box-shadow: none !important; background: transparent !important; }
                                    .modal-backdrop { display: none !important; }
                                    .no-print, .no-print * { display: none !important; visibility: hidden !important; }
                                    table, th, td { border: 1px solid #000 !important; }
                                    th { background-color: #000 !important; color: #fff !important; }
                                }
                            `}</style>
                            <div className="d-flex justify-content-end mb-3 no-print">
                                <button className="btn btn-primary" onClick={() => window.print()}>
                                    <i className="ti ti-printer me-2"></i> Print / Download PDF
                                </button>
                            </div>'''

count = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    if old_block in content:
        content = content.replace(old_block, new_block)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        count += 1
        print(f"Updated {f}")
    else:
        print(f"Old block not found in {f}")

print(f"Updated {count} files.")
