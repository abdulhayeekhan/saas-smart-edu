const fs = require('fs');

function searchBackendEndpoints(dir) {
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
          const matches = content.match(/AcademicReport\/[a-zA-Z0-9_-]+/g);
          if (matches) {
            matches.forEach(m => list.push({ file: p, endpoint: m }));
          }
        }
      } catch (e) {}
    });
  }
  walk(dir);
  return list;
}

console.log(JSON.stringify(searchBackendEndpoints('D:/smart-edu-projects/campus-manager/src'), null, 2));
