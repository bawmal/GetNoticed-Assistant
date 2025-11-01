#!/bin/bash

# Script to add JSearch API key to .env file

echo "🔑 JSearch API Key Setup"
echo "========================"
echo ""
echo "Please paste your JSearch API key:"
read -r API_KEY

if [ -z "$API_KEY" ]; then
  echo "❌ No API key provided. Exiting."
  exit 1
fi

# Check if key already exists
if grep -q "VITE_JSEARCH_API_KEY" .env 2>/dev/null; then
  echo "⚠️  VITE_JSEARCH_API_KEY already exists in .env"
  echo "Do you want to replace it? (y/n)"
  read -r REPLACE
  
  if [ "$REPLACE" = "y" ]; then
    # Remove old key
    sed -i '' '/VITE_JSEARCH_API_KEY/d' .env
    echo "VITE_JSEARCH_API_KEY=$API_KEY" >> .env
    echo "✅ API key updated in .env"
  else
    echo "❌ Cancelled. Key not updated."
    exit 0
  fi
else
  # Add new key
  echo "VITE_JSEARCH_API_KEY=$API_KEY" >> .env
  echo "✅ API key added to .env"
fi

echo ""
echo "🎉 Setup complete!"
echo "Run 'npm run dev' to start using JSearch API"
