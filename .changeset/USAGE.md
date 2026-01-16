# How to Create a Changeset

When making changes that should be released:

1. Run: `bun changeset`
2. Select the type of change:

   - **patch**: Bug fixes or small changes
   - **minor**: New features (backwards compatible)
   - **major**: Breaking changes

3. Write a summary of your changes
4. Commit the generated `.changeset/*.md` file

Example workflow:

```bash
# Make your code changes
git add .

# Create changeset
bun changeset

# Commit everything including the .changeset file
git commit -m "feat: add new feature"

# Push to your feature branch
git push origin your-branch
```

When you merge to `main`:

- GitHub Actions will create a Release PR with version bumps and CHANGELOG updates
- Once you merge the Release PR, the workflow publishes to npm automatically
