# Git Repository Setup

The initial commit has been created locally. Follow these steps to push to GitHub.

## Option 1: Create Repository on GitHub First (Recommended)

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `hivefive`
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL

## Option 2: Push to Existing Repository

### If using SSH (git@github.com):

1. **Set up SSH keys** (if not already done):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the public key and add it to [GitHub SSH Keys](https://github.com/settings/keys)

2. **Test SSH connection**:
   ```bash
   ssh -T git@github.com
   ```

3. **Push to repository**:
   ```bash
   git push -u origin main
   ```

### If using HTTPS (https://github.com):

1. **Change remote URL**:
   ```bash
   git remote set-url origin https://github.com/anvita-kallam/hivefive.git
   ```

2. **Push to repository**:
   ```bash
   git push -u origin main
   ```
   You'll be prompted for your GitHub username and password (use a Personal Access Token, not your password)

## Current Status

✅ Git repository initialized
✅ Remote added: `git@github.com:anvita-kallam/hivefive.git`
✅ Initial commit created (50 files, 9355 insertions)
⏳ Waiting to push to GitHub

## Verify Setup

Check your git configuration:
```bash
git remote -v
git log --oneline
```

## Future Commits

To commit after every change, you can:

1. **Manual commits**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

2. **Automated commits** (using a script):
   See `commit-changes.sh` script

## Important Notes

- ✅ `.env` files are in `.gitignore` and won't be committed
- ✅ `node_modules` are ignored
- ✅ Firebase Admin SDK JSON files are ignored
- ⚠️ Never commit sensitive credentials
- ⚠️ Review changes before committing with `git status`

