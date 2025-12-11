// Gmail API Service for fetching and filtering emails
import { GMAIL_SEARCH_CONFIG, DEBUG_MODE } from '../config/apiConfig';
import { getAccessToken } from './gmailAuth';
import type { EmailMessage } from '../types';

const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1/users/me';

// Fetch emails that might contain assignments
export async function fetchAssignmentEmails(
    afterDate?: Date,
    maxResults: number = GMAIL_SEARCH_CONFIG.maxResults
): Promise<EmailMessage[]> {
    const token = await getAccessToken();
    if (!token) {
        throw new Error('Not authenticated with Gmail');
    }

    // Build search query
    const keywords = GMAIL_SEARCH_CONFIG.keywords.map(k => `"${k}"`).join(' OR ');
    let query = `(${keywords})`;

    if (afterDate) {
        const dateStr = afterDate.toISOString().split('T')[0].replace(/-/g, '/');
        query += ` after:${dateStr}`;
    } else {
        // Default to last N days
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() - GMAIL_SEARCH_CONFIG.defaultDateRange);
        const dateStr = defaultDate.toISOString().split('T')[0].replace(/-/g, '/');
        query += ` after:${dateStr}`;
    }

    if (DEBUG_MODE) console.log('Gmail search query:', query);

    try {
        // Search for messages
        const searchResponse = await fetch(
            `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (!searchResponse.ok) {
            throw new Error(`Gmail API error: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        const messageIds = searchData.messages || [];

        if (DEBUG_MODE) console.log(`Found ${messageIds.length} potential assignment emails`);

        // Fetch full message details
        const messages = await Promise.all(
            messageIds.map((msg: { id: string }) => getEmailContent(msg.id, token))
        );

        return messages.filter(msg => msg !== null) as EmailMessage[];
    } catch (error) {
        console.error('Failed to fetch emails:', error);
        throw error;
    }
}

// Get full email content
export async function getEmailContent(
    messageId: string,
    token?: string
): Promise<EmailMessage | null> {
    const accessToken = token || await getAccessToken();
    if (!accessToken) {
        throw new Error('Not authenticated with Gmail');
    }

    try {
        const response = await fetch(
            `${GMAIL_API_BASE}/messages/${messageId}?format=full`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch email: ${response.statusText}`);
        }

        const data = await response.json();

        // Parse email headers
        const headers = data.payload.headers;
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
        const from = headers.find((h: any) => h.name === 'From')?.value || '';
        const dateStr = headers.find((h: any) => h.name === 'Date')?.value || '';

        // Parse email body
        const body = parseEmailBody(data.payload);

        return {
            id: messageId,
            subject,
            from,
            date: new Date(dateStr),
            body,
            snippet: data.snippet || ''
        };
    } catch (error) {
        console.error(`Failed to fetch email ${messageId}:`, error);
        return null;
    }
}

// Parse email body from Gmail API payload
function parseEmailBody(payload: any): string {
    let body = '';

    if (payload.body?.data) {
        body = decodeBase64(payload.body.data);
    } else if (payload.parts) {
        // Multi-part email
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                body += decodeBase64(part.body.data);
            } else if (part.mimeType === 'text/html' && part.body?.data && !body) {
                // Use HTML if no plain text available
                body = stripHtml(decodeBase64(part.body.data));
            } else if (part.parts) {
                // Nested parts
                body += parseEmailBody(part);
            }
        }
    }

    return body;
}

// Decode base64url encoded string
function decodeBase64(str: string): string {
    try {
        // Convert base64url to base64
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
        console.error('Failed to decode base64:', error);
        return '';
    }
}

// Strip HTML tags (basic implementation)
function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Custom search (for advanced users)
export async function searchEmails(query: string): Promise<EmailMessage[]> {
    const token = await getAccessToken();
    if (!token) {
        throw new Error('Not authenticated with Gmail');
    }

    try {
        const searchResponse = await fetch(
            `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(query)}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (!searchResponse.ok) {
            throw new Error(`Gmail API error: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        const messageIds = searchData.messages || [];

        const messages = await Promise.all(
            messageIds.map((msg: { id: string }) => getEmailContent(msg.id, token))
        );

        return messages.filter(msg => msg !== null) as EmailMessage[];
    } catch (error) {
        console.error('Failed to search emails:', error);
        throw error;
    }
}
