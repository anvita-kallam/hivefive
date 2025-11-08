#!/usr/bin/env python3
"""
Script to remove secrets from git history by rewriting commits.
This uses git filter-branch to replace secrets in GOOGLE_CLOUD_SETUP.md
"""

import subprocess
import sys
import os

# Secrets to remove - Add your actual secrets here if needed
# Format: 'actual-secret': 'replacement-text'
SECRETS = {
    # Example: 'your-oauth-client-id': '[Your OAuth Client ID]',
    # Example: 'your-oauth-client-secret': '[Your OAuth Client Secret]',
}

def run_command(cmd, check=True):
    """Run a shell command"""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and result.returncode != 0:
        print(f"Error running: {cmd}")
        print(result.stderr)
        sys.exit(1)
    return result

def clean_file(filepath):
    """Clean secrets from a file"""
    if not os.path.exists(filepath):
        return False
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    for secret, replacement in SECRETS.items():
        content = content.replace(secret, replacement)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    print("Removing secrets from git history...")
    print("This will rewrite git history. Make sure you have a backup!")
    
    # Create backup branch
    backup_name = f"backup-before-secret-cleanup-{int(__import__('time').time())}"
    print(f"Creating backup branch: {backup_name}")
    run_command(f"git branch {backup_name}")
    
    # Use git filter-branch to rewrite history
    filter_script = """
    if [ -f GOOGLE_CLOUD_SETUP.md ]; then
      python3 -c "
import sys
with open('GOOGLE_CLOUD_SETUP.md', 'r') as f:
    content = f.read()
    # Replace secrets with placeholders
    # Add your specific secrets here if needed
    # content = content.replace('your-secret', '[Your Replacement]')
with open('GOOGLE_CLOUD_SETUP.md', 'w') as f:
    f.write(content)
git add GOOGLE_CLOUD_SETUP.md 2>/dev/null || true
"
    fi
    """
    
    # Write filter script to temp file
    with open('/tmp/git-filter-script.sh', 'w') as f:
        f.write(filter_script)
    
    os.chmod('/tmp/git-filter-script.sh', 0o755)
    
    # Run filter-branch
    print("Running git filter-branch...")
    os.environ['FILTER_BRANCH_SQUELCH_WARNING'] = '1'
    result = run_command(
        "git filter-branch -f --tree-filter 'bash /tmp/git-filter-script.sh' --prune-empty --tag-name-filter cat -- --all",
        check=False
    )
    
    if result.returncode == 0:
        print("✅ Successfully cleaned git history!")
        print("Cleaning up...")
        run_command("git for-each-ref --format='%(refname)' refs/original/ | xargs -n 1 git update-ref -d", check=False)
        run_command("git reflog expire --expire=now --all", check=False)
        run_command("git gc --prune=now --aggressive", check=False)
        print("✅ Done! Now run: git push -f origin main")
    else:
        print("❌ Error cleaning history")
        print(result.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

