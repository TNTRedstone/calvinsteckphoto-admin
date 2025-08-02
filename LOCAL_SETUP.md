# Local Webhook Setup (No Domain Required)

You can run this webhook system locally on a Raspberry Pi, VM, or any machine without needing a domain. Here are the options:

## 🚀 Option 1: Port Forwarding

This option assumes you have a way to expose a local port to the internet. This could be through a home router's port forwarding feature, a VPS, or another tunneling service.

### 1. Start the server

```bash
# Terminal 1: Start your webhook server
npm run monitor
```

### 2. Expose your server

Configure your router or firewall to forward an external port (e.g., 8080) to your local machine's port 5173.

### 3. Update your environment variables

Use your public IP address and the forwarded port in your `.env` file:

```env
AIRTABLE_TOKEN=your_airtable_token_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
WEBHOOK_URL=http://your_public_ip:8080/api/airtable-webhook
```

## 🔧 Option 2: Using localtunnel

### 1. Install localtunnel

```bash
npm install -g localtunnel
```

### 2. Start your server and localtunnel

```bash
# Terminal 1: Start your webhook server
npm run monitor

# Terminal 2: Expose your server (in a new terminal)
lt --port 5173 --subdomain your-unique-name
```

### 3. Update your environment variables

```env
AIRTABLE_TOKEN=your_airtable_token_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
WEBHOOK_URL=https://your-unique-name.loca.lt/api/airtable-webhook
```

## 🖥️ Option 3: Using cloudflared (Free, No Signup)

### 1. Install cloudflared

```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### 2. Start your server and cloudflared

```bash
# Terminal 1: Start your webhook server
npm run monitor

# Terminal 2: Expose your server (in a new terminal)
cloudflared tunnel --url http://localhost:5173
```

### 3. Update your environment variables

Use the cloudflared URL in your `.env` file.

## 📋 Complete Setup Script

Here's a complete script to set everything up automatically:

```bash
#!/bin/bash

# Create startup script
cat > start-webhook.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Airtable Webhook Monitor..."

# Start the server in background
npm run monitor &
SERVER_PID=$!

# Wait a moment for server to start
sleep 5

echo "✅ Server started"
echo "📝 IMPORTANT: Make sure your .env file has the correct WEBHOOK_URL"
echo "that points to your publicly accessible server."
echo ""
echo "🔍 Monitoring for new digital download requests..."
echo "Press Ctrl+C to stop"


# Wait for interrupt
wait

# Cleanup
echo "🛑 Shutting down..."
kill $SERVER_PID
EOF

chmod +x start-webhook.sh

echo "✅ Setup complete! Run './start-webhook.sh' to start the monitor"
```

## 🔄 Auto-Start Script for Raspberry Pi

Create a systemd service to auto-start on boot:

```bash
# Create service file
sudo tee /etc/systemd/system/airtable-webhook.service << EOF
[Unit]
Description=Airtable Webhook Monitor
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/calvinsteckphoto-admin
ExecStart=/home/pi/calvinsteckphoto-admin/start-webhook.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable airtable-webhook.service
sudo systemctl start airtable-webhook.service

# Check status
sudo systemctl status airtable-webhook.service
```

## 📱 Monitoring Commands

```bash
# Check if the service is running
sudo systemctl status airtable-webhook.service

# View logs
sudo journalctl -u airtable-webhook.service -f

# Restart the service
sudo systemctl restart airtable-webhook.service

# Stop the service
sudo systemctl stop airtable-webhook.service
```

## 🔍 Troubleshooting

### localtunnel Issues

- **"Subdomain already in use"**: Try a different subdomain name
- **"Connection timeout"**: Check your internet connection

### General Issues

- **Webhook not receiving calls**: Check the WEBHOOK_URL in your .env file
- **Server not starting**: Make sure all dependencies are installed (`npm install`)
- **Permission denied**: Make sure the script is executable (`chmod +x start-webhook.sh`)

## 💡 Tips

1. **Use localtunnel for quick testing** - No signup required
2. **Use cloudflared for long-term hosting** - More stable
3. **Monitor the logs** - Check your server logs
4. **Test the webhook** - Use the Airtable webhook test feature

## 🎯 Quick Start (5 minutes)

1. **Set up your environment**:

   ```bash
   # Create .env file
   echo "AIRTABLE_TOKEN=your_token_here" > .env
   echo "AIRTABLE_BASE_ID=your_base_id_here" >> .env
   echo "WEBHOOK_URL=http://your_public_ip:port/api/airtable-webhook" >> .env
   ```

2. **Start the monitor**:

   ```bash
   npm run monitor
   ```

That's it! Your webhook monitor is now running locally and accessible to Airtable. 🎉
