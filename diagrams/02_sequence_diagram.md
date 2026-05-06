# 🔄 Sequence Diagrams — MediShop Pro
## All Main System Workflows — Interaction Over Time

---

## Sequence 1 — User Registration & Email Verification

```mermaid
sequenceDiagram
  actor User
  participant Browser as Frontend (React)
  participant API as Backend (NestJS)
  participant DB as Database (SQLite/Prisma)
  participant Mail as Email Service

  User->>Browser: Fill registration form (email, password, role)
  Browser->>API: POST /auth/register { email, password, role }
  API->>DB: Check if email already exists
  DB-->>API: Email not found (OK)
  API->>DB: Create User { status: PENDING, emailVerified: false }
  API->>DB: Create BuyerProfile or SellerProfile
  API->>Mail: Send verification email with token
  Mail-->>User: Email with verification link
  API-->>Browser: { accessToken, refreshToken, user }
  Browser-->>User: Redirect to Dashboard (PENDING state)

  User->>Browser: Click verification link in email
  Browser->>API: GET /auth/verify-email?token=xxx
  API->>DB: Update User { emailVerified: true, status: ACTIVE }
  API-->>Browser: { success: true }
  Browser-->>User: Account activated ✅
```

---

## Sequence 2 — User Login & JWT Authentication

```mermaid
sequenceDiagram
  actor User
  participant Browser as Frontend (React)
  participant API as Backend (NestJS)
  participant DB as Database (SQLite/Prisma)

  User->>Browser: Enter email & password
  Browser->>API: POST /auth/login { email, password }
  API->>DB: Find User by email
  DB-->>API: User record found
  API->>API: bcrypt.compare(password, hash)
  
  alt Wrong Password
    API-->>Browser: 401 Unauthorized
    Browser-->>User: "Invalid credentials" error
  else Correct Password
    API->>DB: Update User { lastLoginAt: now() }
    API->>API: Sign JWT accessToken (15min) + refreshToken (7d)
    API->>DB: Save refreshToken hash in User
    API-->>Browser: { accessToken, refreshToken, user: { id, role, email } }
    Browser->>Browser: Store tokens in localStorage
    Browser-->>User: Redirect to role-based Dashboard
  end
```

---

## Sequence 3 — Seller Store Creation & Admin Approval

```mermaid
sequenceDiagram
  actor Seller
  actor Admin as Super Admin
  participant Browser as Frontend (React)
  participant API as Backend (NestJS)
  participant DB as Database (SQLite/Prisma)
  participant Notif as Notifications Service

  Seller->>Browser: Fill store creation form
  Browser->>API: POST /stores { name, wilaya, taxId, description }
  API->>DB: Check SellerProfile (verificationStatus must be PENDING or APPROVED)
  API->>DB: Create Store { isVerified: false }
  API-->>Browser: Store created ✅ (awaiting verification)
  Browser-->>Seller: Show store dashboard (unverified)

  Seller->>Browser: Upload legal documents (RC, tax, etc.)
  Browser->>API: POST /stores/:id/documents { type, fileUrl }
  API->>DB: Create StoreDocument { status: PENDING }
  API-->>Browser: Documents uploaded ✅

  API->>Notif: Notify Admin — New store pending review
  Notif->>Admin: Dashboard notification

  Admin->>Browser: View pending stores in Admin Dashboard
  Browser->>API: GET /admin/stores?status=pending
  API->>DB: Fetch all unverified stores with documents
  API-->>Browser: List of pending stores

  Admin->>Browser: Review documents & approve store
  Browser->>API: POST /admin/stores/:id/verify { action: APPROVE }
  API->>DB: Update Store { isVerified: true }
  API->>DB: Update SellerProfile { verificationStatus: APPROVED }
  API->>Notif: Notify Seller — Store approved
  Notif-->>Seller: "Your store has been approved ✅"
  API-->>Browser: Success
```

---

## Sequence 4 — Product Listing & Admin Approval

