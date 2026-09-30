const fs = require('fs');

const p = 'D:/smart-edu-projects/campus-manager/src/store/apps/financial-report/index.ts';
if (fs.existsSync(p)) {
  fs.writeFileSync('scripts/financial_report_dump.txt', fs.readFileSync(p, 'utf8'), 'utf8');
  console.log('Dumped financial-report store');
} else {
  console.log('Not found');
}
