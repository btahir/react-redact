/** Optional Playwright helper: operates on an existing page; never navigates or uploads. */
export async function checkDemoPage(page, document, { root = 'body', sentinels = [] } = {}) {
  const { validateDocument } = await import('../dist/data.js');
  const result = validateDocument(document);
  if (!result.valid) throw new Error('Invalid demo policy');
  const policy = result.document;
  return page.locator(root).evaluate((element, { policy, sentinels }) => {
    const all = [element, ...element.querySelectorAll('*')];
    const fields = policy.fields.map(rule => {
      const nodes = all.filter(node => node.getAttribute('data-redact-field') === rule.id);
      return { id: rule.id, count: nodes.length, covered: nodes.length > 0 && nodes.every(node => node.getAttribute('data-redact-status') === 'covered'), required: rule.required };
    });
    const knownIds = new Set(policy.fields.map(field => field.id));
    const unknownFields = [...new Set(all.map(node => node.getAttribute('data-redact-field')).filter(id => id !== null && !knownIds.has(id)))];
    const matches = sentinels.flatMap((sentinel, index) => !sentinel ? [] : all.some(node => (node.textContent ?? '').includes(sentinel) || [...node.attributes].some(attr => attr.value.includes(sentinel)) || (typeof node.value === 'string' && node.value.includes(sentinel))) ? [index] : []);
    return { scope: 'current-root', fields, unknownFields, sentinelIndices: matches, passed: fields.every(field => field.covered || (!field.required && field.count === 0)) && unknownFields.length === 0 && matches.length === 0, limitations: ['Only this root and current UI state were checked.', 'No network, browser chrome, media pixels, clipboard, or unvisited routes checked.', 'A passing result is not a security certification.'] };
  }, { policy, sentinels });
}
