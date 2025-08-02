# Airtable Webhook Monitoring System

This system automatically monitors your Airtable "Digital download request" table and logs new entries to the console.

## 🚀 Quick Start

1. **Set up environment variables** in your `.env` file:

   ```env
   AIRTABLE_TOKEN=your_airtable_token_here
   AIRTABLE_BASE_ID=your_airtable_base_id_here
   WEBHOOK_URL=https://your-domain.com/api/airtable-webhook
   ```

2. **Start the monitoring server**:
   ```bash
   npm run monitor
   ```

That's it! The server will automatically:

- ✅ Create a webhook in Airtable (if none exists)
- 🔄 Refresh the webhook every 6 days
- 🔍 Check for new entries every 5 minutes
- 📝 Log new digital download requests to the console

## 📋 What You'll See

When a new entry is added to your "Digital download request" table, you'll see output like this:

```
🔍 Checking for new digital download requests...
Found 1 new digital download request(s):
📸 New Digital Download Request:
  ID: recXXXXXXXXXXXXXX
  Created: 2024-01-15T10:30:00.000Z
  📧 Email: john@example.com
  🖼️  Image Indexes: 1, 3, 5, 7
  🎨 Gallery: Wedding Collection
  ---
```

## 🔧 API Endpoints

### Control the Scheduler

- **POST** `/api/webhook-scheduler` - Start/stop the scheduler

  ```json
  { "action": "start" } // or "stop"
  ```

- **GET** `/api/webhook-scheduler` - Check scheduler status

### Manual Webhook Management

- **POST** `/api/setup-airtable-webhook` - Create webhook manually
- **GET** `/api/setup-airtable-webhook` - List existing webhooks
- **POST** `/api/refresh-airtable-webhook` - Refresh webhook manually

## ⚙️ Configuration

### Environment Variables

| Variable           | Description                         | Required |
| ------------------ | ----------------------------------- | -------- |
| `AIRTABLE_TOKEN` | Your Airtable personal access token | ✅       |
| `AIRTABLE_BASE_ID` | Your Airtable base ID               | ✅       |
| `WEBHOOK_URL`      | Your server's webhook URL           | ✅       |

### Timing Settings

The system uses these intervals (configurable in `src/lib/webhook-scheduler.ts`):

- **Webhook refresh**: Every 6 days (before 7-day expiration)
- **New entry check**: Every 5 minutes
- **Auto-start**: When server starts

## 🛠️ Customization

### Change Monitoring Table

Edit `src/lib/airtable-webhook.ts` in the `extractNewDigitalDownloadRequests()` method:

```typescript
// Change this line:
if (payload.changedTablesById && payload.changedTablesById['Digital download request']) {
// To:
if (payload.changedTablesById && payload.changedTablesById['Your Table Name']) {
```

### Change Check Intervals

Edit `src/lib/webhook-scheduler.ts`:

```typescript
// Change refresh interval (currently 6 days)
this.refreshInterval = setInterval(async () => {
	await this.refreshWebhooks();
}, 518400000); // 6 days

// Change check interval (currently 5 minutes)
this.checkInterval = setInterval(async () => {
	await this.checkForNewEntries();
}, 300000); // 5 minutes
```

### Add Custom Processing

Edit the `checkForNewEntries()` method in `src/lib/webhook-scheduler.ts` to add your business logic:

```typescript
for (const request of newRequests) {
	console.log('📸 New Digital Download Request:');
	console.log('  ID:', request.id);
	console.log('  Created:', request.createdTime);

	// Extract the specific fields
	const email = request.fields['Email'] || 'Not provided';
	const imageIndexes = request.fields['Image Indexes'] || 'Not provided';
	const gallery = request.fields['Gallery'] || 'Not provided';

	console.log('  📧 Email:', email);
	console.log('  🖼️  Image Indexes:', imageIndexes);
	console.log('  🎨 Gallery:', gallery);

	// Add your custom processing here:
	// - Send confirmation emails to the customer
	// - Process the image indexes for download
	// - Generate download links
	// - Update order status
	// - etc.

	console.log('  ---');
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"AIRTABLE_TOKEN environment variable is not set"**
   - Make sure your `.env` file exists and has the correct API key

2. **"Failed to create webhook"**
   - Check your Airtable API key permissions
   - Verify your base ID is correct

3. **No new entries showing up**
   - Check if the table name is exactly "Digital download request"
   - Verify the webhook is active in Airtable
   - Check server logs for errors

### Debug Mode

To see more detailed logs, you can modify the console.log statements in the scheduler or add debug logging.

## 📊 Monitoring Dashboard

The system provides a status endpoint to check if everything is working:

```bash
curl http://localhost:5173/api/webhook-scheduler
```

Response:

```json
{
	"success": true,
	"status": {
		"isRunning": true,
		"webhooks": [
			{
				"id": "webhook_id",
				"expiresAt": "2024-01-22T00:00:00.000Z"
			}
		],
		"nextRefresh": "Scheduled",
		"nextCheck": "Scheduled"
	}
}
```

## 🚨 Production Deployment

For production use:

1. **Use HTTPS**: Update `WEBHOOK_URL` to use HTTPS
2. **Add webhook verification**: Implement signature verification
3. **Set up monitoring**: Add health checks and alerts
4. **Use environment-specific configs**: Different settings for dev/staging/prod
5. **Add logging**: Use a proper logging service instead of console.log

## 📝 Log Format

The system logs in this format:

- `🚀` - Server startup
- `📸` - New digital download request
- `⏰` - Webhook refresh
- `🔍` - Checking for new entries
- `❌` - Errors
- `🛑` - Server shutdown

This makes it easy to scan logs for important events.
