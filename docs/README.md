# Documentation

This directory contains the VitePress documentation for @anilkumarthakur/match.

## Directory Structure

```
docs/
├── .vitepress/
│   └── config.ts          # VitePress configuration
├── index.md               # Homepage
├── guide/                 # Getting started guide
│   ├── index.md
│   ├── installation.md
│   ├── quick-start.md
│   ├── basic-usage.md
│   ├── advanced-patterns.md
│   └── type-safety.md
├── api/                   # API reference
│   ├── index.md
│   ├── match.md
│   ├── matcher.md
│   └── types.md
└── examples/              # Real-world examples
    ├── index.md
    ├── string-matching.md
    ├── http-status-codes.md
    ├── predicate-matching.md
    ├── nested-matching.md
    ├── conditional-logic.md
    └── real-world.md
```

## Development

This is a pnpm workspace; run these from the repository root.

### Run Documentation Locally

```bash
pnpm run docs:dev
```

This will start a local development server at `http://localhost:5173` (or similar).

### Build Documentation for Production

```bash
pnpm run docs:build
```

This generates static files in `docs/.vitepress/dist/`.

### Preview Production Build

```bash
pnpm run docs:preview
```

This starts a local server to preview the production build.

## Documentation Content

- **Guide**: Getting started, installation, and usage tutorials
- **API Reference**: Complete API documentation for all exported types and functions
- **Examples**: Real-world use cases and practical examples

## VitePress Features

- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Theme**: Built-in light and dark mode
- 🔍 **Search**: Full-text search capability
- 📝 **Markdown**: All documentation is written in Markdown
- 🚀 **Fast**: Static site generation with optimized performance
- 🔗 **Navigation**: Automatic sidebar and breadcrumb navigation

## Configuration

The VitePress configuration is in `.vitepress/config.ts`. Key features:

- Custom navigation menu
- Organized sidebar with sections
- Links to external resources (GitHub, NPM)
- Social media links
- Edit link on GitHub
- Custom footer with copyright

## Adding New Pages

1. Create a new `.md` file in the appropriate directory
2. Update the sidebar configuration in `.vitepress/config.ts` if needed
3. Use Markdown frontmatter for page metadata:

```markdown
---
# Optional: Page title and description
title: My Page
description: Page description
---

# Page Heading

Page content...
```

## Publishing

The documentation can be deployed to:

- **Netlify**: Automatically built and deployed on push to main
- **Vercel**: Zero-config deployment
- **GitHub Pages**: Using GitHub Actions
- **Any Static Host**: Deploy the `dist/` folder

See VitePress deployment guide for more options: https://vitepress.dev/guide/deploy

## Learn More

- [VitePress Documentation](https://vitepress.dev/)
- [Markdown Guide](https://vitepress.dev/guide/markdown)
- [Theme Customization](https://vitepress.dev/guide/extending-default-theme)