```mermaid
sequenceDiagram
  actor Seller
  actor Admin as Super Admin
  participant Browser as Frontend (React)
  participant API as Backend (NestJS)
  participant DB as Database (SQLite/Prisma)

  Seller->>Browser: Fill product form (name, price, type, images)
  Browser->>API: POST /products { name, type, salePrice, categoryId, storeId }
  API->>DB: Verify store belongs to this seller
  API->>DB: Create Product { status: PENDING_REVIEW }
  API-->>Browser: Product created, awaiting admin review

  Seller->>Browser: Upload product images
  Browser->>API: POST /products/:id/images { url, isPrimary }
  API->>DB: Create ProductImage records
  API-->>Browser: Images uploaded ✅

  Admin->>Browser: View products pending review
  Browser->>API: GET /admin/products?status=PENDING_REVIEW
  API->>DB: Fetch pending products
  API-->>Browser: List of products to review

  Admin->>Browser: Approve product
  Browser->>API: PATCH /admin/products/:id/status { status: ACTIVE }
  API->>DB: Update Product { status: ACTIVE }
  API-->>Browser: Product now live on platform ✅

  alt Admin Rejects
    Admin->>Browser: Reject with reason
    Browser->>API: PATCH /admin/products/:id/status { status: REJECTED, reason: "..." }
    API->>DB: Update Product { status: REJECTED }
    API-->>Seller: Notification — Product rejected with reason
  end
```

---

## Sequence 5 — Multi-Vendor Purchase & Checkout

```mermaid
sequenceDiagram
  actor Buyer
  participant Browser as Frontend (React)
  participant API as Backend (NestJS)
  participant OrdersSvc as Orders Service
  participant WalletSvc as Wallet Service
  participant DB as Database (SQLite/Prisma)
  participant Notif as Notifications Service

  Buyer->>Browser: Add products from multiple stores to cart
  Browser->>Browser: Cart stored in localStorage

  Buyer->>Browser: Proceed to checkout
  Browser->>API: POST /orders { items: [...], shippingAddressId, promoCode? }
  
  API->>OrdersSvc: Process order creation
  OrdersSvc->>DB: Validate all products (ACTIVE, sufficient stock)
  OrdersSvc->>DB: Apply promo code discount if valid

  loop For Each Store in Order
    OrdersSvc->>DB: Create SubOrder { storeId, subtotal, commissionAmount }
    OrdersSvc->>DB: Create OrderItems for that SubOrder
    OrdersSvc->>DB: Decrement Product.stock
    OrdersSvc->>WalletSvc: Credit sellerAmount to Seller pendingBalance
    WalletSvc->>DB: Update Seller Wallet { pendingBalance += sellerAmount }
    WalletSvc->>DB: Create Transaction { type: SALE, status: PENDING }
    OrdersSvc->>Notif: Notify Seller — New order received
  end

  OrdersSvc->>DB: Create Order { totalAmount, paymentStatus: PAID }
  API-->>Browser: { order: { orderNumber, status } }
  Browser-->>Buyer: Order confirmation page ✅

  Notif-->>Buyer: "Order placed successfully"
  Notif-->>Seller: "You have a new order"
```

---

## Sequence 6 — Order Delivery Confirmation & Wallet Release

```mermaid
sequenceDiagram
  actor Buyer
  actor Seller
  participant Browser as Frontend (React)
  participant API as Backend (NestJS)
  participant DB as Database (SQLite/Prisma)
  participant Notif as Notifications Service

  Seller->>Browser: Mark SubOrder as SHIPPED + tracking number
  Browser->>API: PATCH /orders/suborders/:id { status: SHIPPED, trackingNumber }
  API->>DB: Update SubOrder { status: SHIPPED, trackingNumber }
  API->>Notif: Notify Buyer — Package shipped
  Notif-->>Buyer: "Your order has been shipped 🚚"

  Buyer->>Browser: Confirm delivery received
  Browser->>API: POST /orders/:id/confirm-delivery
  API->>DB: Update Order { status: DELIVERED }
  API->>DB: Update all SubOrders { status: DELIVERED }
  
  loop For Each SubOrder
    API->>DB: Move sellerAmount from pendingBalance → balance
    API->>DB: Update Transaction { status: PAID }
  end

  API->>Notif: Notify Seller — Funds released
  Notif-->>Seller: "Payment of X DZD is now available 💰"
  API-->>Browser: Delivery confirmed ✅
```

