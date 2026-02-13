#!/bin/bash

# LUMIN Deployment Script
# This script helps you deploy to GitHub

echo "🚀 LUMIN Deployment to GitHub"
echo "=============================="
echo ""

# Step 1: Stage all changes
echo "📦 Step 1: Adding all files to git..."
git add .

# Step 2: Commit
echo "✍️ Step 2: Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_msg
commit_msg=${commit_msg:-"Dashboard redesign complete - ready for deployment"}
git commit -m "$commit_msg"

# Step 3: Push
echo "☁️ Step 3: Pushing to GitHub..."
git push origin main

echo ""
echo "✅ DONE! Code pushed to GitHub"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Go to https://dashboard.render.com to deploy backend"
echo "2. Go to https://vercel.com/new to deploy frontend"
echo "3. See deployment_guide.md for detailed instructions"
echo ""
