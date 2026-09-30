const fs = require('fs');
const path = require('path');

function searchInFiles(dir, terms) {
  let results = {};
  terms.forEach(t => results[t] = []);

  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const list = fs.readdirSync(currentDir);
    list.forEach(file => {
      const fullPath = path.join(currentDir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (file !== 'node_modules' && file !== '.git') walk(fullPath);
        } else if (/\.(ts|tsx|js|jsx|json)$/.test(file)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          terms.forEach(t => {
            if (content.toLowerCase().includes(t.toLowerCase())) {
              results[t].push(fullPath);
            }
          });
        }
      } catch (e) {}
    });
  }

  walk(dir);
  return results;
}

const terms = [
  'CollectionReport',
  'StudentLedger',
  'InvoiceReceiptSummary',
  'AverageFee',
  'DefaulterList',
  'DefaulterSummary'
];

console.log(JSON.stringify(searchInFiles('D:/smart-edu-projects/campus-manager/src', terms), null, 2));
