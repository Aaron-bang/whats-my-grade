# Gmail AI Integration Setup Guide

This guide will help you set up the Gmail AI integration feature to automatically extract assignments from your emails.

## Prerequisites

- Google Account with Gmail
- OpenAI API account (or alternative AI provider)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Navigate to **APIs & Services** > **Library**
   - Search for "Gmail API"
   - Click **Enable**

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Configure the OAuth consent screen if prompted:
   - User Type: **External** (for personal use)
   - App name: "What's My Grade" (or your preferred name)
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `gmail.readonly` and `userinfo.email`
   - Test users: Add your Gmail address
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: "What's My Grade Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production URL (e.g., `https://yourusername.github.io`)
   - Authorized redirect URIs: (leave empty for this implementation)
5. Copy the **Client ID** (looks like `xxxxx.apps.googleusercontent.com`)

## Step 3: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

> **Note**: OpenAI charges per API call. The `gpt-4o-mini` model costs approximately $0.01-0.03 per email processed. Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage).

## Step 4: Configure Environment Variables

1. In your project root, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
   VITE_OPENAI_API_KEY=sk-your_actual_openai_key
   VITE_DEBUG_MODE=false
   ```

3. **Important**: Never commit `.env` to version control. It's already in `.gitignore`.

## Step 5: Run the Application

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Using Gmail Integration

### First Time Setup

1. Look for the **"Connect Gmail"** button in the sidebar
2. Click it to start the OAuth flow
3. Sign in with your Google account
4. Grant permissions:
   - ✅ Read email messages
   - ✅ View your email address
5. You'll be redirected back to the app

### Syncing Assignments

1. Click the **"🔄 Sync"** button in the sidebar
2. The app will:
   - Fetch emails from the last 30 days (configurable)
   - Filter for assignment-related keywords
   - Use AI to extract assignment details
3. Review the extracted assignments in the modal:
   - Check/uncheck assignments to import
   - Verify course matching
   - Select assignment groups
   - Edit details if needed
4. Click **"Import X Assignments"** to add them to your courses

### Customization

You can customize the sync behavior by editing `src/config/apiConfig.ts`:

```typescript
export const GMAIL_SEARCH_CONFIG = {
  keywords: [
    'assignment',
    'homework',
    'due date',
    // Add your own keywords
  ],
  maxResults: 50,
  defaultDateRange: 30 // days to look back
};
```

## Troubleshooting

### "Google API not configured" Error

- Make sure your `.env` file exists and contains `VITE_GOOGLE_CLIENT_ID`
- Restart the dev server after adding environment variables
- Check that the Client ID is correct (should end with `.apps.googleusercontent.com`)

### "Failed to sync emails" Error

- Verify your Gmail API is enabled in Google Cloud Console
- Check that you've granted the correct permissions
- Try disconnecting and reconnecting your Gmail account

### "OpenAI API error" or "No response from AI"

- Verify your OpenAI API key is correct
- Check your OpenAI account has available credits
- Review the [OpenAI Status Page](https://status.openai.com/)

### No Assignments Found

- Try increasing the date range in sync settings
- Check that your emails contain keywords like "assignment", "homework", "due date"
- Verify the emails are in your inbox (not archived or deleted)

## Privacy & Security

- **All email processing happens client-side** - your emails are sent directly from your browser to OpenAI's API
- **No backend server** - we don't store or have access to your emails
- **Tokens are encrypted** - Gmail access tokens are encrypted before being stored in localStorage
- **Read-only access** - the app can only read emails, not send or delete them

## Production Deployment

For deploying to production (e.g., GitHub Pages):

1. Update OAuth credentials:
   - Add your production URL to **Authorized JavaScript origins**
   - Example: `https://yourusername.github.io`

2. Update `.env` for production build (or use GitHub Secrets)

3. **Important**: For public deployment, you'll need to submit your app for Google verification:
   - Go to OAuth consent screen in Google Cloud Console
   - Click "Publish App"
   - Submit for verification (required for apps with >100 users)

## Alternative: Backend Proxy (Advanced)

To avoid exposing API keys in the browser:

1. Create a backend service (Node.js, Python, etc.)
2. Move API calls to the backend
3. Implement user authentication
4. Update `src/services/aiService.ts` to call your backend instead of OpenAI directly

This approach is more secure but requires server infrastructure.

## Cost Estimation

- **Google Gmail API**: Free (within quota limits)
- **OpenAI API**: ~$0.01-0.03 per email processed with gpt-4o-mini
- **Example**: Syncing 50 emails ≈ $0.50-1.50

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Enable debug mode: `VITE_DEBUG_MODE=true` in `.env`
3. Review the implementation plan in the artifacts directory
4. Open an issue on GitHub with error details
