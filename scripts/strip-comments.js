const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = ['node_modules', '.git', 'dist'];
const TARGET_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.module.css', '.html', '.md', '.env', '.env.example', '.scss'];

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!IGNORED_DIRS.includes(file)) {
        results.push(...walk(filePath));
      }
    } else {
      results.push(filePath);
    }
  });
  return results;
}

function removeComments(text, ext) {
  // aggressive removals: block comments, html comments, line comments, hash comments
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  text = text.replace(/<!--([\s\S]*?)-->/g, '');
  text = text.replace(/^\s*#.*$/gm, '');
  text = text.replace(/\/\/.*$/gm, '');
  // normalize multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n');
  // Trim trailing whitespace on each line
  text = text.split('\n').map(l => l.replace(/[ \t]+$/,'')).join('\n');
  return text;
}

function shouldProcess(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (TARGET_EXTS.includes(ext)) return true;
  // also process files without extension named .env or .env.example
  const base = path.basename(filePath);
  if (base === '.env' || base === '.env.example') return true;
  return false;
}

const root = path.resolve(__dirname, '..');
const files = walk(root);
let changed = 0;
files.forEach(file => {
  if (!shouldProcess(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  const newContent = removeComments(content, path.extname(file));
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    changed++;
    console.log('Stripped comments:', path.relative(root, file));
  }
});
console.log(`Done. Files changed: ${changed}`);
