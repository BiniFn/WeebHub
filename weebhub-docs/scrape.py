import urllib.request
import json
from bs4 import BeautifulSoup
import os
import re

try:
    import markdownify
except ImportError:
    import subprocess
    subprocess.check_call(["pip3", "install", "markdownify", "beautifulsoup4", "requests"])
    import markdownify

import requests

BASE_URL = 'https://seanime.app'
DOCS_URL = f'{BASE_URL}/docs'

def get_links():
    req = urllib.request.Request(DOCS_URL, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read()
    soup = BeautifulSoup(html, 'html.parser')
    links = set()
    for a in soup.find_all('a', href=True):
        if '/docs/' in a['href'] and a['href'] != '/docs/':
            links.add(a['href'])
    return list(links)

def scrape_page(url_path):
    print(f"Scraping {url_path}...")
    full_url = BASE_URL + url_path
    req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read()
        soup = BeautifulSoup(html, 'html.parser')
        
        # The main content in Rspress is usually inside an article or a main tag
        # Or .rspress-doc
        main_content = soup.find('div', class_='rspress-doc')
        if not main_content:
            main_content = soup.find('article')
            
        if not main_content:
            print(f"Failed to find main content for {url_path}")
            return None
            
        # Convert to markdown
        md = markdownify.markdownify(str(main_content), heading_style="ATX")
        
        # Rebranding
        md = md.replace('Seanime', 'WeebHub')
        md = md.replace('seanime', 'WeebHub')
        md = md.replace('seanime.app', 'WeebHub.app')
        
        return md
    except Exception as e:
        print(f"Error scraping {url_path}: {e}")
        return None

def main():
    links = get_links()
    print(f"Found {len(links)} links.")
    
    os.makedirs('content/docs', exist_ok=True)
    
    for link in links:
        md = scrape_page(link)
        if md:
            # e.g. /docs/scanner -> scanner.mdx
            filename = link.split('/')[-1]
            if not filename:
                continue
            filepath = os.path.join('content/docs', f"{filename}.mdx")
            
            with open(filepath, 'w', encoding='utf-8') as f:
                # Add a simple H1 if not present
                if not md.strip().startswith('#'):
                    # Capitalize filename
                    title = filename.replace('-', ' ').title()
                    f.write(f"# {title}\n\n")
                f.write(md)
            print(f"Saved {filepath}")

if __name__ == '__main__':
    main()
