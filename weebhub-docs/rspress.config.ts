import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: path.join(__dirname, 'content'),
  globalStyles: path.join(__dirname, 'theme/index.css'),
  base: '/docs/',
  logo: '/docs/weebhub-logo.png',
  title: 'WeebHub Guide',
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
    nav: [
      { text: 'Home', link: 'http://localhost:8080/' },
      { text: 'Guide', link: 'http://localhost:8080/docs/index.html' },
      { text: 'Download', link: 'http://localhost:8080/download/' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Getting Started', link: '/' },
            { text: 'Changelog', link: '/changelog' },
            { text: 'Config', link: '/config' },
            { text: 'Troubleshooting', link: '/logs' },
            { text: 'Comparison', link: '/comparison' },
          ]
        },
        {
          text: 'How-To Guides',
          items: [
            { text: 'Local Anime Library', link: '/local-anime-library' },
            { text: 'Auto Downloader', link: '/autodownloader' },
            { text: 'Scanner', link: '/scanner' },
            { text: 'Remote Access', link: '/access' },
            { text: 'Mobile & Other Devices', link: '/mobile' },
            { text: 'Transcoding', link: '/transcode' },
            { text: 'Streaming', link: '/streaming' },
            { text: 'Torrent Streaming', link: '/streaming-torrent' },
            { text: 'Debrid Streaming', link: '/streaming-debrid' },
            { text: 'Online Streaming', link: '/streaming-online' },
            { text: 'Auto-select', link: '/autoselect' },
            { text: 'Manga', link: '/manga' },
            { text: 'Sharing & Watch Together', link: '/nakama' },
            { text: 'Offline Mode', link: '/offline' },
          ]
        },
        {
          text: 'Deep Dives',
          items: [
            { text: 'Anime Features', link: '/anime-entry' },
            { text: 'Built-in Player', link: '/builtin-player' },
            { text: 'UI Customization', link: '/customization' },
          ]
        },
        {
          text: 'Reference',
          items: [
            { text: 'Policies', link: '/policies' },
            { text: 'Hooks', link: '/hooks' },
          ]
        }
      ],
    },
  },
});