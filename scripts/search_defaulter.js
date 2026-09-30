const fs = require('fs');

function searchAll(dir, term) {
  let res = [];
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
          if (content.toLowerCase().includes(term.toLowerCase())) {
            res.push({ file: p, match: content.substr(content.toLowerCase().indexOf(term.toLowerCase()) - 50, 150) });
          }
        }
      } catch (e) {}
    });
  }
  walk(dir);
  return res;
}

console.log("=== Defaulter in campus-manager ===");
console.log(searchAll('D:/smart-edu-projects/campus-manager/src', 'defaulter'));
