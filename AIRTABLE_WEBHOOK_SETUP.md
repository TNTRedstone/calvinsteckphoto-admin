# Airtable Webhook Setup for Digital Download Requests

This system uses Airtable webhooks to automatically detect when new entries are added to the "Digital download request" table.

## Environment Variables Required

Add these environment variables to your `.env` file:

```env
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
WEBHOOK_URL=https://your-domain.com/api/airtable-webhook
```

## API Endpoints

### 1. Setup Webhook

**POST** `/api/setup-airtable-webhook`

Creates a new webhook in Airtable to monitor the "Digital download request" table.

**Request Body:**

```json
{
	"baseId": "your_base_id"
}
```

**Response:**

```json
{
	"success": true,
	"webhook": {
		"id": "webhook_id",
		"notificationUrl": "https://your-domain.com/api/airtable-webhook",
		"expiresAt": "2024-01-01T00:00:00.000Z"
	},
	"message": "Airtable webhook created successfully for Digital download request table"
}
```

### 2. List Webhooks

**GET** `/api/setup-airtable-webhook`

Lists all existing webhooks for the base.

**Response:**

```json
{
	"success": true,
	"webhooks": [
		{
			"id": "webhook_id",
			"notificationUrl": "https://your-domain.com/api/airtable-webhook",
			"expiresAt": "2024-01-01T00:00:00.000Z"
		}
	],
	"message": "Retrieved existing webhooks"
}
```

### 3. Refresh Webhook

**POST** `/api/refresh-airtable-webhook`

Refreshes a webhook to extend its lifespan by 7 days.

**Request Body:**

```json
{
	"baseId": "your_base_id",
	"webhookId": "webhook_id"
}
```

**Response:**

```json
{
	"success": true,
	"webhook": {
		"id": "webhook_id",
		"expiresAt": "2024-01-08T00:00:00.000Z"
	},
	"message": "Airtable webhook refreshed successfully"
}
```

### 4. Webhook Receiver

**POST** `/api/airtable-webhook`

This endpoint receives notifications from Airtable when changes occur. It automatically:

1. Receives the webhook notification
2. Fetches the detailed payload data
3. Extracts new "Digital download request" entries
4. Processes each new request

**Note:** This endpoint is called by Airtable automatically - you don't need to call it manually.

## Setup Instructions

1. **Get your Airtable API key:**
   - Go to your Airtable account settings
   - Generate a personal access token
   - Add it to your environment variables

2. **Get your Base ID:**
   - Open your Airtable base
   - The Base ID is in the URL: `https://airtable.com/appXXXXXXXXXXXXXX`
   - Add it to your environment variables

3. **Set your webhook URL:**
   - Update the `WEBHOOK_URL` environment variable with your actual domain
   - Example: `https://yourdomain.com/api/airtable-webhook`

4. **Create the webhook:**

   ```bash
   curl -X POST https://yourdomain.com/api/setup-airtable-webhook \
     -H "Content-Type: application/json" \
     -d '{"baseId": "your_base_id"}'
   ```

5. **Set up automatic webhook refresh:**
   - Webhooks expire after 7 days
   - Set up a cron job or scheduled task to refresh the webhook every 6 days
   - Use the `/api/refresh-airtable-webhook` endpoint

## Webhook Behavior

- **Monitors:** Only the "Digital download request" table
- **Triggers:** Only when new records are added (not updates or deletions)
- **Sources:** Changes from client, public API, and form submissions
- **Data:** Includes cell values for all fields in new records

## Customization

To modify the webhook behavior, edit the `AirtableWebhookManager` class in `src/lib/airtable-webhook.ts`:

- Change the table name in `extractNewDigitalDownloadRequests()`
- Modify the filters in `createWebhook()` to monitor different change types
- Add additional processing logic in `handleNewDigitalDownloadRequests()`

## Error Handling

The system includes comprehensive error handling:

- Validates required environment variables
- Handles API errors gracefully
- Logs all webhook activities
- Returns appropriate HTTP status codes

## Security Notes

- Keep your Airtable API key secure
- Use HTTPS for your webhook URL
- Consider adding webhook signature verification for production use
- Monitor webhook expiration and refresh automatically
