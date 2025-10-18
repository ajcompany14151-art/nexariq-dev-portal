# Nexariq Developer Portal Setup Guide

## 🚀 Quick Start

Your Nexariq Developer Portal is now configured with **Lynxa Pro AI** and working integrations with your existing backend! Follow these steps to complete the setup:

## 1. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your environment variables in `.env.local`:

### Required Variables:
```env
# Database
DATABASE_URL="postgresql://username:password@hostname:port/database"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-jwt-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Your backend is already configured with Groq - no additional API key needed!

# OAuth Providers (Optional but recommended)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-app-id"
GITHUB_SECRET="your-github-app-secret"
```

### Backend Integration:
Your portal is already configured to work with your existing `Lynxa-pro-backend` that handles all AI processing internally.

## 2. Database Setup

### Option 1: PostgreSQL (Recommended for Production)
1. Set up a PostgreSQL database (local or cloud-based)
2. Update `DATABASE_URL` in your `.env.local`

### Option 2: SQLite (Quick Development)
For quick development, you can use SQLite:
```env
DATABASE_URL="file:./dev.db"
```

### Initialize the Database:
```bash
npm run db:push
npm run db:generate
```

## 3. OAuth Setup (Optional)

### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to your `.env.local`

### GitHub OAuth:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Secret to your `.env.local`

## 4. Install Dependencies & Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## 5. Verify Setup

1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the Nexariq Developer Portal
3. Sign in with Google/GitHub or create an account
4. Create your first API key
5. Test the Groq AI Playground

## 🎯 Features Now Available

✅ **Real Lynxa Pro Integration**
- Lynxa Pro AI model by Nexariq (AJ STUDIOZ)
- Powered by advanced language models via your backend
- Real token usage tracking with your existing system

✅ **API Key Management**
- Generate and manage API keys
- Rate limiting (per minute/hour/day)
- IP whitelisting support
- Automatic expiration (30 days)

✅ **Interactive Playground** 
- Test Lynxa Pro AI in real-time
- Adjustable parameters (temperature, tokens, etc.)
- Conversation history and export
- Code examples in cURL, JavaScript, Python

✅ **Comprehensive Documentation**
- Complete API reference
- Real code examples
- Error handling guide
- Rate limit information

✅ **Real Analytics Dashboard**
- API usage tracking
- Token consumption metrics
- Success/error rates
- Response time monitoring

✅ **Enterprise Features**
- User authentication (NextAuth.js)
- Database-backed user management
- Security features (2FA ready, IP whitelisting)
- Usage logging and billing preparation

## 🔧 API Endpoints

Your portal now includes these working endpoints:

- `POST /api/chat` - Chat completions with Lynxa Pro (proxied to your backend)
- `GET /api/keys` - List user's API keys
- `POST /api/keys` - Create new API key  
- `GET /api/analytics` - Usage analytics
- Direct backend: `POST https://lynxa-pro-backend.vercel.app/api/lynxa`

## 🧙 Lynxa Pro AI Model

**Lynxa Pro** - Advanced AI assistant developed by Nexariq, a sub-brand of AJ STUDIOZ
- Professional and friendly personality
- Powered by cutting-edge language models
- Optimized for helpful and accurate responses
- Maintains brand identity in all interactions

## 🚨 Important Security Notes

1. **Never commit your `.env.local` file** - it's already in `.gitignore`
2. **Keep your Groq API key secure** - don't expose it in client-side code
3. **Use HTTPS in production** - update `NEXTAUTH_URL` for production
4. **Set up proper CORS** if needed for external API access

## 🐛 Troubleshooting

### Common Issues:

1. **"Lynxa Pro API Error"**
   - Ensure your Lynxa-pro-backend is running
   - Verify the backend URL is accessible

2. **Database Connection Errors**
   - Check your `DATABASE_URL` format
   - Ensure database server is running
   - Run `npm run db:push` to sync schema

3. **OAuth Login Issues**
   - Verify OAuth provider credentials
   - Check redirect URLs match exactly
   - Ensure OAuth apps are enabled

4. **Environment Variables Not Loading**
   - Restart the development server
   - Check file is named `.env.local` exactly
   - Ensure no extra spaces in variable assignments

## 🎉 You're Ready!

Your Nexariq Developer Portal is now fully functional with:
- Real Lynxa Pro AI integration via your backend
- Working API key system with your existing database
- Comprehensive analytics with real usage data
- Production-ready authentication
- Complete documentation

Start creating API keys and testing Lynxa Pro in the playground!

## 📞 Support

If you encounter any issues:
1. Check this setup guide first
2. Verify all environment variables are set correctly
3. Check the console for any error messages
4. Ensure your Lynxa-pro-backend is running and accessible
5. Verify your database connection is working

Happy building! 🚀