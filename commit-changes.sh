#!/bin/bash

# HiveFive Git Commit Script
# This script commits all changes and pushes to GitHub

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}HiveFive Git Commit Script${NC}"
echo "================================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}"
    exit 1
fi

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}No changes to commit${NC}"
    exit 0
fi

# Show status
echo -e "\n${YELLOW}Current status:${NC}"
git status --short

# Get commit message
if [ -z "$1" ]; then
    echo -e "\n${YELLOW}Enter commit message:${NC}"
    read -r commit_message
else
    commit_message="$1"
fi

# Add all changes
echo -e "\n${YELLOW}Staging changes...${NC}"
git add .

# Commit
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "$commit_message"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Changes committed successfully${NC}"
    
    # Ask to push
    echo -e "\n${YELLOW}Push to GitHub? (y/n)${NC}"
    read -r push_response
    
    if [ "$push_response" = "y" ] || [ "$push_response" = "Y" ]; then
        echo -e "${YELLOW}Pushing to GitHub...${NC}"
        git push
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Changes pushed successfully${NC}"
        else
            echo -e "${RED}✗ Failed to push. Check your SSH keys or repository access.${NC}"
            echo -e "${YELLOW}See GIT_SETUP.md for troubleshooting${NC}"
        fi
    else
        echo -e "${YELLOW}Changes committed locally. Push later with: git push${NC}"
    fi
else
    echo -e "${RED}✗ Failed to commit${NC}"
    exit 1
fi

