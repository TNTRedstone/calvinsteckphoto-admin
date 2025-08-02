import { getWebhookScheduler } from '$lib/webhook-scheduler';
import { ADMIN_API_SECRET } from '$env/static/private';
import { json } from '@sveltejs/kit';

const ADMIN_ROUTES = [
	'/api/create-draft',
	'/api/setup-airtable-webhook',
	'/api/refresh-airtable-webhook'
];

export const handle = async ({ event, resolve }: { event: any; resolve: any }) => {
	// Start the webhook scheduler if it's not already running
	const scheduler = getWebhookScheduler();
	const status = await scheduler.getStatus();
	if (!status.isRunning) {
		console.log('Auto-starting webhook scheduler...');
		await scheduler.start();
	}

	if (ADMIN_ROUTES.includes(event.url.pathname)) {
		const authHeader = event.request.headers.get('Authorization');
		if (!authHeader || authHeader !== `Bearer ${ADMIN_API_SECRET}`) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
		event.locals.user = { isAuthenticated: true };
	}

	return resolve(event);
};