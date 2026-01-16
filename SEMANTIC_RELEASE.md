# Semantic Release Setup ✅

This project uses **Semantic Release** for fully automated versioning, tagging, and npm publishing.

## How It Works

### Automatic Release Process:

1. **Push commits to `main`** with conventional commit messages
2. **GitHub Actions automatically:**
   - Analyzes commits
   - Determines version bump (patch/minor/major)
   - Updates version in `package.json`
   - Generates `CHANGELOG.md`
   - Creates git tag (e.g., `v1.2.3`)
   - Publishes to npm
   - Creates GitHub Release

### No Manual Steps Required! 🚀

## Commit Message Format

Use **conventional commits** for automatic version detection:

```bash
# Bug fix → PATCH version (0.1.1)
git commit -m "fix: resolve matcher edge case"

# New feature → MINOR version (0.2.0)
git commit -m "feat: add new matching pattern"

# Breaking change → MAJOR version (1.0.0)
git commit -m "feat!: restructure API"
# or
git commit -m "feat: restructure API

BREAKING CHANGE: Old API no longer supported"
```

## Configuration

- **.releaserc.json** - Semantic Release configuration
- **plugins:**
  - `@semantic-release/commit-analyzer` - Analyzes commits
  - `@semantic-release/release-notes-generator` - Creates release notes
  - `@semantic-release/changelog` - Updates CHANGELOG.md
  - `@semantic-release/npm` - Publishes to npm
  - `@semantic-release/git` - Commits changes and creates tags
  - `@semantic-release/github` - Creates GitHub Releases

## Required Setup

✅ Add `NPM_TOKEN` secret to GitHub:

1. Go to npmjs.com → Account → Access Tokens
2. Create **Automation** token
3. GitHub → Repo Settings → Secrets → Add `NPM_TOKEN`

## Example Workflow

```bash
# Make changes
echo "console.log('new feature')" > src/feature.ts

# Commit with conventional message
git commit -am "feat: add new feature"

# Push to main
git push origin main

# GitHub Actions automatically:
# ✓ Creates tag v0.2.0
# ✓ Publishes to npm
# ✓ Updates CHANGELOG.md
# ✓ Creates GitHub Release
```

## Testing Locally (Optional)

```bash
# Dry run to see what would happen
npx semantic-release --dry-run
```

## Benefits Over Changesets

✅ **Fully automatic** - No manual changeset files  
✅ **Follows conventions** - Uses conventional commits  
✅ **Better defaults** - Works out of the box  
✅ **Single source of truth** - Git history = release history
