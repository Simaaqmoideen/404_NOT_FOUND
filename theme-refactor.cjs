const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

const replacements = [
  { search: /bg-surface-900/g, replace: 'bg-[var(--color-bg-base)]' },
  { search: /bg-surface-800/g, replace: 'bg-[var(--color-bg-surface)]' },
  { search: /bg-surface-700/g, replace: 'bg-[var(--color-bg-surface-hover)]' },
  { search: /bg-surface-600/g, replace: 'bg-[var(--color-border-strong)]' },
  { search: /text-white/g, replace: 'text-[var(--color-text-primary)]' },
  { search: /text-slate-400/g, replace: 'text-[var(--color-text-secondary)]' },
  { search: /text-slate-500/g, replace: 'text-[var(--color-text-secondary)]' },
  { search: /border-white\/[0-9]+/g, replace: 'border-[var(--color-border-subtle)]' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      for (const r of replacements) {
        content = content.replace(r.search, r.replace);
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDirectory(directory);
console.log('Done.');
