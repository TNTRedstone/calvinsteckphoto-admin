import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { createWebhookManager } from '$lib/airtable-webhook';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	try {
		const { baseId, webhookId } = await request.json();

		if (!baseId || !webhookId) {
			return json({ error: 'baseId and webhookId are required' }, { status: 400 });
		}

		// Use the webhook manager to refresh the webhook
		const webhookManager = createWebhookManager();
		const refreshData = await webhookManager.refreshWebhook(webhookId);

		console.log('Webhook refreshed successfully:', refreshData);

		return json({
			success: true,
			webhook: refreshData,
			message: 'Airtable webhook refreshed successfully'
		});
	} catch (error) {
		console.error('Error refreshing Airtable webhook:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
