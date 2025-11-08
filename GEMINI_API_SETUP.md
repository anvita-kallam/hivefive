# Gemini API Key Setup for Buzz Chatbot

## Quick Setup

1. **Create or update your `.env` file** in the `backend/` directory:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Add your Gemini API key** to `backend/.env`:
   ```env
   GEMINI_API_KEY=AQ.Ab8RN6KtF6XGIBTK2hyksbQ9zmWe232Cx_MRyKq_gQ5VgUr_IQ
   ```
   
   **Note**: Make sure you create the `.env` file in the `backend/` directory, not in the root directory.
   
   You can manually create it or run:
   ```bash
   echo "GEMINI_API_KEY=AQ.Ab8RN6KtF6XGIBTK2hyksbQ9zmWe232Cx_MRyKq_gQ5VgUr_IQ" > backend/.env
   ```

3. **Restart your backend server**:
   ```bash
   npm run dev
   ```

## Verification

### Check if API key is loaded:
1. **Check your backend server logs** when it starts. You should see:
   ```
   ✅ Gemini API initialized with API key (gemini-1.5-flash)
   ```

2. **If you see this instead:**
   ```
   ⚠️ No Gemini/Vertex AI credentials found. Buzz will use enhanced mock responses.
   ```
   Then the API key is not being loaded correctly.

### Debugging Steps:
1. **Verify `.env` file exists** in `backend/` directory:
   ```bash
   cd backend
   ls -la .env
   ```

2. **Check if the key is set**:
   ```bash
   cd backend
   node -e "require('dotenv').config(); console.log('Key set:', !!process.env.GEMINI_API_KEY);"
   ```

3. **Make sure the server is restarted** after creating/updating `.env`:
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```

4. **Check server logs** when you send a message in Buzz Chat. You should see:
   ```
   🤖 Generating Buzz response for hive: ...
   🔑 Generative model available: true
   🔑 Using API key: true
   📤 Sending request to Gemini API...
   ```

5. **If you see errors**, check the detailed error logs:
   ```
   ❌ Error calling Gemini/Vertex AI: [error message]
   ```

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit your `.env` file to git (it's already in `.gitignore`)
- If this API key was exposed, consider regenerating it
- For production, use environment variables on your hosting platform (Railway, Vercel, etc.)

## How It Works

The Buzz service now supports two authentication methods:

1. **Gemini API Key** (Current setup) - Uses `@google/generative-ai` package
   - Simpler setup
   - Good for development
   - Set `GEMINI_API_KEY` in `.env`

2. **Vertex AI Service Account** (Alternative) - Uses `@google-cloud/vertexai` package
   - More secure for production
   - Requires Google Cloud project setup
   - Set `VERTEX_AI_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS` in `.env`

The service will automatically use the API key method if `GEMINI_API_KEY` is set, otherwise it will fall back to Vertex AI or enhanced mock responses.

## Troubleshooting

### API Key Not Working?
- Verify the key format (should start with your project prefix)
- Check that the key has Gemini API access enabled
- Ensure the `.env` file is in the `backend/` directory
- Restart the server after changing `.env`

### Getting Mock Responses?
- Check server console for error messages
- Verify the API key is correctly set in `.env`
- Make sure the `@google/generative-ai` package is installed (`npm install`)

## Testing

Try sending a message in Buzz Chat:
- Type "@Buzz, help me plan an event"
- Buzz should respond with AI-generated content (not mock responses)
- Check server logs for any API errors

