// src/routes/auth/google/+server.js

import { OAuth2Client } from 'google-auth-library';
import { redirect } from '@sveltejs/kit';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from '$env/static/private';

// Initialize the OAuth2Client with your Google Cloud credentials.
// These variables are loaded securely from your .env file and are only
// available on the server-side in SvelteKit.
const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

/**
 * Handles GET requests to initiate the Google OAuth 2.0 authentication process.
 * This function generates an authorization URL and redirects the user to it.
 * @returns {Response} A redirect response to Google's authorization URL.
 */
export async function GET() {
	// This block generates the initial authorization URL to send the user to Google.
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline', // Request a refresh token for long-term access
		scope: [
			'https://www.googleapis.com/auth/gmail.compose',
			'https://www.googleapis.com/auth/gmail.readonly'
		], // Specify the permissions needed
		prompt: 'consent' // Force consent screen to ensure refresh token is granted
	});

	// Redirect the user to Google's authorization URL.
	throw redirect(302, authUrl);
}
