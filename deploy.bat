# Deployment Script for HN Media Agency

echo "🚀 Deploying to Vercel..."

# Check if git is clean
echo "📋 Checking git status..."
git status

# Add all changes
echo "📁 Adding files..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Fix Vercel SSO and update OAuth configuration"

# Push to main branch
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment completed!"
echo "🌐 Website: https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app"
echo "🔐 Admin: https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app/admin/"
echo "📖 Test OAuth: https://hn-media-agency-9uwh677iz-meep-ds-projects.vercel.app/test-oauth.html"