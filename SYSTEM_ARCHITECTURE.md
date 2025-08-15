# System Architecture - Webinar Website

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile Browser]
        C[Admin Dashboard]
    end

    subgraph "Frontend Layer"
        D[Next.js App]
        E[React Components]
        F[UI Components]
    end

    subgraph "API Layer"
        G[Next.js API Routes]
        H[Authentication API]
        I[Payment API]
        J[Webinar API]
        K[File Upload API]
    end

    subgraph "Service Layer"
        L[NextAuth.js]
        M[Razorpay Service]
        N[Stripe Service]
        O[Cloudinary Service]
        P[Google Drive API]
        Q[Twilio SMS]
        R[Email Service]
    end

    subgraph "Data Layer"
        S[PostgreSQL Database]
        T[Prisma ORM]
        U[File Storage]
    end

    subgraph "External Services"
        V[Razorpay Gateway]
        W[Stripe Gateway]
        X[YouTube API]
        Y[Google OAuth]
        Z[GitHub OAuth]
    end

    A --> D
    B --> D
    C --> D
    D --> G
    E --> G
    F --> G
    G --> L
    G --> M
    G --> N
    G --> O
    G --> P
    G --> Q
    G --> R
    L --> S
    M --> V
    N --> W
    O --> U
    P --> U
    Q --> U
    R --> U
    S --> T
    L --> Y
    L --> Z
    G --> X
