/**
 * Node 22+ removed `buffer.SlowBuffer`. The unmaintained
 * `buffer-equal-constant-time` (jwt → jws → jwa) still reads it and crashes.
 * Re-apply this patch after every npm install.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'buffer-equal-constant-time',
  'index.js',
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

const source = fs.readFileSync(target, 'utf8');
const needle = "var SlowBuffer = require('buffer').SlowBuffer;";
const replacement =
  "var SlowBuffer = require('buffer').SlowBuffer || Buffer; // Node 22+ SlowBuffer removed";

if (source.includes(needle) && !source.includes('SlowBuffer || Buffer')) {
  fs.writeFileSync(target, source.replace(needle, replacement), 'utf8');
  console.log('[postinstall] patched buffer-equal-constant-time for Node 22+');
}
