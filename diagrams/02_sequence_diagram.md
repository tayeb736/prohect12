# 🔄 Sequence Diagrams — MediShop Pro
## All Main System Workflows (PostgreSQL + Redis + Stripe + HttpOnly Cookies)

---

## Sequence 1 — User Registration & Email Verification

```mermaid
sequenceDiagram
  actor User
  participant Browser as Frontend (React 19)
  participant API as Backend (NestJS)
  participant DB as PostgreSQL (Prisma 7)
  participant Mail as SendGrid / SMTP

  User->>Browser: Fill registration form (email, password, role)
  Browser->>API: POST /auth/register { email, password, role }
  API->>API: class-validator — sanitize & validate inputs
  API->>DB: Check if email already exists
  DB-->>API: Email not found ✅
  API->>API: bcrypt.hash(password, 12)
  API->>DB: Create User { status: PENDING, emailVerified: false }
  API->>DB: Create BuyerProfile or SellerProfile
  API->>Mail: Send verification email with signed token
  Mail-->>User: Email with verification link
  API-->>Browser: 201 Created { message: "Check your email" }
  Browser-->>User: "Please verify your email" screen

  User->>Browser: Click verification link
  Browser->>API: GET /auth/verify-email?token=xxx
  API->>DB: Update User { emailVerified: true, status: ACTIVE }
  API-->>Browser: { success: true }
  Browser-->>User: Account activated ✅ — Redirect to Dashboard
```

---

## Sequence 2 — Secure Login (JWT + HttpOnly Cookie)

```mermaid
sequenceDiagram
  actor User
  participant Browser as Frontend (React 19)
  participant Redis as Redis Cache
  participant API as Backend (NestJS)
  participant DB as PostgreSQL (Prisma 7)

  User->>Browser: Enter email & password
  Browser->>API: POST /auth/login { email, password }

  API->>Redis: Check rate limit for this IP
  alt Too Many Attempts (> 5)
    Redis-->>API: BLOCKED
    API-->>Browser: 429 Too Many Requests — Wait 15 minutes
    Browser-->>User: Account temporarily locked 🔒
  else Attempts OK
    Redis-->>API: Allowed ✅
    API->>DB: Find User by email
    DB-->>API: User record
    API->>API: bcrypt.compare(password, hash)
    alt Wrong Password
      API->>Redis: Increment fail counter for IP
      API-->>Browser: 401 Unauthorized
      Browser-->>User: "Invalid credentials" error
    else Correct Password
      API->>DB: Update User { lastLoginAt: now() }
      API->>API: Sign accessToken (15min) — JWT_SECRET
      API->>API: Sign refreshToken (7 days) — REFRESH_SECRET
      API->>DB: Save bcrypt(refreshToken) in User record
      API-->>Browser: Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict
      API-->>Browser: { accessToken, user: { id, role, email } }
      Browser->>Browser: Store accessToken in memory (not localStorage)
      Browser-->>User: Redirect to role-based Dashboard
    end
  end
```

---

## Sequence 3 — Seller KYC & Store Approval

```mermaid
sequenceDiagram
  actor Seller
  actor Admin as Super Admin
  participant Browser as Frontend (React 19)
  participant API as Backend (NestJS)
  participant DB as PostgreSQL (Prisma 7)
  participant S3 as AWS S3 / Cloudinary
  participant Notif as SendGrid / Notifications

  Seller->>Browser: Fill store creation form
  Browser->>API: POST /stores { name, wilaya, taxId, description }
  API->>DB: Create Store { isVerified: false }
  API-->>Browser: Store created ✅

  Seller->>Browser: Upload KYC documents (RC, tax, health license)
  Browser->>API: POST /stores/:id/documents { type, file }
  API->>S3: Upload file → returns fileUrl
  S3-->>API: fileUrl ✅
  API->>DB: Create StoreDocument { fileUrl, status: PENDING }
  API->>Notif: Notify Admin — New store pending KYC review
  Notif-->>Admin: Email + Dashboard notification

  Admin->>Browser: View pending stores
  Browser->>API: GET /admin/stores?status=pending (Swagger documented)
  API->>DB: Fetch stores with documents
  API-->>Browser: Store list with S3 document URLs

  Admin->>Browser: Download & review documents from S3
  Admin->>Browser: Approve store
  Browser->>API: POST /admin/stores/:id/verify { action: APPROVE }
  API->>DB: Update Store { isVerified: true }
  API->>DB: Update SellerProfile { verificationStatus: APPROVED }
  API->>Notif: Email Seller — "Your store is approved ✅"
  Notif-->>Seller: Email notification
```

---

## Sequence 4 — Add to Cart (Redis Cached)

