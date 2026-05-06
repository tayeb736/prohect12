# 🧩 Component Diagram — MediShop Pro
## Software Architecture & Module Dependencies

---

## Component 1 — Full System Architecture

```mermaid
graph TB
  subgraph "🌐 CLIENT LAYER — Browser"
    subgraph "⚛️ React 19 + Vite Frontend"
      UI_AUTH[AuthModule\nLogin / Register / Logout]
      UI_HOME[StorefrontModule\nHomepage / Catalog / Search]
      UI_PRODUCT[ProductModule\nProduct Detail / Reviews]
      UI_CART[CartModule\nCart / Checkout / PromoCode]
      UI_BUYER[BuyerDashboard\nOrders / Rentals / Wishlist]
      UI_SELLER[SellerDashboard\nStore / Products / Wallet]
      UI_ADMIN[AdminDashboard\nUsers / Stores / Finance / KYC]
      UI_MSG[MessagingModule\nChat / Notifications]
    end
  end

  subgraph "⚙️ API LAYER — NestJS Backend"
    API_AUTH[AuthModule\nJWT HttpOnly Cookies / Bcrypt\nRate Limiting / Guards]
    API_USERS[UsersModule\nProfiles / KYC / Addresses]
    API_STORES[StoresModule\nCRUD / Documents / Approval]
    API_PRODUCTS[ProductsModule\nCRUD / Images / Search / Swagger]
    API_ORDERS[OrdersModule\nCart / Checkout / SubOrders\nSplit Payments]
    API_RENTALS[RentalsModule\nCalendar / Deposit / Contract PDF]
    API_WALLET[WalletModule\nTransactions / Withdrawal / Commission]
    API_REVIEWS[ReviewsModule\nRatings / Replies]
    API_DISPUTES[DisputesModule\nMessages / Resolution / KYC]
    API_MSG[MessagesModule\nConversations / Messages]
    API_NOTIF[NotificationsModule\nAlerts / Email]
    API_ADMIN[AdminModule\nStats / Moderation / Commissions]
    API_CATEGORIES[CategoriesModule\nHierarchy / CRUD]
    SWAGGER[Swagger / OpenAPI\nAPI Documentation & Testing]
  end

  subgraph "🗄️ DATA LAYER"
    PRISMA[(Prisma ORM)]
    DB[(PostgreSQL Database\n28+ Tables)]
    REDIS[(Redis Cache\nCart / Sessions / Rate Limit)]
    S3[(AWS S3 / Cloudinary\nProduct Images\nMedical Documents\nInvoice PDFs)]
  end

  subgraph "💳 EXTERNAL SERVICES"
    PAYMENT[Stripe / Payment Gateway\nSplit Payments\nDeposit Management]
    MAIL[SMTP / SendGrid\nEmail Notifications]
  end

  UI_AUTH --> API_AUTH
  UI_HOME & UI_PRODUCT & UI_CART --> API_AUTH
  UI_BUYER --> API_ORDERS & API_RENTALS & API_WALLET & API_REVIEWS & API_DISPUTES
  UI_SELLER --> API_STORES & API_PRODUCTS & API_ORDERS & API_WALLET
  UI_ADMIN --> API_ADMIN & API_USERS & API_STORES & API_PRODUCTS
  UI_MSG --> API_MSG & API_NOTIF

  API_AUTH --> PRISMA
  API_ORDERS --> REDIS
  API_AUTH --> REDIS
  API_USERS & API_STORES & API_PRODUCTS --> PRISMA
  API_ORDERS & API_RENTALS & API_WALLET & API_REVIEWS --> PRISMA
  API_DISPUTES & API_MSG & API_NOTIF & API_ADMIN --> PRISMA
  API_CATEGORIES --> PRISMA
  PRISMA --> DB
  API_PRODUCTS & API_STORES --> S3
  API_ORDERS & API_WALLET --> PAYMENT
  API_NOTIF --> MAIL
  SWAGGER --> API_AUTH & API_PRODUCTS & API_ORDERS
```

---

## Component 2 — Backend NestJS Module Dependencies

