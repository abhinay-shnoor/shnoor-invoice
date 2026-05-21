const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TEXT:', text.substring(0, 500));
  
  await browser.close();
})();
