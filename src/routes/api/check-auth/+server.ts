// src/routes/api/check-auth/+server.js

import { json } from '@sveltejs/kit';
import { GMAIL_REFRESH_TOKEN } from '$env/static/private';

/**
 * Handles GET requests to check if the Gmail API is authenticated.
 * It checks for the presence of a GMAIL_REFRESH_TOKEN environment variable.
 * @returns {Response} A JSON response indicating authentication status.
 */
export async function GET() {
	// If GMAIL_REFRESH_TOKEN is present, we consider the app authenticated
	// for the purpose of making API calls via the backend.
	if (GMAIL_REFRESH_TOKEN) {
		return json({ authenticated: true });
	} else {
		// If not present, return a 401 Unauthorized status.
		return json({ authenticated: false, message: 'Gmail API not authenticated.' }, { status: 401 });
	}
}
