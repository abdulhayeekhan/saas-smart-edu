const fs = require('fs');

const filesToInspect = [
  'D:/smart-edu-projects/campus-manager/src/feature-module/accounts/reports/collection-report.tsx',
  'D:/smart-edu-projects/campus-manager/src/feature-module/peoples/students/student-details/studentLedger.tsx',
  'D:/smart-edu-projects/campus-manager/src/feature-module/report/invoice-receipt-summary-report/invoiceReceiptSummaryReport.tsx',
  'D:/smart-edu-projects/campus-manager/src/feature-module/report/average-fee-report/averageFeeReport.tsx',
  'D:/smart-edu-projects/campus-manager/src/feature-module/report/defaulter-report/index.tsx',
  'D:/smart-edu-projects/campus-manager/src/feature-module/report/index.tsx',
  'D:/smart-edu-projects/campus-manager/src/feature-module/router/router.link.tsx',
  'D:/smart-edu-projects/campus-manager/src/store/apps/academic-reports/index.ts'
];

let output = '';
filesToInspect.forEach(f => {
  output += `\n\n==================== FILE: ${f} ====================\n\n`;
  if (fs.existsSync(f)) {
    output += fs.readFileSync(f, 'utf8');
  } else {
    output += 'FILE NOT FOUND!';
  }
});

fs.writeFileSync('scripts/dump.txt', output, 'utf8');
console.log('Done writing dump.txt');
