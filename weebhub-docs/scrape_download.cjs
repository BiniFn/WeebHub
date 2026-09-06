const puppeteer = require('puppeteer');
const TurndownService = require('turndown');
const fs = require('fs');
const path = require('path');

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

async function scrape() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  const fullUrl = 'https://seanime.app/download';
  console.log(`Scraping ${fullUrl}...`);
  await page.goto(fullUrl, { waitUntil: 'networkidle0' });
  
  try {
    const contentHtml = await page.evaluate(() => {
      // Find the main content container, it might not be .rspress-doc on the download page
      const doc = document.querySelector('main') || document.body;
      return doc ? doc.innerHTML : null;
    });
    
    if (contentHtml) {
      let md = turndownService.turndown(contentHtml);
      md = md.replace(/Seanime/g, 'WeebHub');
      md = md.replace(/seanime\.app/g, 'WeebHub.app');
      md = md.replace(/seanime/gi, 'WeebHub');
      
      const filepath = path.join('content', 'download.mdx');
      fs.writeFileSync(filepath, md);
      console.log(`Saved ${filepath}`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  await browser.close();
}

scrape().catch(console.error);
