# Nexariq Developer Portal

A comprehensive, production-ready developer portal for Nexariq's Lynxa Pro AI model. Built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Features

### Core Functionality
- **API Key Management**: Generate, manage, and revoke API keys with 30-day expiration
- **Real-time Analytics**: Monitor API usage, token consumption, and performance metrics
- **Interactive Playground**: Test the Lynxa Pro AI model directly in your browser
- **Comprehensive Documentation**: Complete API reference with code examples
- **Corporate-Grade UI**: Modern, responsive interface inspired by Google AI Studio

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

### Backend Integration
- **API Endpoint**: `https://lynxa-pro-backend.vercel.app/api/lynxa`
- **Authentication**: Bearer token with API key validation
- **Key Generation**: `/api/generate-key` endpoint
- **Key Revocation**: `/api/revoke-key` endpoint
- **Usage Logging**: Automatic API call tracking

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
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXARIQ_BACKEND_URL=https://lynxa-pro-backend.vercel.app
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
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXARIQ_BACKEND_URL`: Lynxa Pro backend URL
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GITHUB_ID`: GitHub OAuth client ID
- `GITHUB_SECRET`: GitHub OAuth client secret

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
Use your API key to access the Lynxa Pro model:

```bash
curl -X POST https://lynxa-pro-backend.vercel.app/api/lynxa \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "lynxa-pro",
    "max_tokens": 1024,
    "stream": false,
    "messages": [
      {"role": "user", "content": "Hey Lynxa, who are you?"}
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