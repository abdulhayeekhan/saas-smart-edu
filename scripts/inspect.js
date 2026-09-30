const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else {
        results.push(fullPath);
      }
    } catch (e) {}
  });
  return results;
}

console.log('--- CAMPUS MANAGER REPORT FILES ---');
walk('D:/smart-edu-projects/campus-manager/src/feature-module/report').forEach(f => console.log(f));
console.log('--- CAMPUS MANAGER STORE APPS ---');
walk('D:/smart-edu-projects/campus-manager/src/store/apps').forEach(f => console.log(f));
console.log('--- CAMPUS MANAGER ACCOUNTS REPORTS ---');
walk('D:/smart-edu-projects/campus-manager/src/feature-module/accounts').forEach(f => {
  if (f.toLowerCase().includes('report') || f.toLowerCase().includes('ledger')) console.log(f);
});