---

## Sequence 7 — Equipment Rental Lifecycle

```mermaid
sequenceDiagram
  actor Buyer
  actor Seller
  participant Browser as Frontend (React)
  participant API as Backend (NestJS)
  participant DB as Database (SQLite/Prisma)

  Buyer->>Browser: Select RENT product
  Browser->>API: GET /products/:id/rental-calendar
  API->>DB: Fetch RentalCalendar (blocked dates)
  API-->>Browser: Available date ranges

  Buyer->>Browser: Select startDate & endDate
  Buyer->>Browser: Confirm rental (+ deposit)
  Browser->>API: POST /rentals { productId, startDate, endDate, quantity }
  
  API->>DB: Validate dates not blocked
  API->>DB: Create Rental { status: PENDING, depositAmount }
  API->>DB: Create RentalItems
  API->>DB: Block dates in RentalCalendar { isBlocked: true }
  API-->>Browser: Rental created ✅ + contract PDF URL

  Seller->>Browser: Confirm rental request
  Browser->>API: PATCH /rentals/:id/status { status: CONFIRMED }
  API->>DB: Update Rental { status: CONFIRMED }

  note over API,DB: Rental period starts
  API->>DB: Update Rental { status: ACTIVE }

  Buyer->>Browser: Return equipment
  Browser->>API: PUT /rentals/:id/return
  API->>DB: Update Rental { status: RETURNED, returnedAt: now() }
  API->>DB: Free dates in RentalCalendar { isBlocked: false }
  
  alt No Damage
    API->>DB: Refund depositAmount to Buyer wallet
    API-->>Browser: Deposit refunded ✅
  else Damage Reported
    API->>DB: Keep deposit { depositStatus: WITHHELD }
    API-->>Buyer: Deposit withheld — dispute may be opened
  end
```

---

## Sequence 8 — Seller Withdrawal Request

```mermaid
sequenceDiagram
  actor Seller
  actor Admin as Super Admin
  participant Browser as Frontend (React)
  participant API as Backend (NestJS)
  participant DB as Database (SQLite/Prisma)
  participant Notif as Notifications Service

  Seller->>Browser: View wallet balance
  Browser->>API: GET /wallet/me
  API->>DB: Fetch Wallet { balance, pendingBalance, totalEarned }
  API-->>Browser: Wallet data

  Seller->>Browser: Request withdrawal (amount, bank details)
  Browser->>API: POST /wallet/withdraw { amount: 3000, bankName, accountNumber }
  
  API->>DB: Check wallet.balance >= amount
  API->>DB: Deduct amount: wallet.balance -= 3000
  API->>DB: Create Withdrawal { status: PENDING, amount: 3000 }
  API->>DB: Create Transaction { type: WITHDRAWAL, status: PENDING }
  API->>Notif: Notify Admin — Withdrawal request pending
  Notif-->>Admin: Dashboard alert

  Admin->>Browser: Review withdrawal request
  Browser->>API: GET /admin/withdrawals?status=PENDING
  API-->>Browser: List of pending requests

  Admin->>Browser: Approve withdrawal
  Browser->>API: PATCH /admin/withdrawals/:id/approve
  API->>DB: Update Withdrawal { status: COMPLETED, processedAt: now() }
  API->>DB: Update Transaction { status: PAID }
  API->>Notif: Notify Seller — Withdrawal processed
  Notif-->>Seller: "Your withdrawal of 3000 DZD has been processed ✅"
```

---

## Sequence 9 — Dispute Opening & Resolution

