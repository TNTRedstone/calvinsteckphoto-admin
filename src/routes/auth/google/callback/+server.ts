import { OAuth2Client } from 'google-auth-library';
import { redirect, error } from '@sveltejs/kit';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from '$env/static/private';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

export async function GET({ url }) {
	const code = url.searchParams.get('code');

	if (!code) {
		throw error(400, 'Missing code parameter in callback.');
	}

	try {
		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);

		// Store the refresh token in .env (development only)
		if (tokens.refresh_token) {
			const envPath = path.resolve(process.cwd(), '.env');
			let envContent = readFileSync(envPath, 'utf-8');
			envContent = envContent.replace(/^GMAIL_REFRESH_TOKEN=.*$/m, '');
			envContent += `\nGMAIL_REFRESH_TOKEN="${tokens.refresh_token}"`;
			writeFileSync(envPath, envContent);
			console.log('Authentication successful! Refresh Token stored in .env.');
		}

		throw redirect(302, '/admin');
	} catch (e: any) {
		console.error('Error during token exchange:', e.message);
		throw error(500, 'Authentication failed during token exchange.');
	}
}