```mermaid
sequenceDiagram
  actor Buyer
  participant Browser as Frontend (React 19)
  participant API as Backend (NestJS)
  participant Redis as Redis Cache
  participant DB as PostgreSQL

  Buyer->>Browser: Click "Add to Cart" on product
  Browser->>API: POST /cart/add { productId, quantity }
  API->>DB: Fetch product (price, stock, status: ACTIVE)
  DB-->>API: Product data ✅

  alt Out of Stock
    API-->>Browser: 400 Bad Request — Out of stock
    Browser-->>Buyer: "Product unavailable" message
  else In Stock
    API->>Redis: GET cart:{userId}
    Redis-->>API: Existing cart items (JSON)
    API->>API: Merge new item into cart
    API->>Redis: SET cart:{userId} { items: [...] } EX 86400
    Redis-->>API: Saved ✅
    API-->>Browser: { cart: { items, total } }
    Browser-->>Buyer: Cart updated ✅
  end

  note over Redis: Cart stored in Redis\nTTL: 24 hours\nNo DB write needed for cart
```

---

## Sequence 5 — Multi-Vendor Checkout & Stripe Payment

```mermaid
sequenceDiagram
  actor Buyer
  participant Browser as Frontend (React 19)
  participant API as Backend (NestJS)
  participant Redis as Redis Cache
  participant Stripe as Stripe API
  participant DB as PostgreSQL
  participant Notif as SendGrid / Notifications

  Buyer->>Browser: Proceed to checkout
  Browser->>API: POST /orders/checkout { shippingAddressId, promoCode? }
  API->>Redis: GET cart:{userId} — Load cart
  Redis-->>API: Cart items with stores

  API->>DB: Validate all products (ACTIVE, stock available)
  API->>DB: Apply promo code discount (if valid)

  API->>Stripe: Create PaymentIntent { amount: totalDZD, currency: "dzd" }
  Stripe-->>API: { clientSecret, paymentIntentId }
  API-->>Browser: { clientSecret } — for Stripe.js

  Browser->>Stripe: Stripe.js — Confirm payment with card details
  Stripe-->>Browser: Payment confirmed ✅

  Browser->>API: POST /orders/confirm { paymentIntentId }
  API->>Stripe: Verify payment status
  Stripe-->>API: PaymentIntent { status: "succeeded" }

  loop For Each Store in Cart
    API->>DB: Create SubOrder { storeId, subtotal, commissionAmount }
    API->>DB: Create OrderItems
    API->>DB: Decrement Product.stock
    API->>DB: Seller Wallet pendingBalance += sellerAmount
    API->>DB: Create Transaction { type: SALE, status: PENDING }
    API->>Notif: Email Seller — "New order received 📦"
  end

  API->>DB: Create Order { paymentStatus: PAID, paymentIntentId }
  API->>Redis: DEL cart:{userId} — Clear cart
  API->>DB: Generate Tax Invoice PDF → upload to S3
  API->>Notif: Email Buyer — Order confirmation + Invoice PDF link
  API-->>Browser: { order: { orderNumber, invoiceUrl } }
  Browser-->>Buyer: Order confirmation page ✅
```

---

## Sequence 6 — Delivery Confirmation & Wallet Release

```mermaid
sequenceDiagram
  actor Buyer
  actor Seller
  participant Browser as Frontend
  participant API as Backend (NestJS)
  participant DB as PostgreSQL
  participant Notif as Notifications

  Seller->>Browser: Mark SubOrder as SHIPPED + tracking number
  Browser->>API: PATCH /orders/suborders/:id { status: SHIPPED, trackingNumber }
  API->>DB: Update SubOrder { status: SHIPPED, trackingNumber }
  API->>Notif: Email Buyer — "Your order is on the way 🚚"

  Buyer->>Browser: Confirm delivery received
  Browser->>API: POST /orders/:id/confirm-delivery
  API->>DB: Update Order { status: DELIVERED }

  loop For Each SubOrder
    API->>DB: SubOrder { status: DELIVERED }
    API->>DB: Move pendingBalance → balance (sellerAmount)
    API->>DB: Update Transaction { status: PAID }
  end

  API->>Notif: Email Seller — "Funds of X DZD released to your wallet 💰"
  API-->>Browser: Delivery confirmed ✅
```

---

## Sequence 7 — Equipment Rental with Deposit