```mermaid
graph TD
  subgraph "🔐 Core Modules"
    AUTH[AuthModule\nJWT HttpOnly Cookies\nBcrypt / Rate Limiting\n/auth/*]
    USERS[UsersModule\nKYC Verification\n/users/*]
    PRISMA_MOD[PrismaModule\nPostgreSQL Client]
    REDIS_MOD[RedisModule\nCache & Session Store]
  end

  subgraph "🏬 Marketplace Modules"
    STORES[StoresModule\nKYC Documents\n/stores/*]
    PRODUCTS[ProductsModule\nSale & Rent\n/products/*]
    CATEGORIES[CategoriesModule\n/categories/*]
  end

  subgraph "📦 Transaction Modules"
    ORDERS[OrdersModule\nSplit Payment Logic\n/orders/*]
    RENTALS[RentalsModule\nDeposit + Calendar\n/rentals/*]
    WALLET[WalletModule\nCommissions + Withdrawal\n/wallet/*]
  end

  subgraph "💬 Communication Modules"
    MESSAGES[MessagesModule\n/messages/*]
    REVIEWS[ReviewsModule\n/reviews/*]
    DISPUTES[DisputesModule\nResolution Center\n/disputes/*]
    NOTIF[NotificationsModule\nSMTP / Push\n/notifications/*]
  end

  subgraph "🛡️ Admin & Docs"
    ADMIN[AdminModule\nCommissions / KYC\n/admin/*]
    SWAGGER_MOD[Swagger Module\n/api/docs]
  end

  AUTH --> PRISMA_MOD
  AUTH --> REDIS_MOD
  USERS --> PRISMA_MOD
  STORES --> PRISMA_MOD
  STORES --> USERS
  PRODUCTS --> PRISMA_MOD
  PRODUCTS --> STORES
  PRODUCTS --> CATEGORIES
  CATEGORIES --> PRISMA_MOD
  ORDERS --> PRISMA_MOD
  ORDERS --> REDIS_MOD
  ORDERS --> PRODUCTS
  ORDERS --> WALLET
  ORDERS --> NOTIF
  RENTALS --> PRISMA_MOD
  RENTALS --> PRODUCTS
  RENTALS --> NOTIF
  WALLET --> PRISMA_MOD
  REVIEWS --> PRISMA_MOD
  REVIEWS --> PRODUCTS
  DISPUTES --> PRISMA_MOD
  DISPUTES --> ORDERS
  DISPUTES --> RENTALS
  DISPUTES --> NOTIF
  MESSAGES --> PRISMA_MOD
  NOTIF --> PRISMA_MOD
  ADMIN --> USERS
  ADMIN --> STORES
  ADMIN --> PRODUCTS
  ADMIN --> ORDERS
  ADMIN --> WALLET
  ADMIN --> DISPUTES
  ADMIN --> PRISMA_MOD
  SWAGGER_MOD --> AUTH & PRODUCTS & ORDERS & RENTALS & WALLET
```

---

## Component 3 — Frontend React Module Structure

```mermaid
graph TB
  subgraph "🏠 Core"
    APP[App.tsx\nRouter & Providers]
    CTX[Context Providers\nAuth / Cart / Theme]
    HOOKS[Custom Hooks\nuseAuth / useCart / useApi]
    API_CLIENT[API Client\nAxios Instance\nJWT Interceptor\nHttpOnly Cookie Support]
  end

  subgraph "📄 Pages"
    PG_HOME[HomePage]
    PG_AUTH[Login / Register Pages]
    PG_PROD[ProductDetailPage]
    PG_CART[CartPage / CheckoutPage\nStripe Integration]
    PG_BUYER[Buyer Dashboard\nOrders / Rentals / Addresses]
    PG_SELLER[Seller Dashboard\nStore / Products / Wallet / KYC]
    PG_ADMIN[Admin Dashboard\nUsers / KYC / Finance / Disputes]
  end

  subgraph "🧩 Shared Components"
    HEADER[Header / Navbar]
    FOOTER[Footer]
    SIDEBAR[Sidebar / Filters]
    PRODUCT_CARD[ProductCard]
    MODAL[Modals / Dialogs]
    NOTIF_BADGE[Notification Badge]
    PAGINATION[Pagination]
    INVOICE[Invoice PDF Viewer]
  end

  APP --> CTX
  APP --> PG_HOME & PG_AUTH & PG_PROD & PG_CART
  APP --> PG_BUYER & PG_SELLER & PG_ADMIN
  CTX --> HOOKS
  HOOKS --> API_CLIENT
  PG_HOME --> HEADER & FOOTER & SIDEBAR & PRODUCT_CARD & PAGINATION
  PG_PROD --> PRODUCT_CARD & MODAL
  PG_CART --> MODAL & INVOICE
  PG_BUYER & PG_SELLER & PG_ADMIN --> NOTIF_BADGE & MODAL & INVOICE
```

---

## Component 4 — Authentication & Security Architecture

