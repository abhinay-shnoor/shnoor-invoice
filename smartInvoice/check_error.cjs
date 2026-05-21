const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  // Set localStorage via addInitScript so it runs before the page loads
  await context.addInitScript(() => {
    localStorage.setItem('auth_user', JSON.stringify({
      id: '123',
      name: 'Admin',
      email: 'admin@shnoorinvoice.com',
      role: 'admin'
    }));
  });

  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'NO ROOT');
  console.log('ROOT HTML LENGTH:', rootHtml.length);
  if (rootHtml.length < 500) {
    console.log('ROOT HTML:', rootHtml);
  }
  
  await browser.close();
})();
