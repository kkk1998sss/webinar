# Technical Implementation Guide - Webinar Website

## 1. Development Setup

### 1.1 Prerequisites
```bash
# Required Software
- Node.js 18+ 
- PostgreSQL Database
- Git
- Code Editor (VS Code recommended)

# Environment Setup
- Razorpay Account (for payments)
- Cloudinary Account (for file storage)
- Google OAuth (for authentication)
- GitHub OAuth (for authentication)
```

### 1.2 Local Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd webinar

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### 1.3 Environment Variables
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/webinar_db"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"

# Payment Gateways
RAZORPAY_KEY_ID="rzp_test_your-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your-key-id"
STRIPE_SECRET_KEY="sk_test_your-stripe-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-key"

# File Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email Service
EMAIL_SERVER="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# SMS Service
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="your-twilio-phone"
```

## 2. Project Structure

### 2.1 Directory Organization
```
webinar/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── admin/             # Admin panel
│   │   └── users/             # User-facing pages
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── navbar/           # Navigation components
│   │   ├── webinar-list/     # Webinar display components
│   │   └── Subscription/     # Payment components
│   ├── lib/                  # Utility libraries
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   └── styles/               # Global styles
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
└── tests/                    # Test files
```

### 2.2 Key Files and Their Purposes
```typescript
// Core Configuration Files
next.config.js          # Next.js configuration
tailwind.config.ts      # Tailwind CSS configuration
tsconfig.json          # TypeScript configuration
package.json           # Dependencies and scripts

// Database
prisma/schema.prisma    # Database schema definition
prisma/migrations/      # Database migration files

// Authentication
src/app/api/auth/[...nextauth]/auth-options.ts  # NextAuth configuration
src/middleware.ts       # Authentication middleware

// Payment Integration
src/lib/razorpay.ts    # Razorpay service configuration
src/lib/stripe.ts      # Stripe service configuration
src/app/api/razorpay/  # Razorpay API endpoints
src/app/api/stripe/    # Stripe API endpoints

// Components
src/components/navbar/navbar.tsx           # Main navigation
src/components/webinar-list/               # Webinar display components
src/components/Subscription/               # Payment components
src/components/ui/                         # Base UI components
```

## 3. Core Features Implementation

### 3.1 Authentication System
```typescript
// Authentication Flow
1. User Registration (/auth/register)
   - Email/password registration
   - Email verification
   - OAuth integration (Google, GitHub)

2. User Login (/auth/login)
   - Email/password authentication
   - OAuth authentication
   - Session management

3. Password Reset (/auth/reset-password)
   - Email-based password reset
   - Token verification

4. Email Verification (/auth/verify)
   - Email verification tokens
   - Account activation
```

### 3.2 Payment System
```typescript
// Payment Flow Implementation
1. Plan Selection
   - Display available plans
   - Handle plan selection
   - Calculate pricing with discounts

2. Payment Processing
   - Create Razorpay order
   - Handle payment gateway
   - Process webhooks
   - Update payment status

3. Subscription Management
   - Track subscription status
   - Handle renewals
   - Manage cancellations
```

### 3.3 Webinar Management
```typescript
// Webinar Types
- Free Webinars: No payment required
- Paid Webinars: One-time purchase
- Subscription Webinars: Recurring access
- Four-Day Plans: Structured learning

// Webinar Features
- Live streaming integration
- Video playback
- Ebook downloads
- Progress tracking
- Access control
```

## 4. Database Schema

### 4.1 Core Tables
```sql
-- Users Table
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "phoneNumber" TEXT,
  "password" TEXT,
  "role" TEXT DEFAULT 'USER',
  "status" TEXT DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Webinars Table
CREATE TABLE "WebinarDetails" (
  "id" TEXT NOT NULL,
  "webinarTitle" TEXT NOT NULL,
  "webinarDate" TIMESTAMP(3),
  "webinarTime" TEXT,
  "paidAmount" DECIMAL(65,30),
  "discountAmount" DECIMAL(65,30),
  "description" TEXT,
  "status" TEXT DEFAULT 'UPCOMING',
  "scheduledDates" JSON,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebinarDetails_pkey" PRIMARY KEY ("id")
);

-- Payments Table
CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "razorpayOrderId" TEXT NOT NULL,
  "amount" DECIMAL(65,30) NOT NULL,
  "currency" TEXT DEFAULT 'INR',
  "planType" TEXT NOT NULL,
  "status" TEXT DEFAULT 'PENDING',
  "userId" TEXT NOT NULL,
  "webinarId" TEXT,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
```

### 4.2 Relationships
```sql
-- User-Payment Relationship
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Webinar-Payment Relationship
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_webinarId_fkey" 
FOREIGN KEY ("webinarId") REFERENCES "WebinarDetails"("id") ON DELETE CASCADE;
```

## 5. API Endpoints

### 5.1 Authentication Endpoints
```typescript
// Authentication Routes
POST /api/auth/register          # User registration
POST /api/auth/login            # User login
POST /api/auth/reset-password   # Password reset
GET  /api/auth/verify           # Email verification
POST /api/send-otp             # OTP sending
POST /api/verify-otp           # OTP verification
```

### 5.2 Payment Endpoints
```typescript
// Razorpay Routes
POST /api/razorpay/payments     # Create payment order
POST /api/razorpay/payments/verify  # Verify payment
POST /api/razorpay/webhooks/razorpay # Payment webhooks

