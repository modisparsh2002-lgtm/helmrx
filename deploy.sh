#!/bin/bash
# HELMRx deploy to Cloudflare Pages
# Usage: ./deploy.sh
# First time: run "npm install -g wrangler && wrangler login"

echo "🚀 Deploying HELMRx to Cloudflare Pages..."
cd "$(dirname "$0")"
wrangler pages deploy . --project-name=helmrx
echo ""
echo "✅ Done! Check your site at https://helmrx.pages.dev"