```mermaid
sequenceDiagram
  actor Buyer
  actor Seller
  actor Admin as Super Admin
  participant Browser as Frontend (React)
  participant API as Backend (NestJS)
  participant DB as Database (SQLite/Prisma)
  participant Notif as Notifications Service

  Buyer->>Browser: Open dispute on an order
  Browser->>API: POST /disputes { orderId, subject, description }
  API->>DB: Create Dispute { status: OPEN, openedById: buyerId }
  API->>Notif: Notify Admin & Seller
  Notif-->>Admin: New dispute opened
  Notif-->>Seller: "A dispute has been opened against your order"

  Buyer->>Browser: Send dispute message
  Browser->>API: POST /disputes/:id/messages { message, attachments? }
  API->>DB: Create DisputeMessage { senderId: buyerId }

  Seller->>Browser: View dispute & reply
  Browser->>API: POST /disputes/:id/messages { message }
  API->>DB: Create DisputeMessage { senderId: sellerId }

  Admin->>Browser: Review all dispute messages
  Browser->>API: GET /disputes/:id
  API->>DB: Fetch Dispute + DisputeMessages
  API-->>Browser: Full dispute thread

  API->>DB: Update Dispute { status: UNDER_REVIEW }

  Admin->>Browser: Resolve dispute in favor of Buyer
  Browser->>API: PATCH /disputes/:id/resolve { resolution: "Refund approved", winner: BUYER }
  API->>DB: Update Dispute { status: RESOLVED, resolution, resolvedAt: now() }
  API->>DB: Process refund to Buyer wallet
  API->>Notif: Notify both Buyer and Seller
  Notif-->>Buyer: "Dispute resolved — refund processed ✅"
  Notif-->>Seller: "Dispute resolved — check resolution"
```

---

## Sequence 10 — Messaging Between Buyer & Seller

```mermaid
sequenceDiagram
  actor Buyer
  actor Seller
  participant Browser as Frontend (React)
  participant API as Backend (NestJS)
  participant DB as Database (SQLite/Prisma)

  Buyer->>Browser: Click "Contact Seller" on product page
  Browser->>API: POST /messages/conversations { productId, receiverId: sellerId }
  API->>DB: Find or Create Conversation { productId }
  API-->>Browser: conversationId

  Buyer->>Browser: Type and send message
  Browser->>API: POST /messages/send { conversationId, content }
  API->>DB: Create Message { senderId: buyerId, receiverId: sellerId, isRead: false }
  API-->>Browser: Message sent ✅

  Seller->>Browser: Open conversations list
  Browser->>API: GET /messages/conversations
  API->>DB: Fetch conversations with latest message
  API-->>Browser: Conversation list with unread counts

  Seller->>Browser: Open conversation with Buyer
  Browser->>API: GET /messages/conversations/:id/messages
  API->>DB: Fetch all messages in conversation
  API->>DB: Update { isRead: true, readAt: now() } for all unread messages
  API-->>Browser: Messages thread

  Seller->>Browser: Reply to Buyer
  Browser->>API: POST /messages/send { conversationId, content }
  API->>DB: Create Message { senderId: sellerId, receiverId: buyerId }
  API-->>Buyer: Real-time notification — New message
```

---

## Sequence 11 — Token Refresh & Session Management

```mermaid
sequenceDiagram
  participant Browser as Frontend (React)
  participant API as Backend (NestJS)
  participant DB as Database (SQLite/Prisma)

  Browser->>API: GET /products (with expired accessToken)
  API-->>Browser: 401 Unauthorized — Token expired

  Browser->>API: POST /auth/refresh { refreshToken }
  API->>DB: Verify refreshToken hash in User record
  
  alt Valid Refresh Token
    API->>API: Generate new accessToken (15min)
    API->>API: Rotate refreshToken
    API->>DB: Update User { refreshToken: newHash }
    API-->>Browser: { accessToken: newToken, refreshToken: newRefresh }
    Browser->>Browser: Update stored tokens
    Browser->>API: Retry GET /products (with new accessToken)
    API-->>Browser: Products data ✅
  else Invalid/Expired Refresh Token
    API-->>Browser: 401 Unauthorized — Session expired
    Browser->>Browser: Clear tokens from localStorage
    Browser-->>User: Redirect to Login page
  end
```