// Stripe Routes
POST /api/stripe/checkout-session # Create Stripe session
POST /api/stripe/webhook         # Stripe webhooks
```

### 5.3 Webinar Endpoints
```typescript
// Webinar Routes
GET  /api/webinar               # Get webinar list
GET  /api/webinar/[id]          # Get specific webinar
POST /api/webinar               # Create webinar (admin)
PUT  /api/webinar/[id]          # Update webinar (admin)
DELETE /api/webinar/[id]        # Delete webinar (admin)

// Content Routes
GET  /api/ebooks                # Get ebook list
GET  /api/ebooks/[id]/download  # Download ebook
GET  /api/videos                # Get video list
GET  /api/videos/[id]           # Get specific video
```

## 6. Component Development

### 6.1 Component Structure
```typescript
// Component Example: WebinarCard
interface WebinarCardProps {
  webinar: Webinar;
  onJoin?: (id: string) => void;
  onPayment?: (webinar: Webinar) => void;
}

export function WebinarCard({ webinar, onJoin, onPayment }: WebinarCardProps) {
  // Component implementation
}
```

### 6.2 State Management
```typescript
// Custom Hooks
useAuth()           # Authentication state
useWebinars()       # Webinar data management
usePayments()       # Payment state management
useSubscriptions()  # Subscription management
```

### 6.3 Form Handling
```typescript
// Form Implementation with React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });
  
  // Form implementation
}
```

## 7. Testing Strategy

### 7.1 Test Types
```typescript
// Unit Tests (Jest)
- Component testing
- Utility function testing
- API route testing

// Integration Tests
- Authentication flow testing
- Payment flow testing
- Database operations testing

// E2E Tests (Playwright)
- User journey testing
- Payment flow testing
- Admin panel testing
```

### 7.2 Test Structure
```typescript
// Test Example
describe('Payment Flow', () => {
  it('should create payment order successfully', async () => {
    // Test implementation
  });
  
  it('should handle payment failure gracefully', async () => {
    // Test implementation
  });
});
```

## 8. Performance Optimization

### 8.1 Frontend Optimization
```typescript
// Image Optimization
import Image from 'next/image';

<Image
  src="/assets/webinar-thumbnail.jpg"
  alt="Webinar Thumbnail"
  width={300}
  height={200}
  priority={true}
/>

// Code Splitting
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

// Caching Strategy
export const revalidate = 3600; // Revalidate every hour
```

### 8.2 Backend Optimization
```typescript
// Database Optimization
- Use Prisma query optimization
- Implement database indexing
- Use connection pooling

// API Optimization
- Implement response caching
- Use pagination for large datasets
- Optimize database queries
```

## 9. Security Implementation

### 9.1 Authentication Security
```typescript
// Password Hashing
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 12);

// JWT Token Management
import { sign, verify } from 'jsonwebtoken';

const token = sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
```

### 9.2 Payment Security
```typescript
// Webhook Verification
import crypto from 'crypto';

const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(body)
  .digest('hex');

if (expectedSignature === signature) {
  // Process webhook
}
```

### 9.3 Input Validation
```typescript
// Zod Schema Validation
const paymentSchema = z.object({
  amount: z.number().positive(),
  planType: z.enum(['FOUR_DAY', 'SIX_MONTH', 'PAID_WEBINAR']),
  webinarId: z.string().optional(),
});
```

## 10. Deployment

### 10.1 Vercel Deployment
```bash
# Deploy to Vercel
vercel --prod

# Environment Variables in Vercel
- Set all required environment variables
- Configure database connection
- Set up payment gateway credentials
```

### 10.2 Database Migration
```bash
# Production Database Migration
npx prisma migrate deploy

# Database Seeding
npx prisma db seed
```

### 10.3 Monitoring Setup
```typescript
// Error Tracking
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Performance Monitoring
export function withPerformanceMonitoring(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();
    await handler(req, res);
    const duration = Date.now() - start;
    console.log(`API ${req.url} took ${duration}ms`);
  };
}
```

## 11. Troubleshooting

### 11.1 Common Issues
```typescript
// Payment Issues
- Check Razorpay credentials
- Verify webhook configuration
- Test payment flow in development

// Authentication Issues
- Verify NextAuth configuration
- Check OAuth provider settings
- Ensure environment variables are set

// Database Issues
- Run Prisma migrations
- Check database connection
- Verify schema changes
```

### 11.2 Debug Tools
```typescript
// API Debugging
console.log('API Request:', { url, method, body });

// Database Debugging
const result = await prisma.user.findMany({
  include: { payments: true },
});
console.log('Database Query Result:', result);

// Payment Debugging
console.log('Payment Request:', { amount, planType, webinarId });
```

---

*This implementation guide provides practical steps for developers to understand, modify, and extend the webinar website functionality.* 