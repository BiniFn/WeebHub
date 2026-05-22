const puppeteer = require('puppeteer');
const TurndownService = require('turndown');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://seanime.app';
const DOCS_URL = `${BASE_URL}/docs`;

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

async function scrape() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Go to the main docs page to get links
  console.log('Navigating to', DOCS_URL);
  await page.goto(DOCS_URL, { waitUntil: 'networkidle0' });
  
  const links = await page.evaluate(() => {
    const urls = new Set();
    document.querySelectorAll('a[href^="/docs/"]').forEach(a => {
      if (a.getAttribute('href') !== '/docs/') {
        urls.add(a.getAttribute('href'));
      }
    });
    return Array.from(urls);
  });
  
  console.log(`Found ${links.length} links.`);
  
  if (!fs.existsSync('content')) {
    fs.mkdirSync('content', { recursive: true });
  }

  for (const link of links) {
    const fullUrl = BASE_URL + link;
    console.log(`Scraping ${fullUrl}...`);
    await page.goto(fullUrl, { waitUntil: 'networkidle0' });
    
    // Wait for the main content to render
    try {
      await page.waitForSelector('.rspress-doc', { timeout: 5000 });
      
      const contentHtml = await page.evaluate(() => {
        const doc = document.querySelector('.rspress-doc');
        return doc ? doc.innerHTML : null;
      });
      
      if (contentHtml) {
        let md = turndownService.turndown(contentHtml);
        
        // Rebranding
        md = md.replace(/Seanime/g, 'WeebHub');
        md = md.replace(/seanime\.app/g, 'WeebHub.app');
        md = md.replace(/seanime/g, 'WeebHub');
        
        const filename = link.split('/').pop() + '.mdx';
        const filepath = path.join('content', filename);
        
        fs.writeFileSync(filepath, md);
        console.log(`Saved ${filepath}`);
      } else {
        console.log(`Failed to extract content from ${fullUrl}`);
      }
    } catch (e) {
      console.log(`Timeout or error on ${fullUrl}: ${e.message}`);
    }
  }

  await browser.close();
}

scrape().catch(console.error);
