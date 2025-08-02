import { createWebhookManager } from './airtable-webhook';
import { WEBHOOK_URL } from '$env/static/private';

interface WebhookInfo {
	id: string;
	expiresAt: string;
	notificationUrl: string;
}

export class WebhookScheduler {
	private webhookManager: ReturnType<typeof createWebhookManager>;
	private refreshInterval: any | null = null;
	private checkInterval: any | null = null;
	private isRunning = false;

	constructor() {
		this.webhookManager = createWebhookManager();
	}

	async start() {
		if (this.isRunning) {
			console.log('Webhook scheduler is already running');
			return;
		}

		console.log('Starting webhook scheduler...');
		this.isRunning = true;

		// Initial setup
		await this.setupWebhook();

		// Set up automatic refresh every 6 days (6 * 24 * 60 * 60 * 1000 = 518400000 ms)
		this.refreshInterval = setInterval(async () => {
			await this.refreshWebhooks();
		}, 518400000); // 6 days

		// Check for new entries every 10 minutes (to respect rate limits)
		this.checkInterval = setInterval(async () => {
			await this.checkForNewEntries();
		}, 600000); // 10 minutes

		console.log('Webhook scheduler started successfully');
		console.log('- Auto-refresh interval: 6 days');
		console.log('- Check for new entries: every 10 minutes');
	}

	async stop() {
		if (!this.isRunning) {
			console.log('Webhook scheduler is not running');
			return;
		}

		console.log('Stopping webhook scheduler...');
		this.isRunning = false;

		if (this.refreshInterval) {
			clearInterval(this.refreshInterval);
			this.refreshInterval = null;
		}

		if (this.checkInterval) {
			clearInterval(this.checkInterval);
			this.checkInterval = null;
		}

		console.log('Webhook scheduler stopped');
	}

	private async setupWebhook() {
		try {
			console.log('Setting up Airtable webhook...');

			// Check if webhook already exists
			const existingWebhooks = await this.webhookManager.listWebhooks();

			if (existingWebhooks.webhooks && existingWebhooks.webhooks.length > 0) {
				console.log('Found existing webhook:', existingWebhooks.webhooks[0].id);
				return;
			}

			// Create new webhook
			const webhookUrl = WEBHOOK_URL || 'https://your-domain.com/api/airtable-webhook';
			const webhookData = await this.webhookManager.createWebhook(webhookUrl);

			console.log('Created new webhook:', webhookData.id);
			console.log('Webhook expires at:', webhookData.expiresAt);
		} catch (error) {
			console.error('Error setting up webhook:', error);
		}
	}

	private async refreshWebhooks() {
		try {
			console.log('Refreshing webhooks...');

			const webhooks = await this.webhookManager.listWebhooks();

			if (webhooks.webhooks && webhooks.webhooks.length > 0) {
				for (const webhook of webhooks.webhooks) {
					const refreshData = await this.webhookManager.refreshWebhook(webhook.id);
					console.log(`Refreshed webhook ${webhook.id}, new expiry:`, refreshData.expiresAt);
				}
			} else {
				console.log('No webhooks found to refresh');
			}
		} catch (error) {
			console.error('Error refreshing webhooks:', error);
		}
	}

	private async checkForNewEntries() {
		try {
			console.log('Checking for new digital download requests...');

			const webhooks = await this.webhookManager.listWebhooks();

			if (webhooks.webhooks && webhooks.webhooks.length > 0) {
				for (const webhook of webhooks.webhooks) {
					const payloads = await this.webhookManager.getWebhookPayloads(webhook.id);
					const newRequests = this.webhookManager.extractNewDigitalDownloadRequests(payloads);

					if (newRequests.length > 0) {
						console.log(`Found ${newRequests.length} new digital download request(s):`);

						for (const request of newRequests) {
							console.log('📸 New Digital Download Request:');
							console.log('  ID:', request.id);
							console.log('  Created:', request.createdTime);

							// Extract and display the specific fields
							const email = request.fields['Email'] || 'Not provided';
							const imageIndexes = request.fields['Image Indexes'] || 'Not provided';
							const gallery = request.fields['Gallery'] || 'Not provided';

							console.log('  📧 Email:', email);
							console.log('  🖼️  Image Indexes:', imageIndexes);
							console.log('  🎨 Gallery:', gallery);
							console.log('  ---');
						}
					}
				}
			}
		} catch (error) {
			console.error('Error checking for new entries:', error);
		}
	}

	async getStatus() {
		try {
			const webhooks = await this.webhookManager.listWebhooks();
			const status = {
				isRunning: this.isRunning,
				webhooks: webhooks.webhooks || [],
				nextRefresh: this.refreshInterval ? 'Scheduled' : 'Not scheduled',
				nextCheck: this.checkInterval ? 'Scheduled' : 'Not scheduled'
			};

			return status;
		} catch (error) {
			console.error('Error getting status:', error);
			return { error: 'Failed to get status' };
		}
	}
}

// Create a singleton instance
let scheduler: WebhookScheduler | null = null;

export function getWebhookScheduler(): WebhookScheduler {
	if (!scheduler) {
		scheduler = new WebhookScheduler();
	}
	return scheduler;
}
