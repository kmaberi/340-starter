// scripts/find-undefined-handles.js
const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(name => {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) return walk(full, callback);
    if (full.endsWith('.js')) callback(full);
  });
}

const re = /handleErrors\s*\(\s*([a-zA-Z0-9_$.]+)/g;
const root = process.cwd();
const occurrences = [];

walk(root, file => {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = re.exec(text))) {
    occurrences.push({ file, snippet: m[1] });
  }
});

console.log('Found handleErrors uses:', occurrences.length);
occurrences.forEach(o => {
  console.log('\nFile:', o.file);
  console.log('Passed:', o.snippet);
  // attempt to require the left part if it's module.member format
  const parts = o.snippet.split('.');
  if (parts.length === 2) {
    try {
      // try require the module: map common names to real paths if needed
      const varName = parts[0];
      // naive mapping guess: route files often define "const X = require('../controllers/x')"
      // so we can't reliably resolve automatically; just print note for manual inspect
      console.log(' -> Manual check required: open the file and verify that', parts.join('.'), 'is defined');
    } catch (err) {
      console.log(' -> require attempt failed (manual inspection needed).');
    }
  } else {
    console.log(' -> Complex expression; open file to inspect');
  }
});
