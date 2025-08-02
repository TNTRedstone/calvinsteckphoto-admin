import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getWebhookScheduler } from '$lib/webhook-scheduler';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	try {
		const { action } = await request.json();
		const scheduler = getWebhookScheduler();

		switch (action) {
			case 'start':
				await scheduler.start();
				return json({
					success: true,
					message: 'Webhook scheduler started successfully'
				});

			case 'stop':
				await scheduler.stop();
				return json({
					success: true,
					message: 'Webhook scheduler stopped successfully'
				});

			default:
				return json(
					{
						error: 'Invalid action. Use "start" or "stop"'
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error('Error controlling webhook scheduler:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const GET: RequestHandler = async () => {
	try {
		const scheduler = getWebhookScheduler();
		const status = await scheduler.getStatus();

		return json({
			success: true,
			status
		});
	} catch (error) {
		console.error('Error getting scheduler status:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
