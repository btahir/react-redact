import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '..');
const temporary = mkdtempSync(join(tmpdir(), 'redact-package-'));
function run(command, args, cwd = temporary) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, maxBuffer: 10 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
try {
  run('pnpm', ['pack', '--pack-destination', temporary], root);
  const tarball = readdirSync(temporary).find(file => file.endsWith('.tgz'));
  assert(tarball);
  const expectedVersion = JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version;
  assert.equal(tarball, `react-redact-${expectedVersion}.tgz`);
  const files = run('tar', ['-tzf', join(temporary, tarball)]);
  for (const file of ['README.md','LICENSE','CHANGELOG.md','schema/demo.schema.json','skills/react-redact/SKILL.md','scripts/cli.mjs','scripts/playwright.mjs','dist/styles/studio.css','dist/studio.js','dist/data.js']) assert(files.includes(`package/${file}`), `Missing ${file}`);
  assert(!files.includes('node_modules')); assert(!files.includes('.env'));
  writeFileSync(join(temporary, 'package.json'), JSON.stringify({name:'packed-redact-consumer',version:'1.0.0',private:true,type:'module'}));
  run('npm', ['install','--ignore-scripts','--no-audit','--no-fund','--package-lock=false',join(temporary,tarball),'react@19','react-dom@19','next@15']);
  const installed = join(temporary,'node_modules/react-redact');
  assert.equal(JSON.parse(readFileSync(join(installed,'package.json'),'utf8')).version, expectedVersion);
  assert.equal(readFileSync(join(installed,'README.md'),'utf8'),readFileSync(join(root,'README.md'),'utf8'));
  for(const entry of ['index','fields','studio']) assert(readFileSync(join(installed,`dist/${entry}.js`),'utf8').startsWith('"use client"'));
  for(const entry of ['data','diagnostics']) {const source=readFileSync(join(installed,`dist/${entry}.js`),'utf8');assert(!source.startsWith('"use client"'));assert(!/from ["']react/.test(source));}
  writeFileSync(join(temporary,'probe.mjs'), `import assert from 'node:assert/strict';
import React from 'react'; import {renderToString} from 'react-dom/server';
import {createDemoDocument,createDemoRecord} from 'react-redact/data';
import {DemoProvider,DemoField} from 'react-redact/fields';
import {RedactStudio} from 'react-redact/studio'; import {checkDemoPage} from 'react-redact/playwright';
const policy=createDemoDocument(); assert(createDemoRecord(policy)['customer.email'].endsWith('@example.com'));
const html=renderToString(React.createElement(DemoProvider,{document:policy},React.createElement(DemoField,{id:'customer.email'},'FAKE-PRIVATE-SENTINEL')));
assert(!html.includes('FAKE-PRIVATE-SENTINEL'));assert.equal(typeof RedactStudio,'function');assert.equal(typeof checkDemoPage,'function');
console.log('Packed ESM/data/SSR/editor/helper exports passed');`);
  console.log(run('node',['probe.mjs']).trim());
  console.log(run('node',['--input-type=commonjs','-e',"const assert=require('node:assert/strict');const {createDemoDocument}=require('react-redact/data');assert.equal(createDemoDocument().version,1);assert.equal(typeof require('react-redact/fields').DemoField,'function');assert.equal(typeof require('react-redact/playwright').checkDemoPage,'function');console.log('Packed CJS exports passed')"]).trim());
  const cli=join(installed,'scripts/cli.mjs');
  run('node',[cli,'init','demo.json']);
  assert.match(run('node',[cli,'validate','demo.json']), /"valid":true/);
  const fixture=JSON.parse(run('node',[cli,'fixtures','demo.json','3']));assert.equal(fixture.length,3);
  const overwrite=spawnSync('node',[cli,'init','demo.json'],{cwd:temporary,encoding:'utf8'});assert.notEqual(overwrite.status,0);
  writeFileSync(join(temporary,'invalid.json'),'{"version":999}');const invalid=spawnSync('node',[cli,'validate','invalid.json'],{cwd:temporary,encoding:'utf8'});assert.notEqual(invalid.status,0);
  console.log('Packed CLI init/validate/fixtures and refusal paths passed');
  mkdirSync(join(temporary,'app'));
  writeFileSync(join(temporary,'app/layout.js'),`export default function Layout({children}){return <html lang="en"><body>{children}</body></html>}`);
  writeFileSync(join(temporary,'app/page.js'),`import {createDemoDocument,createDemoRecord} from 'react-redact/data';import ClientDemo from './client';export default function Page(){const policy=createDemoDocument();const record=createDemoRecord(policy,'demo-1');return <main><h1>{record['customer.name']}</h1><ClientDemo initialDocument={policy}/></main>}`);
  writeFileSync(join(temporary,'app/client.js'),`'use client';import {useState} from 'react';import {DemoProvider,DemoField} from 'react-redact/fields';import {RedactStudio} from 'react-redact/studio';import 'react-redact/studio.css';export default function ClientDemo({initialDocument}){const [document,setDocument]=useState(initialDocument);return <><DemoProvider document={document}><DemoField id="customer.email"/></DemoProvider><RedactStudio document={document} onChange={setDocument}/></>}`);
  const build=run('node',[join(temporary,'node_modules/next/dist/bin/next'),'build']);
  assert.match(build,/Generating static pages/);
  const html=readFileSync(join(temporary,'.next/server/app/index.html'),'utf8');assert(html.includes('example.com'));assert(html.includes('Redact Studio'));
  console.log('Packed Next App Router RSC + client Studio production build and SSR HTML passed');
} finally { rmSync(temporary,{recursive:true,force:true}); }
