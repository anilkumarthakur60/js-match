# Setup Complete: Changesets for Automated Releases

## What's Been Set Up

### ✅ Changesets Initialized

- **Config**: `.changeset/config.json` - configured for public npm publishing on `main` branch
- **Docs**: `.changeset/README.md` & `.changeset/USAGE.md` - guides for using changesets

### ✅ Two GitHub Actions Workflows

#### 1. **ci.yml** (Existing)

- Runs on: `push` to any branch, `pull_request` to any branch
- Tests: Matrix of Node.js versions (18.x, 20.x, 21.x, 22.x)
- Builds: Vite builds and jest coverage
- Deploys docs to GitHub Pages when pushing to `main`

#### 2. **release.yml** (New)

- Runs on: `push` to `main` branch only
- Workflow:
  1. Checks out code
  2. Sets up Node 20 + bun
  3. Installs dependencies
  4. Builds and tests
  5. Uses [changesets/action](https://github.com/changesets/action) to:
     - Create a Release PR (on first run after changes)
     - Publish to npm (when Release PR is merged)

### ✅ Package.json Updates

- Added `release` script: `changeset publish --no-commit`
- Added `@changesets/cli` as devDependency

---

## How to Use

### Step 1: Make Changes

```bash
# Make your code changes
git add .
```

### Step 2: Create a Changeset

```bash
bun changeset
```

You'll be prompted to:

- Select change type: **patch** | **minor** | **major**
- Write a summary of changes
- Confirm

This creates a file like `.changeset/my-feature-123.md`

### Step 3: Commit & Push

```bash
git commit -m "feat: my new feature"
git push origin feature-branch
```

### Step 4: Merge to Main

Create a PR and merge to `main`.

### Step 5: Automated Release

1. **First merge**: GitHub Actions creates a "Release PR"
   - Updates `package.json` version
   - Generates CHANGELOG entries
   - Removes `.changeset/*.md` files
2. **Merge Release PR**: GitHub Actions automatically publishes to npm

---

## GitHub Secrets Required

Add to your repository **Settings → Secrets and variables → Actions**:

- **NPM_TOKEN**: Your npm automation token

  - Generate at: https://www.npmjs.com/settings/~/tokens
  - Type: **Automation** token
  - Scopes: Read & Publish

- **GITHUB_TOKEN**: (Automatically provided by GitHub Actions)

---

## Example Changeset Entry

`.changeset/feature-123.md`:

```
---
"@anilkumarthakur/match": minor
---

Add support for destructuring in match expressions
```

---

## Notes

- Only `main` branch triggers releases
- All other branches test but don't publish
- Versions follow **semver** (semantic versioning)
- Changesets enable you to skip manual version management
- All changes have a clear audit trail in CHANGELOG

---

For more info: https://github.com/changesets/changesets
