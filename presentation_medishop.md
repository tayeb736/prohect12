# 🏥 MediShop Pro — Complete Project Presentation
## B2B Medical Equipment Marketplace — Academic Presentation

---

> **MediShop Pro** is a **multi-vendor** e-commerce platform specialized in the purchase and **rental** of medical equipment in Algeria. It connects **buyers** (hospitals, clinics, doctors) with certified **sellers**, under the supervision of a platform **administrator**.

---

## 🏗️ 1. Global System Architecture (3-Tier)

```mermaid
graph TD
  subgraph "🖥️ FRONTEND — React 19 + TypeScript"
    A1[Home & Shop Page]
    A2[Buyer Dashboard]
    A3[Seller Dashboard]
    A4[Admin Dashboard]
    A5[Cart & Checkout]
    A6[Messaging & Notifications]
  end

  subgraph "⚙️ BACKEND — NestJS + TypeScript"
    B1[AuthModule — JWT / Bcrypt]
    B2[ProductsModule]
    B3[OrdersModule]
    B4[RentalsModule]
    B5[StoresModule]
    B6[WalletModule]
    B7[MessagesModule]
    B8[ReviewsModule]
    B9[DisputesModule]
    B10[AdminModule]
    B11[NotificationsModule]
  end

  subgraph "🗄️ DATABASE — PostgreSQL + Prisma ORM"
    C1[(28 Tables / Models)]
  end

  A1 & A2 & A3 & A4 & A5 & A6 -->|HTTP REST API + JWT| B1
  B1 & B2 & B3 & B4 & B5 & B6 & B7 & B8 & B9 & B10 & B11 -->|Prisma Client| C1
```

---

## 👥 2. The 3 User Roles

```mermaid
graph LR
  subgraph "BUYER"
    B1[Register]
    B2[Browse products]
    B3[Buy / Rent]
    B4[Track orders]
    B5[Message seller]
    B6[Open a dispute]
    B7[Leave a review]
  end

  subgraph "SELLER"
    S1[Register + KYC verification]
    S2[Create store]
    S3[Add products]
    S4[Manage received orders]
    S5[Withdraw earnings — Wallet]
    S6[Reply to reviews]
  end

  subgraph "SUPER_ADMIN"
    A1[Approve stores (KYC)]
    A2[Approve products]
    A3[Manage all users]
    A4[View all transactions]
    A5[Resolve disputes]
    A6[Manage platform settings]
  end
```

---

## 🔄 3. Main Business Workflows

### Flow 1 — Seller Registration & Activation

```mermaid
sequenceDiagram
  actor Seller
  participant Frontend
  participant AuthService
  participant Database
  actor Admin

  Seller->>Frontend: Fill registration form (SELLER)
  Frontend->>AuthService: POST /auth/register {role: SELLER}
  AuthService->>Database: Create User (status: PENDING)
  AuthService->>Database: Create SellerProfile (verificationStatus: PENDING)
  AuthService-->>Frontend: accessToken + refreshToken
  
  Seller->>Frontend: Create store + upload documents
  Frontend->>Database: POST /stores (Store created, isVerified: false)
  
  Admin->>Frontend: View store in Admin Dashboard
  Admin->>Frontend: Approve store
  Frontend->>Database: Store.isVerified = true, SellerProfile.verificationStatus = APPROVED
  Frontend-->>Seller: Notification — Store approved ✅
```

---

### Flow 2 — Purchasing a Product (Multi-Vendor)

```mermaid
sequenceDiagram
  actor Buyer
  participant Frontend
  participant OrdersService
  participant WalletService
  participant Database

  Buyer->>Frontend: Add products to cart (multiple sellers)
  Buyer->>Frontend: Confirm order
  
  Frontend->>OrdersService: POST /orders {items: [...]}
  OrdersService->>Database: Group items by Store
  
  loop For each Store
    OrdersService->>Database: Create SubOrder
    OrdersService->>Database: Create OrderItems
    OrdersService->>WalletService: Add sellerAmount to pendingBalance
    OrdersService->>Database: Decrement Product Stock
  end
  
  OrdersService->>Database: Create main Order
  OrdersService-->>Frontend: Order created ✅
  
  Buyer->>Frontend: Confirm delivery received (confirm-delivery)
  Frontend->>OrdersService: POST /orders/:id/confirm-delivery
  OrdersService->>Database: pendingBalance → balance (Funds available to seller)
  OrdersService->>Database: Transaction.status = PAID
```

---

### Flow 3 — Equipment Rental

