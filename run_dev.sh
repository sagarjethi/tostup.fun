#!/bin/bash
# Build Backend
echo "🛠️ Building Backend..."
cd apps/backend
npm run build

# Start Backend
echo "🚀 Starting TostAI Backend..."
npm run start &
BACKEND_PID=$!

# Start Frontend
echo "🚀 Starting TostAI Frontend..."
cd ../web
npm run dev

# Cleanup
kill $BACKEND_PID
