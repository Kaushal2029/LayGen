# API Keys Setup Guide

Here's where to get each API key required for your Laygen project:

## 1. 🔑 Gemini API Key (Primary AI)

**Where to get it:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

**Environment variable:**
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## 2. 🤖 OpenAI API Key (Fallback AI)

**Where to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the generated key

**Environment variable:**
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## 3. 🎨 Figma API Key

**Where to get it:**
1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll down to "Personal access tokens"
3. Click "Create new token"
4. Give it a name (e.g., "Laygen Integration")
5. Copy the generated token

**Environment variable:**
```bash
FIGMA_API_KEY=your_figma_api_key_here
```

## 4. 🔗 Figma Webhook Secret (Optional)

**Where to get it:**
1. Go to [Figma Developer Settings](https://www.figma.com/developers/api#webhooks)
2. Create a new webhook for your app
3. Set the webhook URL to: `https://yourdomain.com/api/figma/webhook`
4. Copy the webhook secret from the webhook configuration

**Note:** This is only needed if you want real-time Figma updates. For basic functionality, you can leave this empty.

**Environment variable:**
```bash
NEXT_PUBLIC_FIGMA_WEBHOOK_SECRET=your_figma_webhook_secret_here
```

## 5. 🌐 App URL (Development)

**For local development:**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For production:**
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Complete .env.local Example

Create a `.env.local` file in your project root with:

```bash
# Primary AI Provider (Required)
GEMINI_API_KEY=AIzaSyC...your_actual_gemini_key

# Fallback AI Provider (Required for image generation)
OPENAI_API_KEY=sk-...your_actual_openai_key

# Figma Integration (Required for Figma features)
FIGMA_API_KEY=figd_...your_actual_figma_key

# Figma Webhook (Optional - only if using webhooks)
NEXT_PUBLIC_FIGMA_WEBHOOK_SECRET=your_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Priority Order

**Minimum required for basic functionality:**
1. ✅ `GEMINI_API_KEY` - For AI features
2. ✅ `OPENAI_API_KEY` - For image generation fallback

**For full functionality:**
3. ✅ `FIGMA_API_KEY` - For Figma integration
4. ⚠️ `NEXT_PUBLIC_FIGMA_WEBHOOK_SECRET` - Optional, only for webhooks

## Testing Your Keys

After setting up your keys, test them:

```bash
# Test Gemini
node test-gemini.js

# Test all AI functionality
curl http://localhost:3000/api/test-gemini

# Test Figma (if you have the key)
curl http://localhost:3000/api/figma/test
```

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your API keys secure and don't share them
- Use different keys for development and production
- Regularly rotate your API keys for security

## Troubleshooting

**"API key not found" errors:**
- Check that `.env.local` exists in the project root
- Verify the key names match exactly (case-sensitive)
- Restart your development server after adding keys

**"Invalid API key" errors:**
- Double-check the key was copied correctly
- Ensure the key has the right permissions
- Check if the key has expired or been revoked