```mermaid
sequenceDiagram
  actor Buyer
  participant Frontend
  participant RentalsService
  participant Database

  Buyer->>Frontend: Choose RENT product
  Buyer->>Frontend: Select dates (startDate → endDate)
  Frontend->>Database: Check RentalCalendar (availability)
  
  Buyer->>Frontend: Confirm rental
  Frontend->>RentalsService: POST /rentals
  
  RentalsService->>Database: Create Rental
  RentalsService->>Database: Create RentalItems
  RentalsService->>Database: Block dates in RentalCalendar
  RentalsService->>Database: Record security deposit (depositAmount)
  RentalsService-->>Frontend: Rental created ✅ + PDF contract

  Buyer->>Frontend: Return equipment
  Frontend->>RentalsService: PUT /rentals/:id/return
  RentalsService->>Database: Rental.status = RETURNED
  RentalsService->>Database: Free dates in RentalCalendar
  RentalsService->>Database: Refund deposit if no damages
```

---

### Flow 4 — Earnings Withdrawal (Seller)

```mermaid
sequenceDiagram
  actor Seller
  participant Frontend
  participant WalletService
  participant Database
  actor Admin

  Seller->>Frontend: View Wallet (available balance)
  Frontend->>WalletService: GET /wallet/me
  WalletService-->>Frontend: {balance: 5000 DZD, pendingBalance: 2000 DZD}

  Seller->>Frontend: Request withdrawal (3000 DZD)
  Frontend->>WalletService: POST /wallet/withdraw {amount: 3000}
  WalletService->>Database: wallet.balance -= 3000
  WalletService->>Database: Create Withdrawal (status: PENDING)
  WalletService->>Database: Create Transaction (type: WITHDRAWAL)

  Admin->>Frontend: View withdrawal requests
  Admin->>Frontend: Approve withdrawal
  Frontend->>Database: Withdrawal.status = COMPLETED
  Frontend-->>Seller: Notification — Transfer completed ✅
```

---

## 🌐 4. REST API — Main Endpoints

| Module | Method | Endpoint | Required Role |
|--------|---------|----------|-------------|
| **Auth** | POST | `/auth/register` | Public |
| | POST | `/auth/login` | Public |
| | GET | `/auth/me` | Authenticated |
| | POST | `/auth/logout` | Authenticated |
| **Products** | GET | `/products` | Public |
| | GET | `/products/:id` | Public |
| | POST | `/products` | SELLER |
| | PATCH | `/products/:id` | SELLER |
| | DELETE | `/products/:id` | SELLER |
| **Orders** | POST | `/orders` | BUYER |
| | GET | `/orders/my-orders` | BUYER |
| | GET | `/orders/store/:id` | SELLER |
| | POST | `/orders/:id/confirm-delivery` | BUYER |
| **Rentals** | POST | `/rentals` | BUYER |
| | GET | `/rentals/my-rentals` | BUYER |
| | PUT | `/rentals/:id/return` | BUYER |
| **Stores** | POST | `/stores` | SELLER |
| | GET | `/stores/my-store` | SELLER |
| | GET | `/stores/:slug` | Public |
| **Wallet** | GET | `/wallet/me` | Authenticated |
| | POST | `/wallet/withdraw` | SELLER |
| **Admin** | GET | `/admin/stats` | SUPER_ADMIN |
| | POST | `/admin/stores/:id/verify` | SUPER_ADMIN |
| | POST | `/admin/users/:id/suspend` | SUPER_ADMIN |
| **Messages** | GET | `/messages/conversations` | Authenticated |
| | POST | `/messages/send` | Authenticated |
| **Reviews** | POST | `/reviews` | BUYER |
| | GET | `/reviews/product/:id` | Public |
| **Disputes** | POST | `/disputes` | BUYER |
| | GET | `/disputes` | Authenticated |

---

## 🛠️ 5. Technology Stack

```mermaid
graph LR
  subgraph "Frontend"
    F1["⚛️ React 19"]
    F2["⚡ Vite"]
    F3["🎨 TailwindCSS"]
    F4["🌐 Axios"]
  end

  subgraph "Backend"
    B1["⚙️ NestJS"]
    B2["🔷 TypeScript"]
    B3["🛡️ JWT & Bcrypt"]
    B4["📚 Swagger"]
  end

  subgraph "Database & Infrastructure"
    D1["🐘 PostgreSQL"]
    D2["📐 Prisma ORM"]
    D3["🐳 Docker"]
    D4["☁️ AWS S3 / Redis"]
  end

  F1 & F2 & F3 & F4 --> B1
  B1 & B2 & B3 & B4 --> D1
  D1 --> D2 & D3 & D4
```
