import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/js-match/',
  title: '@anilkumarthakur/match',
  description: 'PHP-style match expressions for JavaScript/TypeScript',
  lang: 'en-US',
  
  head: [
    ['meta', { name: 'theme-color', content: '#3c3c3d' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: '@anilkumarthakur/match' }],
    ['meta', { name: 'og:image', content: 'https://og.zura.wiki/api/og?title=%40anilkumarthakur%2Fmatch&desc=PHP-style%20match%20expressions%20for%20JavaScript%2FTypeScript' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/', activeMatch: '/guide/' },
      { text: 'API', link: '/api/', activeMatch: '/api/' },
      { text: 'Examples', link: '/examples/', activeMatch: '/examples/' },
      {
        text: 'Links',
        items: [
          { text: 'NPM Package', link: 'https://www.npmjs.com/package/@anilkumarthakur/match' },
          { text: 'GitHub', link: 'https://github.com/anilkumarthakur60/js-match' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ],
        },
        {
          text: 'Usage',
          items: [
            { text: 'Basic Usage', link: '/guide/basic-usage' },
            { text: 'Advanced Patterns', link: '/guide/advanced-patterns' },
            { text: 'Type Safety', link: '/guide/type-safety' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'match()', link: '/api/match' },
            { text: 'Matcher', link: '/api/matcher' },
            { text: 'Types', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'String Matching', link: '/examples/string-matching' },
            { text: 'HTTP Status Codes', link: '/examples/http-status-codes' },
            { text: 'Nested Matching', link: '/examples/nested-matching' },
            { text: 'Conditional Logic', link: '/examples/conditional-logic' },
            { text: 'Real-World Use Cases', link: '/examples/real-world' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/anilkumarthakur60/js-match' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@anilkumarthakur/match' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Anil Kumar Thakur',
    },

    editLink: {
      pattern: 'https://github.com/anilkumarthakur60/js-match/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
