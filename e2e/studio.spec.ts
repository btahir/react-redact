import { test, expect } from '@playwright/test';
import { createDemoDocument } from '../src/data';
// @ts-expect-error packaged helper has declarations at its exported path
import { checkDemoPage } from '../scripts/playwright.mjs';

test('synthetic identity stays consistent across routes and modal; active policy and history survive navigation', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/studio/overview');
  await page.getByLabel('Demo seed', { exact: true }).fill('browser-stable-demo');
  const name = await page.getByTestId('demo-preview').locator('[data-redact-field="customer.name"]').first().innerText();
  await page.getByRole('button', { name: 'Open demo customer 1' }).click();
  await expect(page.getByRole('dialog')).toContainText(name);
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('navigation', { name: 'Demo views' }).getByRole('link', { name: 'customers' }).click();
  await expect(page.getByLabel('Demo seed', { exact: true })).toHaveValue('browser-stable-demo');
  await expect(page.getByRole('heading', { name: 'Customer directory' })).toBeVisible();
  await expect(page.getByTestId('demo-preview').locator('[data-redact-field="customer.name"]').first()).toHaveText(name);
  await page.getByRole('navigation', { name: 'Demo views' }).getByRole('link', { name: 'invoices' }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('table')).toContainText(name);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByLabel('Demo seed', { exact: true })).toHaveValue('juniper-2026');
  expect(errors).toEqual([]);
});

test('saved draft survives reload and is restored explicitly', async ({ page }) => {
  await page.goto('/studio/overview');
  await page.getByLabel('Scenario name', { exact: true }).fill('Saved browser scenario');
  await page.getByLabel('Demo seed', { exact: true }).fill('saved-browser-seed');
  await page.reload();
  await expect(page.getByLabel('Demo seed', { exact: true })).toHaveValue('juniper-2026');
  await page.getByRole('button', { name: 'Load saved draft' }).click();
  await expect(page.getByLabel('Demo seed', { exact: true })).toHaveValue('saved-browser-seed');
  await expect(page.getByLabel('Scenario name', { exact: true })).toHaveValue('Saved browser scenario');
  await page.getByRole('button', { name: 'Clear saved draft' }).click();
  await page.getByRole('button', { name: 'Run preflight' }).click();
  expect(await page.evaluate(() => localStorage.getItem('react-redact-demo-v1'))).toBeNull();
});

test('export/import, policy error handling, picking and bounded preflight work', async ({ page }) => {
  await page.goto('/studio/overview');
  await page.getByRole('button', { name: 'Pick a field' }).click();
  await page.getByTestId('demo-preview').locator('[data-redact-field="customer.email"]').first().click();
  await expect(page.getByLabel('Semantic ID')).toHaveValue('customer.email');
  await page.getByRole('combobox', { name: 'Behavior', exact: true }).selectOption('mask');
  await expect(page.getByTestId('demo-preview').locator('[data-redact-field="customer.email"]').first()).toHaveText('••••••');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadEvent;
  const document = createDemoDocument(); document.name = 'Imported valid sample';
  await page.getByLabel('Import policy file').setInputFiles({name:'demo.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(document))});
  await expect(page.getByLabel('Scenario name')).toHaveValue('Imported valid sample');
  await page.getByLabel('Import policy file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...document,original:'never-echo-this'}))});
  await expect(page.getByRole('status')).toContainText('Unknown property');
  await expect(page.getByRole('status')).not.toContainText('never-echo-this');
  await page.getByRole('button', { name: 'Run preflight' }).click();
  await expect(page.getByText('4 / 4 fields present')).toBeVisible();
  expect(download.suggestedFilename()).toBe('redact-demo.json');
});

test('async demo endpoint returns only generated records', async ({ page }) => {
  await page.goto('/studio/overview');
  await page.getByRole('button', { name: 'Load async sample' }).click();
  await expect(page.getByTestId('async-record')).toContainText('No customer database');
});

test('Playwright helper rejects unknown and unprepared optional fields, includes root attributes', async ({ page }) => {
  await page.goto('/studio/overview');
  const policy = createDemoDocument();
  const valid = await checkDemoPage(page, policy, {root:'[data-testid="demo-preview"]'});
  expect(valid.passed).toBe(true);
  await page.getByTestId('demo-preview').evaluate(root => { const el = document.createElement('span'); el.setAttribute('data-redact-field','unknown'); el.setAttribute('data-redact-status','covered'); root.append(el); });
  const unknown = await checkDemoPage(page,policy,{root:'[data-testid="demo-preview"]'});
  expect(unknown.passed).toBe(false); expect(unknown.unknownFields).toContain('unknown');
  await page.getByTestId('demo-preview').evaluate(root => { root.querySelector('[data-redact-field="unknown"]')?.remove(); root.querySelector('[data-redact-field="invoice.total"]')?.setAttribute('data-redact-status','missing'); root.setAttribute('aria-label','FAKE-SENTINEL'); });
  const unprepared = await checkDemoPage(page,policy,{root:'[data-testid="demo-preview"]',sentinels:['FAKE-SENTINEL']});
  expect(unprepared.passed).toBe(false); expect(unprepared.sentinelIndices).toEqual([0]);
  expect(JSON.stringify(unprepared)).not.toContain('FAKE-SENTINEL');
});

test('mobile layout has no horizontal overflow and editor remains usable', async ({ page }) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel('Scenario name').fill('Mobile scenario');
  await expect(page.getByLabel('Scenario name')).toHaveValue('Mobile scenario');
  await page.getByRole('button', {name:'Run preflight'}).click();
  await expect(page.getByText('4 / 4 fields present')).toBeVisible();
});


test('preflight results invalidate after asynchronous content and route changes', async ({ page }) => {
  await page.goto('/studio/overview');
  await page.getByRole('button', {name:'Run preflight'}).click();
  await expect(page.getByText('4 / 4 fields present')).toBeVisible();
  await page.getByRole('button', {name:'Load async sample'}).click();
  await expect(page.getByTestId('async-record')).toBeVisible();
  await expect(page.getByText('4 / 4 fields present')).not.toBeVisible();
  await expect(page.getByRole('status')).toContainText('preview changed');
  await page.getByRole('button', {name:'Run preflight'}).click();
  await expect(page.getByText('4 / 4 fields present')).toBeVisible();
  await page.getByRole('navigation', {name:'Demo views'}).getByRole('link', {name:'customers'}).click();
  await expect(page.getByText('4 / 4 fields present')).not.toBeVisible();
});
