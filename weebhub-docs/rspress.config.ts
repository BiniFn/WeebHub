import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: path.join(__dirname, 'content'),
  base: '/WeebHub/',
  title: 'WeebHub Docs',
  description: 'WeebHub - Your personal anime streaming server',
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/BiniFn/WeebHub',
      },
    ],
    search: {
      mode: 'local',
    },
    navbar: {
      title: 'WeebHub',
      logo: '/weebhub-logo.png',
      items: [
        { text: 'Home', link: '/' },
        { text: 'Docs', link: '/docs/' },
        { text: 'Download', link: '/download' },
      ],
    },
    sidebar: {
      '/docs/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Getting Started', link: '/docs/' },
            { text: 'Changelog', link: '/docs/changelog' },
            { text: 'Config', link: '/docs/config' },
            { text: 'Troubleshooting', link: '/docs/logs' },
            { text: 'Comparison', link: '/docs/comparison' },
          ]
        },
        {
          text: 'How-To Guides',
          items: [
            { text: 'Local Anime Library', link: '/docs/local-anime-library' },
            { text: 'Auto Downloader', link: '/docs/autodownloader' },
            { text: 'Scanner', link: '/docs/scanner' },
            { text: 'Remote Access', link: '/docs/access' },
            { text: 'Mobile & Other Devices', link: '/docs/mobile' },
            { text: 'Transcoding', link: '/docs/transcode' },
            { text: 'Streaming', link: '/docs/streaming' },
            { text: 'Torrent Streaming', link: '/docs/streaming-torrent' },
            { text: 'Debrid Streaming', link: '/docs/streaming-debrid' },
            { text: 'Online Streaming', link: '/docs/streaming-online' },
            { text: 'Auto-select', link: '/docs/autoselect' },
            { text: 'Manga', link: '/docs/manga' },
            { text: 'Sharing & Watch Together', link: '/docs/nakama' },
            { text: 'Offline Mode', link: '/docs/offline' },
          ]
        },
        {
          text: 'Deep Dives',
          items: [
            { text: 'Anime Features', link: '/docs/anime-entry' },
            { text: 'Built-in Player', link: '/docs/builtin-player' },
            { text: 'UI Customization', link: '/docs/customization' },
          ]
        },
        {
          text: 'Reference',
          items: [
            { text: 'Policies', link: '/docs/policies' },
            { text: 'Hooks', link: '/docs/hooks' },
          ]
        }
      ],
    },
  },
});