#!/bin/bash

# ChainRelief Deployment Script
# For SideShift.ai Buildathon

echo "🚨 ChainRelief - Cross-Chain Disaster Funding Platform"
echo "=================================================="
echo ""

# Build the project
echo "📦 Building ChainRelief..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    
    # Check if dist folder exists
    if [ -d "dist" ]; then
        echo "📁 Build output available in 'dist' folder"
        echo ""
        echo "🚀 Deployment options:"
        echo "1. Vercel: vercel --prod"
        echo "2. Netlify: netlify deploy --prod --dir=dist"
        echo "3. GitHub Pages: gh-pages -d dist"
        echo "4. Manual: Upload 'dist' folder to any static host"
        echo ""
        echo "💡 Recommended: Vercel for fastest deployment"
        echo "   Run: npx vercel --prod"
        echo ""
    else
        echo "❌ Build failed - dist folder not found"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎯 Buildathon Submission Ready!"
echo "==============================="
echo "✅ Modern, responsive UI"
echo "✅ SideShift API integration"
echo "✅ Multi-chain donation flow"
echo "✅ Real-time impact tracking"
echo "✅ Professional documentation"
echo ""
echo "🏆 Good luck with your SideShift buildathon submission!"
