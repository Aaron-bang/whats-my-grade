// Simple encryption utilities for storing sensitive tokens in localStorage
// Uses Web Crypto API for basic encryption

const ENCRYPTION_KEY_NAME = 'whats-my-grade-encryption-key';

// Generate or retrieve encryption key
async function getEncryptionKey(): Promise<CryptoKey> {
    const stored = localStorage.getItem(ENCRYPTION_KEY_NAME);

    if (stored) {
        const keyData = JSON.parse(stored);
        return await crypto.subtle.importKey(
            'jwk',
            keyData,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }

    // Generate new key
    const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey));

    return key;
}

// Encrypt data
export async function encryptData(data: string): Promise<string> {
    try {
        const key = await getEncryptionKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(data);

        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encodedData
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedData), iv.length);

        // Convert to base64
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption failed:', error);
        return data; // Fallback to unencrypted if encryption fails
    }
}

// Decrypt data
export async function decryptData(encryptedData: string): Promise<string> {
    try {
        const key = await getEncryptionKey();

        // Convert from base64
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

        // Extract IV and encrypted data
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);

        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        return new TextDecoder().decode(decryptedData);
    } catch (error) {
        console.error('Decryption failed:', error);
        return encryptedData; // Fallback to returning as-is if decryption fails
    }
}

// Clear encryption key (useful for logout)
export function clearEncryptionKey(): void {
    localStorage.removeItem(ENCRYPTION_KEY_NAME);
}
