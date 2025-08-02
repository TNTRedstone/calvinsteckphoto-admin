#!/usr/bin/env node

import 'dotenv/config';
import { spawn } from 'child_process';
import fetch from 'node-fetch';

const {
	AIRTABLE_TOKEN,
	AIRTABLE_BASE_ID,
	ADMIN_API_SECRET,
	WEBHOOK_URL
} = process.env;

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !ADMIN_API_SECRET || !WEBHOOK_URL) {
	console.error('❌ Missing required environment variables. Please check your .env file.');
	process.exit(1);
}

async function setupWebhook() {
	console.log('🔧 Checking for existing Airtable webhook...');
	try {
		const response = await fetch(`${WEBHOOK_URL}/api/setup-airtable-webhook`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${ADMIN_API_SECRET}`
			},
			body: JSON.stringify({ baseId: AIRTABLE_BASE_ID })
		});

		const data = await response.json();

		if (response.ok) {
			console.log('✅ Webhook setup successful!');
			console.log(`   Webhook ID: ${data.webhookId}`);
			console.log('   ✨ IMPORTANT: The webhook secret is now set in the environment.');
			process.env.AIRTABLE_WEBHOOK_SECRET = data.webhookSecret;
		} else {
			// Check if webhook already exists
			if (data.error && data.error.includes('already has the maximum number of webhooks')) {
				console.log('⚠️ Webhook already exists. Skipping creation.');
			} else {
				throw new Error(data.message || 'Failed to setup webhook.');
			}
		}
	} catch (error) {
		console.error('❌ Error setting up webhook:', error.message);
		console.error('   Please ensure the server is running and accessible at the WEBHOOK_URL.');
		process.exit(1);
	}
}

function startServer() {
	console.log('\n🚀 Starting SvelteKit server...');
	const server = spawn('npm', ['run', 'dev', '--', '--host'], {
		stdio: 'inherit',
		shell: true,
		env: {
			...process.env,
			// Pass the potentially new secret to the SvelteKit process
			AIRTABLE_WEBHOOK_SECRET: process.env.AIRTABLE_WEBHOOK_SECRET
		}
	});

	server.on('close', (code) => {
		console.log(`\n❌ Server stopped with code ${code}`);
		process.exit(code);
	});

	process.on('SIGINT', () => server.kill('SIGINT'));
	process.on('SIGTERM', () => server.kill('SIGTERM'));

	console.log('✅ Server started!');
	console.log('📸 Monitoring "Digital download request" table for new entries.');
	console.log('📝 New digital download requests will be logged in the console below.');
	console.log('');
}

async function waitForServer(url, timeout = 30000) {
	const startTime = Date.now();
	const checkUrl = new URL(url);
	checkUrl.pathname = '/api/check-auth'; // Use a lightweight endpoint for polling

	console.log(`⏱️ Waiting for server to be ready at ${checkUrl.href}...`);

	while (Date.now() - startTime < timeout) {
		try {
			// Any response (even a 401 or other error) means the server is up.
			// We only care about catching network errors like ECONNREFUSED.
			await fetch(checkUrl.href, { method: 'GET' });
			console.log('✅ Server is up!');
			return;
		} catch (error) {
			// Note: node-fetch wraps the system error in `error.cause`
			if (error.cause && error.cause.code === 'ECONNREFUSED') {
				// Server not ready, wait 1s and try again.
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} else {
				// A different, unexpected error occurred.
				console.error('❌ An unexpected error occurred while waiting for the server:');
				throw error; // Abort
			}
		}
	}

	throw new Error(`Server did not become ready within ${timeout / 1000} seconds.`);
}

async function main() {
	// We need to start the server first so the setup endpoint is available.
	// A better solution would be a dedicated setup script, but for a single
	// command, we'll add a small delay to let the server start.
	console.log('🚀 Starting Airtable Webhook Monitor...');

	// Temporarily start the server to get the webhook secret
	const tempServer = spawn('npm', ['run', 'dev', '--', '--host'], {
		detached: true,
		shell: true,
		stdio: 'ignore'
	});

	try {
		await waitForServer(WEBHOOK_URL);
		await setupWebhook();
	} catch (error) {
		console.error(`❌ Initialization failed: ${error.message}`);
		process.kill(-tempServer.pid, 'SIGKILL'); // Force kill the process group
		process.exit(1);
	}

	// Kill the temporary server
	console.log('🔌 Shutting down temporary server...');
	process.kill(-tempServer.pid);

	// Start the real server with the correct environment
	startServer();
}

main();