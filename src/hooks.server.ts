import { getWebhookScheduler } from '$lib/webhook-scheduler';

export const handle = async ({ event, resolve }: { event: any; resolve: any }) => {
	// Start the webhook scheduler if it's not already running
	const scheduler = getWebhookScheduler();

	// Check if scheduler is running, if not start it
	const status = await scheduler.getStatus();
	if (!status.isRunning) {
		console.log('Auto-starting webhook scheduler...');
		await scheduler.start();
	}

	return resolve(event);
};