```mermaid
graph LR
  subgraph "Frontend"
    LOGIN_FORM[Login Form]
    COOKIE_STORE[HttpOnly Cookie\nRefreshToken — Secure]
    MEM_STORE[Memory / State\nAccessToken — Short-lived]
    AXIOS_INT[Axios Interceptor\nAuto token refresh on 401]
  end

  subgraph "Security Layers — NestJS"
    RATE_LIMIT[Rate Limiter\nMax 5 login attempts\nThen 15min block]
    JWT_GUARD[JwtAuthGuard\nValidates accessToken]
    ROLES_GUARD[RolesGuard\nBUYER / SELLER / SUPER_ADMIN]
    VALIDATION[class-validator\nInput Sanitization\nSQL Injection / XSS Prevention]
    AUTH_SVC[AuthService\nbcrypt.compare — password hash]
  end

  subgraph "Token Management"
    ACCESS_JWT[AccessToken\nExpires: 15 min\nPayload: userId + role\nSigned with JWT_SECRET]
    REFRESH_JWT[RefreshToken\nExpires: 7 days\nStored hashed in DB\nSent via HttpOnly Cookie]
    REDIS_SESSION[Redis\nBlacklist / Session Store\nRate Limit Counter]
  end

  LOGIN_FORM -->|POST /auth/login| RATE_LIMIT
  RATE_LIMIT --> AUTH_SVC
  AUTH_SVC --> ACCESS_JWT & REFRESH_JWT
  ACCESS_JWT --> MEM_STORE
  REFRESH_JWT --> COOKIE_STORE
  MEM_STORE --> AXIOS_INT
  AXIOS_INT -->|Bearer token| JWT_GUARD
  JWT_GUARD --> ROLES_GUARD
  ROLES_GUARD --> VALIDATION
  RATE_LIMIT --> REDIS_SESSION
```

---

## Component 5 — Payment & Commission Flow

```mermaid
graph TD
  subgraph "Checkout Process"
    BUYER[👤 Buyer Pays] -->|Total Amount| STRIPE[Stripe / Payment Gateway]
    STRIPE -->|Payment Confirmed| ORDERS_SVC[OrdersService]
  end

  subgraph "Split Payment Logic"
    ORDERS_SVC --> SPLIT[Split by Store]
    SPLIT --> COMM[Calculate Commission\nplatformRate × subtotal]
    COMM --> SELLER_WALLET[Seller pendingBalance\n+= sellerAmount]
    COMM --> PLATFORM[Platform Revenue\n+= commissionAmount]
  end

  subgraph "Wallet Release"
    DELIVERY[Buyer confirms delivery] --> RELEASE[pendingBalance → balance]
    RELEASE --> WITHDRAW[Seller requests withdrawal]
    WITHDRAW --> ADMIN_APPROVE[Admin approves]
    ADMIN_APPROVE --> BANK[Bank Transfer]
  end

  subgraph "Rental Deposit"
    RENTAL_PAY[Buyer pays rent + deposit] --> STRIPE
    RETURN[Equipment returned OK] --> REFUND[Deposit refunded via Stripe]
    DAMAGE[Damage detected] --> HOLD[Deposit withheld]
  end
```

---

## 📋 Technology Stack (Per readme2 & README3)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19 | UI Framework |
| **Frontend** | Vite | Latest | Build Tool — Fast HMR |
| **Frontend** | TypeScript | 5.x | Type Safety |
| **Frontend** | React Router | 7.x | Client-side Routing |
| **Frontend** | Context API | Built-in | State Management |
| **Frontend** | Axios | Latest | HTTP Client + JWT Interceptor |
| **Backend** | NestJS | 10.x | Modular API Framework |
| **Backend** | TypeScript | 5.x | Type Safety |
| **Backend** | Prisma ORM | 7.x | Database Access Layer |
| **Backend** | JWT + HttpOnly | Latest | Secure Authentication |
| **Backend** | bcrypt | Latest | Password Hashing |
| **Backend** | class-validator | Latest | Input Validation / XSS Prevention |
| **Backend** | Swagger/OpenAPI | Latest | API Documentation |
| **Database** | PostgreSQL | 15+ | Primary Relational Database |
| **Cache** | Redis | 7.x | Cart / Sessions / Rate Limiting |
| **Storage** | AWS S3 / Cloudinary | Latest | Images, Documents, PDFs |
| **Payment** | Stripe | Latest | Split Payments & Deposits |
| **Email** | SMTP / SendGrid | Latest | Notifications & Verification |
| **DevOps** | Docker + Compose | Latest | Containerization |
| **DevOps** | AWS / DigitalOcean | Latest | Cloud Hosting |
