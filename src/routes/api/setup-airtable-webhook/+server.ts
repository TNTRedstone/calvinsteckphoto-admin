import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { createWebhookManager } from '$lib/airtable-webhook';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	try {
		const { baseId } = await request.json();

		if (!baseId) {
			return json({ error: 'baseId is required' }, { status: 400 });
		}

		const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://your-domain.com/api/airtable-webhook';

		// Use the webhook manager to create the webhook
		const webhookManager = createWebhookManager();
		const webhookData = await webhookManager.createWebhook(WEBHOOK_URL);

		console.log('Webhook created successfully:', webhookData);

		return json({
			success: true,
			webhook: webhookData,
			message: 'Airtable webhook created successfully for Digital download request table'
		});
	} catch (error) {
		console.error('Error setting up Airtable webhook:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const GET: RequestHandler = async () => {
	try {
		// Use the webhook manager to list existing webhooks
		const webhookManager = createWebhookManager();
		const webhooks = await webhookManager.listWebhooks();

		return json({
			success: true,
			webhooks: webhooks.webhooks || [],
			message: 'Retrieved existing webhooks'
		});
	} catch (error) {
		console.error('Error listing webhooks:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