```mermaid
sequenceDiagram
  actor Buyer
  participant Browser as Frontend
  participant API as Backend (NestJS)
  participant Stripe as Stripe API
  participant DB as PostgreSQL
  participant S3 as AWS S3

  Buyer->>Browser: Select RENT product + dates
  Browser->>API: GET /products/:id/rental-calendar
  API->>DB: Fetch RentalCalendar (blocked dates)
  API-->>Browser: Available date ranges

  Buyer->>Browser: Confirm rental (rent amount + deposit)
  Browser->>API: POST /rentals { productId, startDate, endDate }

  API->>Stripe: Charge (rentAmount + depositAmount)
  Stripe-->>API: Payment confirmed ✅

  API->>DB: Create Rental { status: PENDING, depositAmount }
  API->>DB: Create RentalItems
  API->>DB: Block dates in RentalCalendar { isBlocked: true }
  API->>DB: Generate Rental Contract PDF
  API->>S3: Upload contract PDF → contractUrl
  S3-->>API: contractUrl ✅
  API->>DB: Update Rental { contractUrl }
  API-->>Browser: Rental created ✅ + contractUrl (PDF download)

  Buyer->>Browser: Return equipment
  Browser->>API: PUT /rentals/:id/return
  API->>DB: Update Rental { status: RETURNED, returnedAt: now() }
  API->>DB: Free RentalCalendar dates { isBlocked: false }

  alt No Damage
    API->>Stripe: Refund depositAmount to Buyer
    Stripe-->>API: Refund successful ✅
    API->>DB: Update Rental { depositStatus: REFUNDED }
  else Damage Reported
    API->>DB: Update Rental { depositStatus: WITHHELD }
    API-->>Buyer: Deposit withheld — dispute can be opened
  end
```

---

## Sequence 8 — Seller Withdrawal

```mermaid
sequenceDiagram
  actor Seller
  actor Admin
  participant Browser as Frontend
  participant API as Backend (NestJS)
  participant DB as PostgreSQL
  participant Notif as Notifications

  Seller->>Browser: View wallet
  Browser->>API: GET /wallet/me (Bearer accessToken)
  API->>DB: Fetch Wallet { balance, pendingBalance }
  API-->>Browser: Wallet data

  Seller->>Browser: Request withdrawal { amount, bankName, accountNumber }
  Browser->>API: POST /wallet/withdraw
  API->>DB: Verify balance >= amount
  API->>DB: Wallet.balance -= amount
  API->>DB: Create Withdrawal { status: PENDING }
  API->>DB: Create Transaction { type: WITHDRAWAL, status: PENDING }
  API->>Notif: Email Admin — New withdrawal pending

  Admin->>Browser: Review withdrawal request
  Browser->>API: GET /admin/withdrawals?status=PENDING
  Admin->>Browser: Approve withdrawal
  Browser->>API: PATCH /admin/withdrawals/:id/approve
  API->>DB: Withdrawal { status: COMPLETED, processedAt: now() }
  API->>DB: Transaction { status: PAID }
  API->>Notif: Email Seller — "Withdrawal processed ✅"
```

---

## Sequence 9 — Dispute Opening & Resolution

```mermaid
sequenceDiagram
  actor Buyer
  actor Seller
  actor Admin
  participant Browser as Frontend
  participant API as Backend (NestJS)
  participant DB as PostgreSQL
  participant Stripe as Stripe API

  Buyer->>Browser: Open dispute on order
  Browser->>API: POST /disputes { orderId, subject, description }
  API->>DB: Create Dispute { status: OPEN }
  API-->>Admin: Alert — New dispute opened
  API-->>Seller: Alert — Dispute opened against your order

  Buyer->>Browser: Send dispute message + attach evidence
  Browser->>API: POST /disputes/:id/messages { message }
  API->>DB: Create DisputeMessage

  Admin->>Browser: Review full dispute thread
  Browser->>API: GET /disputes/:id
  API->>DB: Fetch Dispute + all messages
  API->>DB: Update Dispute { status: UNDER_REVIEW }

  Admin->>Browser: Resolve — Refund to Buyer
  Browser->>API: PATCH /disputes/:id/resolve { winner: BUYER }
  API->>Stripe: Issue refund to Buyer card
  Stripe-->>API: Refund processed ✅
  API->>DB: Dispute { status: RESOLVED, resolution }
  API-->>Buyer: Email — "Refund processed ✅"
  API-->>Seller: Email — "Dispute resolved — funds reversed"
```

---

## Sequence 10 — Token Refresh (HttpOnly Cookie)

```mermaid
sequenceDiagram
  participant Browser as Frontend (React 19)
  participant API as Backend (NestJS)
  participant DB as PostgreSQL

  Browser->>API: GET /products (expired accessToken in header)
  API-->>Browser: 401 Unauthorized — Token expired

  Browser->>API: POST /auth/refresh\n(refreshToken sent automatically via HttpOnly Cookie)
  API->>API: Read refreshToken from Cookie (not body — XSS safe)
  API->>DB: Find User with matching refreshToken hash
  API->>API: bcrypt.compare(cookieToken, dbHash)

  alt Valid Refresh Token
    API->>API: Sign new accessToken (15min)
    API->>API: Rotate refreshToken (7 days)
    API->>DB: Update User { refreshToken: newHash }
    API-->>Browser: Set-Cookie: refreshToken=newToken; HttpOnly; Secure
    API-->>Browser: { accessToken: newAccessToken }
    Browser->>Browser: Update accessToken in memory
    Browser->>API: Retry GET /products with new accessToken
    API-->>Browser: Products data ✅
  else Expired or Tampered
    API->>DB: Clear refreshToken from User
    API-->>Browser: 401 — Session expired
    Browser->>Browser: Redirect to Login page
  end
```
