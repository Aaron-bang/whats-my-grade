// Gmail Authentication Service using Google OAuth 2.0
import { GOOGLE_CONFIG, DEBUG_MODE } from '../config/apiConfig';
import { encryptData, decryptData } from '../utils/encryption';
import type { GmailAuth } from '../types';

const STORAGE_KEY = 'gmail_auth';

// Initialize Google API
export async function initGoogleAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!GOOGLE_CONFIG.clientId) {
            reject(new Error('Google Client ID not configured'));
            return;
        }

        // Load Google API script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (DEBUG_MODE) console.log('Google API loaded');
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Google API'));
        document.head.appendChild(script);
    });
}

// Sign in with Google
export async function signInWithGoogle(): Promise<GmailAuth> {
    return new Promise((resolve, reject) => {
        if (!window.google) {
            reject(new Error('Google API not loaded'));
            return;
        }

        console.log('🔐 Initiating Google OAuth...');
        console.log('Client ID:', GOOGLE_CONFIG.clientId);
        console.log('Scopes:', GOOGLE_CONFIG.scopes);
        console.log('Current origin:', window.location.origin);

        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.clientId,
            scope: GOOGLE_CONFIG.scopes.join(' '),
            callback: async (response: any) => {
                console.log('📩 OAuth response received:', response);

                if (response.error) {
                    console.error('❌ OAuth error:', response.error);
                    reject(new Error(response.error));
                    return;
                }

                try {
                    console.log('✅ Access token received, fetching user info...');
                    // Get user email
                    const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                        headers: { Authorization: `Bearer ${response.access_token}` }
                    });
                    const userData = await userInfo.json();

                    const auth: GmailAuth = {
                        accessToken: response.access_token,
                        expiresAt: Date.now() + (response.expires_in * 1000),
                        email: userData.email
                    };

                    // Store encrypted auth data
                    await saveAuth(auth);

                    console.log('✅ Gmail authentication successful:', userData.email);
                    if (DEBUG_MODE) console.log('Gmail authentication successful:', userData.email);
                    resolve(auth);
                } catch (error) {
                    console.error('❌ Error during auth:', error);
                    reject(error);
                }
            },
        });

        console.log('🚀 Requesting access token...');
        client.requestAccessToken();
    });
}

// Sign out from Google
export async function signOutFromGoogle(): Promise<void> {
    const auth = await getAuth();

    if (auth?.accessToken && window.google) {
        window.google.accounts.oauth2.revoke(auth.accessToken, () => {
            if (DEBUG_MODE) console.log('Access token revoked');
        });
    }

    localStorage.removeItem(STORAGE_KEY);
}

// Get current auth
export async function getAuth(): Promise<GmailAuth | null> {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;

    try {
        const decrypted = await decryptData(encrypted);
        const auth: GmailAuth = JSON.parse(decrypted);

        // Check if token is expired
        if (auth.expiresAt < Date.now()) {
            if (DEBUG_MODE) console.log('Token expired');
            return null;
        }

        return auth;
    } catch (error) {
        console.error('Failed to retrieve auth:', error);
        return null;
    }
}

// Save auth
async function saveAuth(auth: GmailAuth): Promise<void> {
    const encrypted = await encryptData(JSON.stringify(auth));
    localStorage.setItem(STORAGE_KEY, encrypted);
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
    const auth = await getAuth();
    return auth !== null;
}

// Get access token (for API calls)
export async function getAccessToken(): Promise<string | null> {
    const auth = await getAuth();
    return auth?.accessToken || null;
}

// Type declaration for Google API
declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: any) => any;
                    revoke: (token: string, callback: () => void) => void;
                };
            };
        };
    }
}
