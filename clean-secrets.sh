#!/bin/bash
# Script to remove secrets from git history using git filter-branch

set -e

echo "Starting to clean secrets from git history..."

# Backup current state
echo "Creating backup..."
git branch backup-before-clean-$(date +%s)

# Remove secrets from GOOGLE_CLOUD_SETUP.md in all commits
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --tree-filter '
if [ -f GOOGLE_CLOUD_SETUP.md ]; then
  # Replace OAuth Client ID (replace YOUR_SECRET with actual secret)
  # sed -i.bak "s|YOUR_OAUTH_CLIENT_ID|[Your OAuth Client ID]|g" GOOGLE_CLOUD_SETUP.md 2>/dev/null || \
  # sed -i "" "s|YOUR_OAUTH_CLIENT_ID|[Your OAuth Client ID]|g" GOOGLE_CLOUD_SETUP.md
  
  # Replace OAuth Client Secret (replace YOUR_SECRET with actual secret)
  # sed -i.bak "s|YOUR_OAUTH_CLIENT_SECRET|[Your OAuth Client Secret]|g" GOOGLE_CLOUD_SETUP.md 2>/dev/null || \
  # sed -i "" "s|YOUR_OAUTH_CLIENT_SECRET|[Your OAuth Client Secret]|g" GOOGLE_CLOUD_SETUP.md
  
  # Clean up backup files
  rm -f GOOGLE_CLOUD_SETUP.md.bak 2>/dev/null
  
  # Stage the file if it changed
  git add GOOGLE_CLOUD_SETUP.md 2>/dev/null || true
fi
' --prune-empty --tag-name-filter cat -- --all

echo "Cleaning up..."
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d 2>/dev/null || true
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Done! Secrets have been removed from git history."
echo "⚠️  Next step: git push -f origin main (force push to GitHub)"

