# Production Deployment Guide

This guide will help you deploy the Nexariq Developer Portal to production with all features working seamlessly.

## 🚀 Quick Deployment Checklist

### Pre-deployment Requirements

1. **GitHub Repository**: Push all code to your GitHub repository
2. **Database**: Set up a PostgreSQL database (recommended: Neon, Supabase, or Railway)
3. **API Keys**: Gather all required API keys and secrets
4. **Domain**: Optional - custom domain for production

### 1. Database Setup

#### Option A: Neon (Recommended)
```bash
# Visit https://neon.tech and create a new project
# Copy the connection string
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

#### Option B: Supabase
```bash
# Visit https://supabase.com and create a new project
# Go to Settings > Database and copy the connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 2. Vercel Deployment

1. **Connect Repository**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Select the repository: `nexariq-07`

2. **Environment Variables**:
   Add these in Vercel Dashboard > Settings > Environment Variables:

   ```env
   # Required Variables
   DATABASE_URL=your-postgresql-connection-string
   NEXTAUTH_SECRET=your-super-secure-secret-minimum-32-characters
   NEXTAUTH_URL=https://your-app-name.vercel.app
   
   # OAuth (Optional but recommended)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_ID=your-github-app-id
   GITHUB_SECRET=your-github-app-secret
   
   # Feature Configuration
   NODE_ENV=production
   ENABLE_ANALYTICS=true
   ENABLE_RATE_LIMITING=true
   DEFAULT_RATE_LIMIT_PER_DAY=10000
   ```

3. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### 3. Post-Deployment Setup

#### Database Migration
After deployment, run database migrations:

```bash
# In your local environment, connect to production database
npx prisma db push
npx prisma generate
```

#### Initial User Setup
1. Visit your deployed application
2. Sign in with Google/GitHub
3. The first user will be automatically created
4. Generate your first API key in the dashboard

### 4. Production Features

#### ✅ What's Working Out of the Box

- **API Key Management**: Secure generation and management
- **Rate Limiting**: 60/min, 1K/hour, 10K/day limits
- **Real-time Analytics**: Usage tracking and metrics
- **Interactive Playground**: Test API endpoints directly
- **Security Headers**: Production-grade security
- **Authentication**: Multi-provider OAuth support
- **CORS Protection**: Configured for production
- **Error Handling**: Comprehensive error management
- **IP Whitelisting**: Optional security layer

#### 🔧 API Endpoints Available

- `POST /api/chat` - Chat completions with Lynxa Pro
- `GET /api/keys` - List API keys
- `POST /api/keys` - Create new API key
- `DELETE /api/keys/[id]` - Delete API key
- `GET /api/analytics` - Usage analytics
- `POST /api/keys/[id]/usage` - Track API usage

### 5. Custom Domain (Optional)

1. In Vercel Dashboard > Settings > Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` environment variable to use your custom domain
4. Update OAuth redirect URIs in Google/GitHub settings

### 6. OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `https://your-domain.com/api/auth/callback/github`

### 7. Monitoring and Maintenance

#### Built-in Analytics
- Visit `/analytics` in your deployed app
- Monitor API usage, success rates, and performance
- Track user engagement and popular endpoints

#### Rate Limiting Monitoring
- All API calls are automatically rate-limited
- Users receive clear error messages when limits are exceeded
- Limits reset automatically based on time windows

#### Security Features Active
- CORS protection
- XSS protection
- Content security policy
- Secure headers
- API key validation
- IP whitelisting (optional)

### 8. Scaling Considerations

#### Database
- Start with Neon/Supabase free tier
- Upgrade based on usage
- Consider connection pooling for high traffic

#### API Rate Limits
- Adjust rate limits based on user feedback
- Implement usage-based pricing if needed
- Monitor database performance

#### Caching
- Static assets cached by Vercel CDN
- API responses are not cached for real-time data
- Consider Redis for session storage at scale

### 9. Troubleshooting

#### Common Issues

1. **Database Connection Issues**:
   ```bash
   # Test connection locally
   npx prisma db push
   ```

2. **Authentication Issues**:
   - Verify OAuth credentials
   - Check redirect URIs
   - Ensure NEXTAUTH_URL is correct

3. **API Key Generation Issues**:
   - Check database permissions
   - Verify user creation flow

4. **Rate Limiting Issues**:
   - Check database rate_limits table
   - Verify IP detection

### 10. Success Verification

After deployment, verify these features work:

- [ ] User registration/login
- [ ] API key generation
- [ ] Chat API functionality
- [ ] Rate limiting enforcement
- [ ] Analytics dashboard
- [ ] Playground functionality
- [ ] Error handling
- [ ] Security headers

### 11. Performance Optimization

The application includes:
- Next.js 15 optimizations
- Image optimization
- CSS optimization
- Code splitting
- Server-side rendering
- Static generation where appropriate

### 12. Support and Maintenance

#### Regular Tasks
- Monitor API usage and costs
- Update dependencies monthly
- Review security logs
- Backup database regularly
- Monitor error rates

#### Scaling Triggers
- Database connection limits reached
- API response times > 2s
- High error rates
- Rate limit hits increasing

## 🎉 You're Ready!

Your Nexariq Developer Portal is now live in production with:

- ✅ Seamless API key generation
- ✅ Production-ready playground
- ✅ Comprehensive rate limiting
- ✅ Real-time analytics
- ✅ Enterprise security
- ✅ Scalable architecture

Visit your deployed application and start using the API immediately!

## 📞 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check database connection and schema
4. Verify all environment variables are set correctly

Remember: The application is designed to work out-of-the-box with minimal configuration required!