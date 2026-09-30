const fs = require('fs');

function findMatches(dir) {
  let list = [];
  function walk(d) {
    if (!fs.existsSync(d)) return;
    fs.readdirSync(d).forEach(f => {
      const p = d + '/' + f;
      try {
        const s = fs.statSync(p);
        if (s.isDirectory()) {
          if (f !== 'node_modules' && f !== '.git') walk(p);
        } else if (/\.(ts|tsx|js|json)$/.test(f)) {
          const content = fs.readFileSync(p, 'utf8');
          const keywords = [
            'CollectionReport',
            'StudentLedgerReport',
            'InvoiceReceiptSummaryReport',
            'AverageFeeReport',
            'DefaulterListReport',
            'DefaulterSummaryReport',
            'DefaulterReport',
            'student-ledger',
            'defaulter-list',
            'defaulter-summary'
          ];
          keywords.forEach(kw => {
            if (content.toLowerCase().includes(kw.toLowerCase())) {
              list.push({ file: p, keyword: kw });
            }
          });
        }
      } catch (e) {}
    });
  }
  walk(dir);
  return list;
}

const matches = findMatches('D:/smart-edu-projects/campus-manager/src');
console.log(JSON.stringify(matches, null, 2));
