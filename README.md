# Nexariq Developer Portal - Groq Integration

A comprehensive, production-ready developer portal with **real Groq API integration**. Built with Next.js 15, TypeScript, and modern web technologies, featuring 8 high-performance AI models with lightning-fast inference.

## 🚀 Features

### Core Functionality
- **Real Groq API Integration**: 8 AI models (Llama 3.1, Mixtral, Gemma) with actual API calls
- **API Key Management**: Generate, manage, and revoke API keys with real database backend
- **Real-time Analytics**: Monitor actual API usage, token consumption, and performance metrics
- **Interactive AI Playground**: Test Groq models directly with real responses
- **Comprehensive Documentation**: Complete API reference with working code examples
- **Corporate-Grade UI**: Modern, responsive interface with dark/light mode

### Technical Features
- **Authentication**: NextAuth.js with multiple providers (Google, GitHub, Credentials)
- **Database**: Prisma ORM with SQLite for development
- **API Integration**: Direct integration with Lynxa Pro backend
- **Security**: API key validation, usage logging, and IP whitelisting
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: React hooks and NextAuth.js
- **UI Components**: Complete shadcn/ui component library

### Groq Integration
- **Real API Calls**: Direct integration with Groq's inference API
- **8 AI Models**: Llama 3.1 (405B, 70B, 8B), Mixtral 8x7B, Gemma (7B, 9B), Tool Use models
- **Lightning Speed**: Powered by Groq's specialized LPU hardware
- **Token Tracking**: Real-time usage monitoring and billing calculation
- **Rate Limiting**: Per-key limits (60/min, 1K/hour, 10K/day)

### API Endpoints
- **Chat Completions**: `/api/chat` - Real Groq model inference
- **API Key Management**: `/api/keys` - Generate and manage access keys
- **Analytics**: `/api/analytics` - Usage statistics and metrics
- **Health Check**: `/api/health` - System status monitoring

### Database Schema
- **Users**: Authentication and role management
- **API Keys**: Secure key generation and management
- **Usage Logs**: Comprehensive API usage tracking
- **Analytics**: Performance metrics and statistics
- **Security**: IP whitelisting and access controls

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd nexariq-developer-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure environment variables:
```env
# Required
DATABASE_URL="postgresql://username:password@hostname:port/database"
NEXTAUTH_SECRET="your-super-secret-jwt-secret-here"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY="gsk_your-groq-api-key-here"

# Optional (for OAuth)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-app-id"
GITHUB_SECRET="your-github-app-secret"
```

5. Initialize the database:
```bash
npm run db:push
npm run db:generate
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL database connection string
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Secret for NextAuth.js session encryption
- `GROQ_API_KEY`: Your Groq API key (required for AI functionality)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (optional)
- `GITHUB_ID`: GitHub OAuth client ID (optional)
- `GITHUB_SECRET`: GitHub OAuth client secret (optional)

### Database Setup
The application uses Prisma with SQLite for development. To use PostgreSQL in production:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set `DATABASE_URL` environment variable
3. Run migrations:
```bash
npm run db:migrate
```

## 🎯 Usage

### API Key Generation
1. Sign in to the developer portal
2. Navigate to "API Keys" section
3. Click "Create New Key"
4. Enter your Gmail address
5. Copy and securely store the generated key

### API Usage
Use your API key to access Groq AI models:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b-versatile",
    "max_tokens": 1024,
    "temperature": 0.7,
    "top_p": 0.9,
    "messages": [
      {"role": "system", "content": "You are a helpful AI assistant."},
      {"role": "user", "content": "Explain quantum computing in simple terms"}
    ]
  }'
```

### Playground Testing
1. Navigate to the "Playground" section
2. Configure your request parameters
3. Test the API directly in your browser
4. Copy generated code examples

## 📊 Analytics

The portal provides comprehensive analytics including:
- **API Call Volume**: Total requests over time
- **Token Usage**: Input/output token consumption
- **Success Rate**: API performance metrics
- **Error Tracking**: Failed requests and error types
- **Usage Patterns**: Peak usage times and trends

## 🔒 Security Features

### API Key Security
- **Secure Generation**: Cryptographically secure key generation
- **Expiration**: 30-day automatic expiration
- **Revocation**: Immediate key invalidation
- **Rate Limiting**: Usage-based throttling
- **IP Whitelisting**: Restrict access by IP address

### Authentication
- **Multi-Provider**: Google, GitHub, and email/password
- **Session Management**: Secure session handling
- **Role-Based Access**: Admin, Developer, and Viewer roles
- **MFA Support**: Two-factor authentication (configurable)

## 🎨 UI/UX Features

### Design System
- **Modern Interface**: Clean, professional design
- **Responsive Layout**: Mobile-first approach
- **Dark Mode**: Automatic theme switching
- **Accessibility**: WCAG 2.1 compliance
- **Micro-interactions**: Smooth animations and transitions

### User Experience
- **Onboarding**: Guided setup for new users
- **Quick Actions**: One-click common tasks
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Clear, actionable error messages
- **Performance**: Optimized loading and interactions

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Docker
```bash
# Build the image
docker build -t nexariq-portal .

# Run the container
docker run -p 3000:3000 nexariq-portal
```

### Manual Deployment
```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📈 Monitoring

### Application Monitoring
- **Performance**: Core Web Vitals tracking
- **Error Tracking**: Comprehensive error logging
- **Usage Analytics**: User behavior insights
- **API Performance**: Response time monitoring

### API Monitoring
- **Usage Metrics**: Request volume and patterns
- **Error Rates**: API failure tracking
- **Response Times**: Performance optimization
- **Token Consumption**: Cost monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check the inline documentation
- **Issues**: Create an issue on GitHub
- **Email**: support@nexariq.com
- **Discord**: Join our developer community

## 🏢 About Nexariq

Nexariq is a sub-brand of AJ STUDIOZ, specializing in AI-powered solutions. Our Lynxa Pro model represents the cutting edge of conversational AI technology.

### Our Mission
- Democratize access to advanced AI technology
- Provide enterprise-grade AI infrastructure
- Enable developers to build innovative AI applications
- Maintain the highest standards of security and privacy

---

**Built with ❤️ by the Nexariq team**