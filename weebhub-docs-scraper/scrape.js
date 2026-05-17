const axios = require('axios');
const TurndownService = require('turndown');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://seanime.app/docs';

const DOC_ROUTES = [
  '',
  'changelog',
  'config',
  'logs',
  'comparison',
  'local-anime-library',
  'autodownloader',
  'scanner',
  'access',
  'mobile',
  'transcode',
  'streaming',
  'streaming-torrent',
  'streaming-debrid',
  'streaming-online',
  'autoselect',
  'manga',
  'nakama',
  'offline',
  'anime-entry',
  'builtin-player',
  'customization',
  'policies',
  'hooks'
];

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*'
});

turndownService.addRule('removeNavigation', {
  filter: function(node) {
    const tagName = node.tagName?.toLowerCase();
    return tagName === 'nav' || 
           tagName === 'header' || 
           (tagName === 'div' && node.className?.includes('rp-nav')) ||
           (tagName === 'div' && node.className?.includes('rp-sidebar'));
  },
  replacement: function() {
    return '';
  }
});

function cleanContent(content) {
  return content
    .replace(/Seanime/gi, 'WeebHub')
    .replace(/seanime\.app/gi, 'weebhub.local')
    .replace(/seanime-server/gi, 'weebhub-server')
    .replace(/seanime-denshi/gi, 'WeebHub Denshi')
    .replace(/github\.com\/5rahim\/seanime/gi, 'github.com/BiniFn/WeebHub')
    .replace(/WeebHub Denshi/gi, 'WeebHub')
    .replace(/\[\]\(#.*?\)/g, '')
    .replace(/Copy Markdown/g, '')
    .replace(/ON THIS PAGE/gi, '')
    .replace(/Menu/gi, '')
    .replace(/<!--\$-->/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<rp-[^>]*>/g, '')
    .replace(/<\/rp-[^>]*>/g, '')
    .trim();
}

async function scrapeDocs() {
  console.log('Starting to scrape Seanime docs...\n');

  const outputDir = path.join(__dirname, '../weebhub-docs/content/docs');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = [];

  for (const route of DOC_ROUTES) {
    const url = route ? `${BASE_URL}/${route}` : BASE_URL;
    const slug = route || 'index';
    const filename = route ? `${route}.mdx` : 'index.mdx';

    console.log(`Fetching: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 30000
      });

      let html = response.data;
      
      const titleMatch = html.match(/<h1[^>]*id="([^"]+)"[^>]*>([^<]+)<\/h1>/);
      const title = titleMatch ? titleMatch[2].trim() : (route ? route.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Getting Started');
      
      const docContainerMatch = html.match(/<div[^>]*class="[^"]*rp-doc[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/main>/);
      
      let content = '';
      if (docContainerMatch) {
        content = docContainerMatch[1];
      } else {
        const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
        if (mainMatch) {
          content = mainMatch[1];
        }
      }
      
      if (!content) {
        console.log(`  ✗ No content found`);
        results.push({ route: slug, status: 'failed', error: 'No content' });
        continue;
      }
      
      let mdxContent = content;
      
      try {
        mdxContent = turndownService.turndown(content);
      } catch (e) {
        console.log(`  Warning: Turndown failed, using manual extraction`);
        mdxContent = content.replace(/<[^>]+>/g, '\n').replace(/\n\n+/g, '\n\n').trim();
      }
      
      mdxContent = `# ${title}\n\n${mdxContent}`;
      mdxContent = cleanContent(mdxContent);

      const filePath = path.join(outputDir, filename);
      fs.writeFileSync(filePath, mdxContent);
      
      const size = fs.statSync(filePath).size;
      console.log(`  ✓ Saved: ${filename} (${size} bytes)`);
      results.push({ route: slug, status: 'success', size });

    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);
      results.push({ route: slug, status: 'failed', error: error.message });
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n--- Summary ---');
  console.log(`Total: ${results.length}, Success: ${results.filter(r => r.status === 'success').length}, Failed: ${results.filter(r => r.status === 'failed').length}`);

  const successful = results.filter(r => r.status === 'success').sort((a, b) => (b.size || 0) - (a.size || 0));
  console.log('\nLargest files:');
  successful.slice(0, 5).forEach(s => console.log(`  - ${s.route}: ${s.size} bytes`));

  console.log('\nDocs saved to:', outputDir);
}

scrapeDocs().catch(console.error);