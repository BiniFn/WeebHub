import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import fs from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';

const docsDir = path.join(process.cwd(), 'content/docs');

const menuItems = {
  'Getting Started': [
    { title: 'Getting Started', href: '/docs' },
    { title: 'Changelog', href: '/docs/changelog' },
    { title: 'Config', href: '/docs/config' },
    { title: 'Troubleshooting', href: '/docs/logs' },
    { title: 'Comparison', href: '/docs/comparison' },
  ],
  'How-To Guides': [
    { title: 'Local Anime Library', href: '/docs/local-anime-library' },
    { title: 'Auto Downloader', href: '/docs/autodownloader' },
    { title: 'Scanner', href: '/docs/scanner' },
    { title: 'Remote Access', href: '/docs/access' },
    { title: 'Mobile & Other Devices', href: '/docs/mobile' },
    { title: 'Transcoding', href: '/docs/transcode' },
    { title: 'Streaming', href: '/docs/streaming' },
    { title: 'Torrent Streaming', href: '/docs/streaming-torrent' },
    { title: 'Debrid Streaming', href: '/docs/streaming-debrid' },
    { title: 'Online Streaming', href: '/docs/streaming-online' },
    { title: 'Auto-select', href: '/docs/autoselect' },
    { title: 'Manga', href: '/docs/manga' },
    { title: 'Sharing & Watch Together', href: '/docs/nakama' },
    { title: 'Offline Mode', href: '/docs/offline' },
  ],
  'Deep Dives': [
    { title: 'Anime Features', href: '/docs/anime-entry' },
    { title: 'Built-in Player', href: '/docs/builtin-player' },
    { title: 'UI Customization', href: '/docs/customization' },
  ],
  'Reference': [
    { title: 'Policies', href: '/docs/policies' },
    { title: 'Hooks', href: '/docs/hooks' },
  ],
};

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug ? slug.join('/') : 'index';
  const filePath = path.join(docsDir, `${slugPath}.mdx`);
  
  let content = '';
  let title = 'Page Not Found';
  let toc: { id: string; title: string; level: number }[] = [];
  
  try {
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf-8');
      
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1];
      }
      
      const headingRegex = /^#{2,3}\s+(.+)$/gm;
      let match;
      while ((match = headingRegex.exec(content)) !== null) {
        const text = match[1].replace(/\[.*?\]\(.*?\)/g, '').replace(/#/, '').trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        toc.push({
          id,
          title: text,
          level: match[0].startsWith('###') ? 3 : 2,
        });
      }
    }
  } catch (e) {
    console.error('Error reading docs:', e);
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-[#0f0f1a] border-r border-[#1e1e2e] overflow-y-auto">
        <div className="p-4 border-b border-[#1e1e2e]">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-semibold text-white">WeebHub Docs</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-6">
          {Object.entries(menuItems).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {category}
              </h3>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className="block py-1.5 px-3 rounded text-sm text-slate-300 hover:bg-[#1e1e2e] hover:text-white transition-colors"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-16 border-b border-[#1e1e2e] bg-[#0f0f1a] flex items-center px-8 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white text-sm">
              Home
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-white text-sm">{title}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="https://github.com/BiniFn/WeebHub" 
              target="_blank"
              className="text-slate-400 hover:text-white text-sm"
            >
              GitHub
            </Link>
          </div>
        </header>

        <div className="flex">
          <div className="flex-1 max-w-4xl mx-auto p-8">
            <article className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1 prose-code:rounded prose-pre:bg-[#0f0f1a] prose-pre:border prose-pre:border-slate-800">
              <MDXRemote source={content} />
            </article>
          </div>

          {/* Table of Contents */}
          {toc.length > 0 && (
            <aside className="w-48 p-8 hidden xl:block">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                On This Page
              </h4>
              <ul className="space-y-2 text-sm">
                {toc.map((item) => (
                  <li 
                    key={item.id} 
                    style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                  >
                    <a 
                      href={`#${item.id}`} 
                      className="text-slate-400 hover:text-indigo-400 block py-1"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  const files = fs.readdirSync(docsDir);
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => ({
      slug: file.replace('.mdx', '').split('/'),
    }));
}