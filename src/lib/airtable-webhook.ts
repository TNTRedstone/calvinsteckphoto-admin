export interface AirtableWebhookPayload {
	webhookId: string;
	baseId: string;
	timestamp: string;
	baseTransactionNumber: number;
	actionMetadata: {
		source: string;
		sourceMetadata: any;
	};
}

export interface DigitalDownloadRequest {
	id: string;
	fields: Record<string, any>;
	createdTime: string;
}

export interface WebhookSpecification {
	notificationUrl: string;
	specification: {
		options: {
			filters: {
				dataTypes: string[];
				changeTypes: string[];
				fromSources: string[];
			};
			includes: {
				includeCellValuesInFieldIds: boolean;
			};
		};
	};
}

export class AirtableWebhookManager {
	private apiKey: string;
	private baseId: string;

	constructor(apiKey: string, baseId: string) {
		this.apiKey = apiKey;
		this.baseId = baseId;
	}

	async createWebhook(notificationUrl: string): Promise<any> {
		const webhookSpec: WebhookSpecification = {
			notificationUrl,
			specification: {
				options: {
					filters: {
						dataTypes: ['tableData'],
						changeTypes: ['add'],
						fromSources: ['client', 'publicApi', 'formSubmission']
					},
					includes: {
						includeCellValuesInFieldIds: true
					}
				}
			}
		};

		const response = await fetch(`https://api.airtable.com/v0/bases/${this.baseId}/webhooks`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(webhookSpec)
		});

		if (!response.ok) {
			throw new Error(`Failed to create webhook: ${response.statusText}`);
		}

		return await response.json();
	}

	async listWebhooks(): Promise<any> {
		const response = await fetch(`https://api.airtable.com/v0/bases/${this.baseId}/webhooks`, {
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to list webhooks: ${response.statusText}`);
		}

		return await response.json();
	}

	async refreshWebhook(webhookId: string): Promise<any> {
		const response = await fetch(
			`https://api.airtable.com/v0/bases/${this.baseId}/webhooks/${webhookId}/refresh`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to refresh webhook: ${response.statusText}`);
		}

		return await response.json();
	}

	async deleteWebhook(webhookId: string): Promise<void> {
		const response = await fetch(
			`https://api.airtable.com/v0/bases/${this.baseId}/webhooks/${webhookId}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to delete webhook: ${response.statusText}`);
		}
	}

	async getWebhookPayloads(webhookId: string): Promise<any> {
		const response = await fetch(
			`https://api.airtable.com/v0/bases/${this.baseId}/webhooks/payloads`,
			{
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json'
				}
			}
		);

		if (response.status === 429) {
			console.log('⚠️  Rate limit hit, waiting 30 seconds...');
			await new Promise((resolve) => setTimeout(resolve, 30000));
			throw new Error('Rate limit exceeded, will retry on next check');
		}

		if (!response.ok) {
			throw new Error(`Failed to get webhook payloads: ${response.statusText}`);
		}

		return await response.json();
	}

	extractNewDigitalDownloadRequests(payloads: any): DigitalDownloadRequest[] {
		const newRequests: DigitalDownloadRequest[] = [];

		for (const payload of payloads.payloads || []) {
			// Check if this payload contains changes to the "Digital download request" table
			if (payload.changedTablesById && payload.changedTablesById['Digital download request']) {
				const changes = payload.changedTablesById['Digital download request'];

				// Look for new records (additions)
				if (changes.addedRecordsById) {
					for (const recordId in changes.addedRecordsById) {
						const record = changes.addedRecordsById[recordId];
						newRequests.push({
							id: recordId,
							fields: record.cellValuesByFieldId,
							createdTime: record.createdTime
						});
					}
				}
			}
		}

		return newRequests;
	}
}

export function createWebhookManager(): AirtableWebhookManager {
	const apiKey = process.env.AIRTABLE_API_KEY;
	const baseId = process.env.AIRTABLE_BASE_ID;

	if (!apiKey) {
		throw new Error('AIRTABLE_API_KEY environment variable is not set');
	}

	if (!baseId) {
		throw new Error('AIRTABLE_BASE_ID environment variable is not set');
	}

	return new AirtableWebhookManager(apiKey, baseId);
}
