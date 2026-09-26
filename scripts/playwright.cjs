exports.checkDemoPage = async (...args) => (await import('./playwright.mjs')).checkDemoPage(...args);
