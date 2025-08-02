#!/bin/bash

echo "🚀 Starting Airtable Webhook Monitor (Local Setup)..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your Airtable credentials:"
    echo "AIRTABLE_TOKEN=your_airtable_token_here"
    echo "AIRTABLE_BASE_ID=your_airtable_base_id_here"
    echo "WEBHOOK_URL=your_publicly_accessible_webhook_url_here"
    exit 1
fi

# Start the server in background
echo "📡 Starting webhook server..."
npm run monitor &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

echo ""
echo "✅ Server started"
echo ""
echo "📝 IMPORTANT: Make sure your .env file has the correct WEBHOOK_URL"
echo "that points to http://localhost:5173/api/airtable-webhook" 
echo "and is publicly accessible."
echo ""
echo "🔍 Monitoring for new digital download requests..."
echo "📸 Fields being monitored: Email, Image Indexes, Gallery"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Show the current webhook URL
if grep -q "WEBHOOK_URL" .env; then
    CURRENT_URL=$(grep "WEBHOOK_URL" .env | cut -d'=' -f2)
    echo "Current WEBHOOK_URL in .env: $CURRENT_URL"
else
    echo "⚠️  WEBHOOK_URL not found in .env file"
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $SERVER_PID 2>/dev/null
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for interrupt
wait 