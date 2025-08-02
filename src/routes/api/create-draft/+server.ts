import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { json, error } from '@sveltejs/kit';
import MailComposer from 'nodemailer/lib/mail-composer';
import btoa from 'btoa';
import {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URI,
	GMAIL_REFRESH_TOKEN
} from '$env/static/private';

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

if (GMAIL_REFRESH_TOKEN) {
	oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
}

export async function POST({ request }) {
	if (!GMAIL_REFRESH_TOKEN) {
		throw error(401, 'Gmail not authenticated. Please authenticate first.');
	}

	try {
		const { credentials } = await oauth2Client.refreshAccessToken();
		oauth2Client.setCredentials(credentials);

		const { recipient, subject, bodyHtml } = await request.json();

		const mail = new MailComposer({
			to: recipient,
			subject: subject,
			html: bodyHtml
		});

		const rawMessage = await mail.compile().build();
		const encodedMessage = btoa(rawMessage)
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');

		const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
		const response = await gmail.users.drafts.create({
			userId: 'me',
			requestBody: {
				message: {
					raw: encodedMessage
				}
			}
		});

		return json({ success: true, draftId: response.data.id, message: 'Draft created!' });
	} catch (e) {
		console.error('Error creating Gmail draft:', e.message);
		throw error(500, `Failed to create draft: ${e.message}`);
	}
}