```

## 2. Database Schema Architecture

```mermaid
erDiagram
    User {
        uuid id PK
        string name
        string email UK
        string phoneNumber
        string password
        enum role
        enum status
        datetime createdAt
        datetime updatedAt
    }

    WebinarDetails {
        uuid id PK
        string webinarTitle
        datetime webinarDate
        string webinarTime
        decimal paidAmount
        decimal discountAmount
        text description
        enum status
        json scheduledDates
        datetime createdAt
        datetime updatedAt
    }

    Payment {
        uuid id PK
        string razorpayOrderId
        decimal amount
        string currency
        enum planType
        enum status
        uuid userId FK
        uuid webinarId FK
        datetime createdAt
    }

    Subscription {
        uuid id PK
        uuid userId FK
        enum planType
        enum status
        datetime startDate
        datetime endDate
        datetime createdAt
    }

    Ebook {
        uuid id PK
        string title
        string description
        string fileUrl
        string thumbnailUrl
        enum status
        datetime createdAt
    }

    Video {
        uuid id PK
        string title
        string description
        string videoUrl
        string thumbnailUrl
        enum status
        datetime createdAt
    }

    User ||--o{ Payment : "makes"
    User ||--o{ Subscription : "has"
    WebinarDetails ||--o{ Payment : "receives"
    User ||--o{ WebinarDetails : "manages"
```

## 3. API Architecture

### 3.1 Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth API
    participant D as Database
    participant E as Email Service

    U->>F: Register/Login
    F->>A: POST /api/auth/register
    A->>D: Create User
    A->>E: Send Verification Email
    E->>U: Email with verification link
    U->>F: Click verification link
    F->>A: GET /api/auth/verify
    A->>D: Update user status
    A->>F: Redirect to dashboard
```

### 3.2 Payment Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant P as Payment API
    participant R as Razorpay
    participant D as Database
    participant W as Webhook

    U->>F: Select payment plan
    F->>P: POST /api/razorpay/payments
    P->>D: Create payment record
    P->>R: Create order
    R->>P: Order details
    P->>F: Payment options
    F->>R: Initiate payment
    R->>U: Payment gateway
    U->>R: Complete payment
    R->>W: Payment webhook
    W->>P: POST /api/razorpay/webhooks
    P->>D: Update payment status
    P->>F: Payment success
```

## 4. Component Architecture

### 4.1 Frontend Component Tree
```
App
├── Layout
│   ├── Navbar
│   │   ├── LanguageSwitcher
│   │   ├── SignInButton
│   │   └── UserDropdown
│   ├── ThemeProvider
│   └── Footer
├── Pages
│   ├── HomePage
│   │   ├── LandingSection
│   │   ├── WebinarListings
│   │   ├── PricingSection
│   │   └── FAQSection
│   ├── AuthPages
│   │   ├── LoginPage
│   │   ├── RegisterPage
│   │   └── VerifyPage
│   ├── Dashboard
│   │   ├── UserProfile
│   │   ├── WebinarAccess
│   │   └── PaymentHistory
│   └── WebinarPages
│       ├── LiveWebinar
│       ├── VideoPlayer
│       └── EbookViewer
└── Components
    ├── UI
    │   ├── Button
    │   ├── Input
    │   ├── Modal
    │   └── Toast
    ├── Webinar
    │   ├── WebinarCard
    │   ├── WebinarList
    │   └── WebinarPlayer
    └── Payment
        ├── SubscriptionButton
        ├── PaymentModal
        └── PlanSelector
```

## 5. Security Architecture

### 5.1 Authentication Security
```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Client Security                                   │
│ ├── HTTPS Enforcement                                      │
│ ├── CSP Headers                                            │
│ ├── XSS Protection                                         │
│ └── CSRF Protection                                        │
│                                                           │
│ Layer 2: API Security                                      │
│ ├── Rate Limiting                                          │
│ ├── Input Validation                                       │
│ ├── SQL Injection Prevention                               │
│ └── Authentication Middleware                              │
│                                                           │
│ Layer 3: Data Security                                     │
│ ├── Password Hashing (bcrypt)                             │
│ ├── JWT Token Encryption                                   │
│ ├── Database Encryption                                    │
│ └── File Upload Validation                                │
│                                                           │
│ Layer 4: Payment Security                                  │
│ ├── Webhook Signature Verification                         │
│ ├── Payment Data Encryption                               │
│ ├── PCI Compliance                                         │
│ └── Fraud Detection                                        │
└─────────────────────────────────────────────────────────────┘
```

## 6. Performance Architecture

### 6.1 Caching Strategy
```
┌─────────────────────────────────────────────────────────────┐
│                    Caching Layers                          │
├─────────────────────────────────────────────────────────────┤
│ Browser Cache                                              │
│ ├── Static Assets (CSS, JS, Images)                       │
│ ├── API Responses (ETags)                                  │
│ └── Service Worker Cache                                   │
│                                                           │
│ CDN Cache                                                  │
│ ├── Global Content Delivery                                │
│ ├── Image Optimization                                     │
│ └── Static File Caching                                    │
│                                                           │
│ Server Cache                                               │
│ ├── Database Query Caching                                 │
│ ├── API Response Caching                                   │
│ └── Session Storage                                        │
│                                                           │
│ Database Cache                                             │
│ ├── Query Result Caching                                   │
│ ├── Connection Pooling                                     │
│ └── Index Optimization                                     │
└─────────────────────────────────────────────────────────────┘
```

## 7. Scalability Architecture

### 7.1 Horizontal Scaling Strategy
```
┌─────────────────────────────────────────────────────────────┐
│                Scaling Strategy                            │
├─────────────────────────────────────────────────────────────┤
│ Load Balancer                                             │
│ ├── Multiple Server Instances                             │
│ ├── Health Checks                                         │
│ └── Traffic Distribution                                   │
│                                                           │
│ Application Servers                                       │
│ ├── Stateless Architecture                                │
│ ├── Session Management via JWT                            │
│ └── Auto-scaling Groups                                   │
│                                                           │
│ Database Scaling                                           │
│ ├── Read Replicas                                         │
│ ├── Connection Pooling                                    │
│ └── Sharding Strategy                                     │
│                                                           │
│ File Storage Scaling                                       │
│ ├── CDN Distribution                                       │
│ ├── Cloud Storage (Cloudinary)                            │
│ └── Backup & Recovery                                     │
└─────────────────────────────────────────────────────────────┘
```

## 8. Monitoring & Observability

### 8.1 Monitoring Stack
```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Architecture                  │
├─────────────────────────────────────────────────────────────┤
│ Application Monitoring                                     │
│ ├── Error Tracking (Sentry)                               │
│ ├── Performance Monitoring (Vercel Analytics)             │
│ ├── User Analytics (Google Analytics)                     │
│ └── Real-time Monitoring                                  │
│                                                           │
│ Infrastructure Monitoring                                  │
│ ├── Server Health Checks                                  │
│ ├── Database Performance                                  │
│ ├── API Response Times                                    │
│ └── Resource Utilization                                   │
│                                                           │
│ Business Intelligence                                      │
│ ├── User Behavior Analytics                               │
│ ├── Revenue Tracking                                       │
│ ├── Content Performance                                   │
│ └── Conversion Funnels                                    │
└─────────────────────────────────────────────────────────────┘
```

## 9. Deployment Architecture

### 9.1 CI/CD Pipeline
```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Flow                         │
├─────────────────────────────────────────────────────────────┤
│ Development                                                │
│ ├── Local Development                                      │
│ ├── Hot Reloading                                         │
│ └── Environment Variables                                  │
│                                                           │
│ Testing                                                    │
│ ├── Unit Tests (Jest)                                     │
│ ├── Integration Tests                                      │
│ ├── E2E Tests (Playwright)                                │
│ └── Performance Tests                                      │
│                                                           │
│ Staging                                                    │
│ ├── Pre-production Environment                            │
│ ├── Database Migrations                                   │
│ ├── Integration Testing                                   │
│ └── User Acceptance Testing                               │
│                                                           │
│ Production                                                 │
│ ├── Vercel Deployment                                     │
│ ├── Database Migration                                     │
│ ├── Health Checks                                         │
│ └── Monitoring Setup                                       │
└─────────────────────────────────────────────────────────────┘
```

## 10. Data Flow Architecture

### 10.1 User Journey Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    User Journey                            │
├─────────────────────────────────────────────────────────────┤
│ 1. User Registration                                      │
│    ├── Email Verification                                 │
│    ├── Profile Creation                                   │
│    └── Welcome Email                                      │
│                                                           │
│ 2. Webinar Discovery                                      │
│    ├── Browse Webinars                                    │
│    ├── Filter by Category                                 │
│    └── Search Functionality                               │
│                                                           │
│ 3. Payment Process                                        │
│    ├── Plan Selection                                     │
│    ├── Payment Gateway                                    │
│    └── Order Confirmation                                 │
│                                                           │
│ 4. Content Access                                         │
│    ├── Video Streaming                                    │
│    ├── Ebook Downloads                                    │
│    └── Live Webinar Access                                │
│                                                           │
│ 5. User Engagement                                        │
│    ├── Progress Tracking                                  │
│    ├── Feedback Collection                                │
│    └── Community Features                                 │
└─────────────────────────────────────────────────────────────┘
```

---

*This architecture document provides detailed technical specifications for the webinar website system, including data flow, security, performance, and scalability considerations.* 