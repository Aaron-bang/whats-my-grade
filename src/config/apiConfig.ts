// API Configuration for Gmail and AI Integration

export const GOOGLE_CONFIG = {
    get clientId() {
        return localStorage.getItem('google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    },
    scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email'
    ],
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest']
};

export const OPENAI_CONFIG = {
    get apiKey() {
        return localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY || '';
    },
    model: 'gpt-4o-mini', // Cost-effective model for assignment extraction
    maxTokens: 1000,
    temperature: 0.3 // Lower temperature for more consistent extraction
};

export const GMAIL_SEARCH_CONFIG = {
    // Keywords to identify assignment-related emails
    keywords: [
        'assignment',
        'homework',
        'due date',
        'project',
        'exam',
        'quiz',
        'midterm',
        'final',
        'problem set',
        'syllabus'
    ],
    // Maximum number of emails to fetch per sync
    maxResults: 50,
    // Default days to look back for emails
    defaultDateRange: 30
};



// Debug mode
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

// Helper to check if APIs are configured
export const isGoogleConfigured = () => {
    return GOOGLE_CONFIG.clientId && GOOGLE_CONFIG.clientId !== '';
};

export const isOpenAIConfigured = () => {
    return OPENAI_CONFIG.apiKey && OPENAI_CONFIG.apiKey !== '';
};
