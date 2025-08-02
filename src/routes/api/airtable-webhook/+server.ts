import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { createWebhookManager } from '$lib/airtable-webhook';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	try {
		const signature = request.headers.get('x-airtable-content-mac');
		const timestamp = request.headers.get('x-airtable-webhook-timestamp');
		const body = await request.text();

		if (!signature || !timestamp) {
			return json({ error: 'Missing signature or timestamp' }, { status: 400 });
		}

		const webhookManager = createWebhookManager();
		if (!webhookManager.verifySignature(signature, body, timestamp)) {
			return json({ error: 'Invalid signature' }, { status: 401 });
		}

		const notification = JSON.parse(body);

		// Log the webhook notification
		console.log('Airtable webhook notification received:', notification);

		// The webhook notification doesn't contain the actual data
		// We need to fetch the payloads to get the detailed information
		const webhookId = notification.webhookId;
		const baseId = notification.baseId;

		if (!webhookId || !baseId) {
			return json({ error: 'Missing webhookId or baseId' }, { status: 400 });
		}

		// Use the webhook manager to fetch and process payloads
		const payloads = await webhookManager.getWebhookPayloads(webhookId);

		// Extract new digital download requests from the payloads
		const newRequests = webhookManager.extractNewDigitalDownloadRequests(payloads);

		// Handle new digital download requests
		if (newRequests.length > 0) {
			await handleNewDigitalDownloadRequests(newRequests);
		}

		return json({
			success: true,
			processed: newRequests.length,
			message: `Processed ${newRequests.length} new digital download requests`
		});
	} catch (error) {
		console.error('Error processing Airtable webhook:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

async function handleNewDigitalDownloadRequests(requests: any[]) {
	console.log(`Processing ${requests.length} new digital download requests`);

	for (const request of requests) {
		try {
			// Extract and log the specific fields
			const email = request.fields['Email'] || 'Not provided';
			const imageIndexes = request.fields['Image Indexes'] || 'Not provided';
			const gallery = request.fields['Gallery'] || 'Not provided';

			console.log('📸 New Digital Download Request:');
			console.log('  ID:', request.id);
			console.log('  Created:', request.createdTime);
			console.log('  📧 Email:', email);
			console.log('  🖼️  Image Indexes:', imageIndexes);
			console.log('  🎨 Gallery:', gallery);

			// Here you can add your business logic to handle the new request
			// For example:
			// - Send confirmation emails
			// - Create internal tickets
			// - Trigger automated processes
			// - Update other systems

			// For now, we'll just log the request
			console.log(`Successfully processed digital download request: ${request.id}`);
		} catch (error) {
			console.error(`Error processing request ${request.id}:`, error);
		}
	}
}
