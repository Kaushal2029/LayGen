# Gemini AI Integration Setup

This project now supports Google's Gemini AI as the primary AI provider, with OpenAI as a fallback option.

## Features

- ✅ Document parsing and analysis
- ✅ Layout generation and variations
- ✅ Code generation (HTML/CSS/JavaScript)
- ❌ Image generation (not supported by Gemini, falls back to OpenAI)
- ✅ Automatic fallback to OpenAI if Gemini fails

## Setup Instructions

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables

Create a `.env.local` file in the project root with:

```bash
# Primary AI Provider (Gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# Fallback AI Provider (OpenAI)
OPENAI_API_KEY=your_openai_api_key_here

# Other required keys
FIGMA_API_KEY=your_figma_api_key_here
NEXT_PUBLIC_FIGMA_WEBHOOK_SECRET=your_figma_webhook_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Test the Integration

Run the test script to verify everything works:

```bash
node test-gemini.js
```

Or test via the API endpoints:

```bash
# Test Gemini specifically
curl http://localhost:3000/api/test-gemini

# Test all AI functionality (uses configured provider)
curl http://localhost:3000/api/test-all-ai
```

## Configuration

The AI provider is configured in `src/lib/config.ts`:

```typescript
ai: {
  provider: 'gemini' as const,           // Primary provider
  apiKey: process.env.GEMINI_API_KEY || '',
  model: 'gemini-1.5-flash',
  fallbackProvider: 'openai' as const,   // Fallback provider
  fallbackApiKey: process.env.OPENAI_API_KEY || '',
  fallbackModel: 'gpt-3.5-turbo'
}
```

## API Endpoints

All existing API endpoints now use the configured AI provider:

- `POST /api/ai/parse` - Document parsing
- `POST /api/ai/generate-image` - Image generation (uses OpenAI fallback)
- `POST /api/export/code` - Code generation
- `GET /api/test-gemini` - Test Gemini specifically
- `GET /api/test-all-ai` - Test all AI functionality

## How It Works

1. **Primary Provider**: The system first tries to use Gemini for all AI operations
2. **Automatic Fallback**: If Gemini fails or is unavailable, it automatically falls back to OpenAI
3. **Image Generation**: Since Gemini doesn't support image generation, it always uses OpenAI for this feature
4. **Error Handling**: Comprehensive error handling ensures the system remains functional

## Troubleshooting

### Common Issues

1. **"No valid AI service configuration found"**
   - Ensure `GEMINI_API_KEY` is set in your `.env.local` file
   - Verify the API key is valid

2. **"Gemini API key not found"**
   - Check that your `.env.local` file exists and contains the correct key
   - Restart your development server after adding the key

3. **Image generation fails**
   - This is expected with Gemini - the system will automatically use OpenAI for image generation
   - Ensure `OPENAI_API_KEY` is set as a fallback

### Testing

Use the test endpoints to verify functionality:

```bash
# Test Gemini integration
curl http://localhost:3000/api/test-gemini

# Expected response for successful test:
{
  "success": true,
  "data": {
    "overallSuccess": true,
    "successCount": 3,
    "totalTests": 3,
    "provider": "gemini"
  }
}
```

## Benefits of Using Gemini

- **Cost Effective**: Generally more affordable than OpenAI
- **Fast**: Quick response times for text generation
- **Reliable**: Google's robust infrastructure
- **Multilingual**: Excellent support for multiple languages
- **Context Length**: Large context window for complex documents

## Migration from OpenAI

The integration is designed to be seamless. If you were previously using OpenAI:

1. Add your Gemini API key to `.env.local`
2. The system will automatically use Gemini as the primary provider
3. Keep your OpenAI key as a fallback for image generation
4. No code changes needed in your application

## Support

If you encounter any issues:

1. Check the console logs for detailed error messages
2. Verify your API keys are correct
3. Test with the provided test endpoints
4. Ensure you have the latest version of the dependencies

The system is designed to be robust and will automatically handle provider switching, so your application should continue working even if one provider has issues.
