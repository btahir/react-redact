#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { createDemoDocument, createDemoRecord, parseDocument, serializeDocument } from '../dist/data.js';
const [command, file, ...args] = process.argv.slice(2);
try {
  if (command === 'init') {
    const output = serializeDocument(createDemoDocument());
    if (file) writeFileSync(file, output, { flag: 'wx' }); else process.stdout.write(output);
  } else if (command === 'validate') {
    if (!file) throw new Error('Provide a policy JSON file');
    const doc = parseDocument(readFileSync(file, 'utf8'));
    console.log(JSON.stringify({ valid: true, version: doc.version, fields: doc.fields.length }));
  } else if (command === 'fixtures') {
    if (!file) throw new Error('Provide a policy JSON file');
    const doc = parseDocument(readFileSync(file, 'utf8'));
    const count = Number(args[0] ?? 3);
    if (!Number.isInteger(count) || count < 1 || count > 1000) throw new Error('Count must be an integer from 1 to 1000');
    console.log(JSON.stringify(Array.from({ length: count }, (_, i) => createDemoRecord(doc, `demo-${i + 1}`)), null, 2));
  } else {
    console.log('redact init [policy.json]\nredact validate policy.json\nredact fixtures policy.json [count]\n\nLocal only. Use authored synthetic data; never export private source records.');
    if (command && command !== '--help' && command !== '-h') process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Command failed');
  process.exitCode = 1;
}
