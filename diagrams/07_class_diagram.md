# 📐 Class Diagram — MediShop Pro
## Complete Data Model — 28 Models / 11 Enums
## Database: PostgreSQL 15 + Prisma 7 ORM

---

## Module 1 — Users & Authentication

```mermaid
classDiagram
direction TB

  class Role {
    <<enumeration>>
    SUPER_ADMIN
    SELLER
    BUYER
  }

  class AccountStatus {
    <<enumeration>>
    PENDING
    ACTIVE
    SUSPENDED
    BANNED
  }

  class VerificationStatus {
    <<enumeration>>
    PENDING
    APPROVED
    REJECTED
  }

  class NotificationType {
    <<enumeration>>
    ORDER_UPDATE
    RENTAL_UPDATE
    PAYMENT
    MESSAGE
    REVIEW
    DISPUTE
    SYSTEM
  }

  class User {
    +String id PK
    +String email UNIQUE
    +String phone
    +String password bcrypt hashed
    +Role role
    +AccountStatus status
    +Boolean emailVerified
    +Boolean phoneVerified
    +Boolean twoFactorEnabled
    +String twoFactorSecret
    +String refreshToken bcrypt hashed
    +String passwordResetToken
    +DateTime passwordResetExpiry
    +DateTime lastLoginAt
    +DateTime createdAt
    +DateTime updatedAt
  }

  class BuyerProfile {
    +String id PK
    +String userId FK
    +String firstName
    +String lastName
    +String avatar S3 URL
    +String organizationType
    +String organizationName
    +String wilaya
    +String bio
    +String taxId
    +DateTime createdAt
    +DateTime updatedAt
  }

  class SellerProfile {
    +String id PK
    +String userId FK
    +String firstName
    +String lastName
    +String avatar S3 URL
    +VerificationStatus verificationStatus
    +String rejectionReason
    +DateTime createdAt
    +DateTime updatedAt
  }

  class AdminProfile {
    +String id PK
    +String userId FK
    +String firstName
    +String lastName
    +String avatar S3 URL
    +String permissions JSON
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Address {
    +String id PK
    +String userId FK
    +String label
    +String firstName
    +String lastName
    +String phone
    +String wilaya
    +String commune
    +String street
    +String postalCode
    +Boolean isDefault
    +DateTime createdAt
    +DateTime updatedAt
  }

  class WishlistItem {
    +String id PK
    +String userId FK
    +String productId FK
    +DateTime createdAt
  }

  class Notification {
    +String id PK
    +String userId FK
    +NotificationType type
    +String title
    +String body
    +String data JSON
    +Boolean isRead
    +DateTime readAt
    +DateTime createdAt
  }

  User --> Role
  User --> AccountStatus
  User "1" *-- "0..1" BuyerProfile : owns
  User "1" *-- "0..1" SellerProfile : owns
  User "1" *-- "0..1" AdminProfile : owns
  User "1" *-- "*" Address : owns
  User "1" *-- "*" WishlistItem : has
  User "1" *-- "*" Notification : receives
  Notification --> NotificationType
  SellerProfile --> VerificationStatus
```

---

## Module 2 — Stores & Product Catalog

```mermaid
classDiagram
direction TB

  class ProductType {
    <<enumeration>>
    SALE
    RENT
    BOTH
  }

  class ProductCondition {
    <<enumeration>>
    NEW
    USED_LIKE_NEW
    USED_GOOD
    USED_FAIR
  }

  class ProductStatus {
    <<enumeration>>
    DRAFT
    PENDING_REVIEW
    ACTIVE
    INACTIVE
    REJECTED
  }

  class Store {
    +String id PK
    +String sellerProfileId FK
    +String name
    +String slug UNIQUE
    +String description
    +String logo S3 URL
    +String banner S3 URL
    +String wilaya
    +String address
    +String phone
    +String email
    +String website
    +String taxId
    +Float rating
    +Int totalReviews
    +Int totalSales
    +Float commissionRate percentage
    +Boolean isVerified KYC approved
    +DateTime createdAt
    +DateTime updatedAt
  }

  class StoreDocument {
    +String id PK
    +String storeId FK
    +String type RC / Tax / License
    +String name
    +String fileUrl S3 URL
    +VerificationStatus status
    +String reviewNote
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Category {
    +String id PK
    +String name
    +String nameAr
    +String slug UNIQUE
    +String description
    +String icon
    +String image S3 URL
    +String parentId FK self-ref
    +Boolean isActive
    +Int sortOrder
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Product {
    +String id PK
    +String storeId FK
    +String categoryId FK
    +String name
    +String nameAr
    +String slug UNIQUE
    +String description
    +ProductType type
    +ProductCondition condition
    +ProductStatus status
    +String brand
    +String model
    +String serialNumber
    +Int yearOfManufacture
    +Float weight
    +String dimensions
    +Float salePrice DZD
    +Float comparePrice DZD
    +Float rentPricePerDay DZD
    +Float rentPricePerWeek DZD
    +Float rentPricePerMonth DZD
    +Float depositAmount DZD
    +Int stock
    +String sku
    +Int minOrderQty
    +Int maxOrderQty
    +String specifications JSON
    +String certifications CE/FDA JSON
    +String warranty
    +String metaTitle SEO
    +String metaDescription SEO
    +String tags JSON
    +Int viewCount
    +Int soldCount
    +Float rating
    +Int totalReviews
    +DateTime createdAt
    +DateTime updatedAt
  }

  class ProductImage {
    +String id PK
    +String productId FK
    +String url S3 URL
    +String alt
    +Int sortOrder
    +Boolean isPrimary
    +DateTime createdAt
  }

  class ProductDocument {
    +String id PK
    +String productId FK
    +String type CE/FDA/Manual
    +String name
    +String fileUrl S3 URL
    +DateTime createdAt
  }

  class RentalCalendar {
    +String id PK
    +String productId FK
    +DateTime startDate
    +DateTime endDate
    +String rentalId FK
    +Boolean isBlocked
    +String note
    +DateTime createdAt
  }

  SellerProfile "1" *-- "0..1" Store : owns
  Store "1" *-- "*" StoreDocument : submits for KYC
  Category "1" o-- "*" Category : parent-child
  Category "1" -- "*" Product : classifies
  Store "1" *-- "*" Product : lists
  Product --> ProductType
  Product --> ProductCondition
  Product --> ProductStatus
  Product "1" *-- "*" ProductImage : contains
  Product "1" *-- "*" ProductDocument : contains
  Product "1" *-- "*" RentalCalendar : schedule
```

---

## Module 3 — Orders, Cart & Split Payments

```mermaid
classDiagram
direction TB

  class OrderStatus {
    <<enumeration>>
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
  }

  class PaymentStatus {
    <<enumeration>>
    PENDING
    PAID
    FAILED
    REFUNDED
    PARTIALLY_REFUNDED
  }

  class Cart {
    +String id PK
    +String sessionId Redis key
    +String userId FK
    +String items JSON cached in Redis
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Order {
    +String id PK
    +String orderNumber UNIQUE
    +String buyerProfileId FK
    +OrderStatus status
    +PaymentStatus paymentStatus
    +String paymentMethod Stripe
    +String paymentIntentId Stripe ID
    +Float totalAmount DZD
    +Float shippingAmount DZD
    +Float taxAmount DZD
    +Float discountAmount DZD
    +String notes
    +String shippingAddress JSON
    +String invoiceUrl S3 PDF URL
    +DateTime createdAt
    +DateTime updatedAt
  }

  class SubOrder {
    +String id PK
    +String orderId FK
    +String storeId FK
    +OrderStatus status
    +Float subtotal DZD
    +Float commissionAmount DZD platform fee
    +Float sellerAmount DZD net earnings
    +String trackingNumber
    +String shippingCarrier
    +String notes
    +DateTime createdAt
    +DateTime updatedAt
  }

  class OrderItem {
    +String id PK
    +String subOrderId FK
    +String productId FK
    +String productName snapshot
    +String productImage S3 URL
    +Int quantity
    +Float unitPrice DZD
    +Float totalPrice DZD
    +DateTime createdAt
  }

  class PromoCode {
    +String id PK
    +String code UNIQUE
    +String description
    +String discountType PERCENT/FIXED
    +Float discountValue
    +Float minOrderAmount DZD
    +Int maxUses
    +Int usedCount
    +Boolean isActive
    +DateTime expiresAt
    +String storeId FK
    +DateTime createdAt
    +DateTime updatedAt
  }

  BuyerProfile "1" *-- "*" Order : places
  Order --> OrderStatus
  Order --> PaymentStatus
  Order "1" *-- "*" SubOrder : split by store
  Store "1" -- "*" SubOrder : fulfills
  SubOrder --> OrderStatus
  SubOrder "1" *-- "*" OrderItem : contains
  Product "1" -- "*" OrderItem : sold as
```

---

## Module 4 — Rentals & Deposit Management

```mermaid
classDiagram
direction TB

  class RentalStatus {
    <<enumeration>>
    PENDING
    CONFIRMED
    ACTIVE
    RETURNED
    CANCELLED
    OVERDUE
  }

  class Rental {
    +String id PK
    +String rentalNumber UNIQUE
    +String buyerProfileId FK
    +RentalStatus status
    +PaymentStatus paymentStatus
    +String paymentMethod Stripe
    +String paymentIntentId Stripe ID
    +DateTime startDate
    +DateTime endDate
    +DateTime returnedAt
    +Int totalDays
    +Float dailyRate DZD
    +Float totalRentAmount DZD
    +Float depositAmount DZD Stripe held
    +String depositStatus HELD/REFUNDED/WITHHELD
    +String shippingAddress JSON
    +String notes
    +String contractUrl S3 PDF URL
    +DateTime createdAt
    +DateTime updatedAt
  }

  class RentalItem {
    +String id PK
    +String rentalId FK
    +String productId FK
    +String productName snapshot
    +String productImage S3 URL
    +Int quantity
    +Float unitPrice DZD
    +Float totalPrice DZD
    +DateTime createdAt
  }

  BuyerProfile "1" *-- "*" Rental : rents
  Rental --> RentalStatus
  Rental --> PaymentStatus
  Rental "1" *-- "*" RentalItem : contains
  Product "1" -- "*" RentalItem : rented as
  Rental "1" -- "*" RentalCalendar : blocks dates
```

---

## Module 5 — Finance, Wallet & Commission System

```mermaid
classDiagram
direction TB

  class TransactionType {
    <<enumeration>>
    SALE
    RENTAL
    DEPOSIT
    DEPOSIT_REFUND
    COMMISSION
    WITHDRAWAL
  }

  class Wallet {
    +String id PK
    +String buyerProfileId FK
    +String sellerProfileId FK
    +Float balance DZD available
    +Float pendingBalance DZD locked
    +Float totalEarned DZD all-time
    +Float totalWithdrawn DZD all-time
    +String currency DZD
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Transaction {
    +String id PK
    +String walletId FK
    +String orderId FK
    +String rentalId FK
    +TransactionType type
    +Float amount DZD
    +Float commissionAmount DZD platform fee
    +String currency DZD
    +PaymentStatus status
    +String paymentGatewayId Stripe ID
    +String description
    +String metadata JSON
    +DateTime createdAt
  }

  class Withdrawal {
    +String id PK
    +String walletId FK
    +Float amount DZD
    +String status PENDING/COMPLETED/REJECTED
    +String bankName
    +String accountNumber
    +String accountHolder
    +DateTime processedAt
    +String rejectionReason
    +String adminNote
    +DateTime createdAt
    +DateTime updatedAt
  }

  class PlatformSetting {
    +String id PK
    +String key UNIQUE
    +String value JSON
    +String description
    +DateTime updatedAt
  }

  BuyerProfile "1" o-- "0..1" Wallet : has
  SellerProfile "1" o-- "0..1" Wallet : has
  Wallet "1" *-- "*" Transaction : logs
  Wallet "1" *-- "*" Withdrawal : requests
  Transaction --> TransactionType
  Transaction --> PaymentStatus
  Order "1" -- "*" Transaction : triggers via Stripe
  Rental "1" -- "*" Transaction : triggers via Stripe
```

---

## Module 6 — Support, Reviews & Messaging

```mermaid
classDiagram
direction TB

  class DisputeStatus {
    <<enumeration>>
    OPEN
    UNDER_REVIEW
    RESOLVED
    CLOSED
  }

  class Review {
    +String id PK
    +String userId FK
    +String productId FK
    +String storeId FK
    +String orderId FK verified purchase
    +Int rating 1-5
    +String title
    +String comment
    +Boolean isVerified purchased product
    +Boolean isHidden admin hidden
    +String sellerReply
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Dispute {
    +String id PK
    +String openedById FK buyer userId
    +String orderId FK
    +String rentalId FK
    +DisputeStatus status
    +String subject
    +String description
    +String resolution
    +DateTime resolvedAt
    +DateTime createdAt
    +DateTime updatedAt
  }

  class DisputeMessage {
    +String id PK
    +String disputeId FK
    +String senderId FK userId
    +String message
    +String attachments S3 URLs JSON
    +DateTime createdAt
  }

  class Conversation {
    +String id PK
    +String productId FK context
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Message {
    +String id PK
    +String conversationId FK
    +String senderId FK userId
    +String receiverId FK userId
    +String content
    +String attachments S3 URLs JSON
    +Boolean isRead
    +DateTime readAt
    +DateTime createdAt
  }

  User "1" -- "*" Review : writes
  Product "0..1" -- "*" Review : rated by
  Store "0..1" -- "*" Review : rated by
  User "1" -- "*" Dispute : opens
  Dispute --> DisputeStatus
  Dispute "1" *-- "*" DisputeMessage : contains
  Conversation "1" *-- "*" Message : holds
  User "1" -- "*" Message : sends
  User "1" -- "*" Message : receives
```

---

## 📊 Complete Data Model Summary

| Module | Models | Enums | Key Tech |
|--------|--------|-------|---------|
| 🔵 Users & Auth | 7 models | 4 enums | bcrypt, JWT HttpOnly, Rate Limit Redis |
| 🟡 Stores & Catalog | 7 models | 3 enums | S3 images/docs, KYC verification |
| 🟠 Orders & Cart | 5 models | 2 enums | Redis Cart, Stripe Split Payments |
| 🟢 Rentals | 3 models | 1 enum | Stripe Deposit, S3 Contract PDF |
| 🔴 Finance | 4 models | 1 enum | Commission system, Stripe, Wallet |
| 🟣 Support & Messaging | 5 models | 1 enum | S3 attachments, Dispute resolution |
| **Total** | **28 Models** | **11 Enums** | **PostgreSQL 15 + Prisma 7** |
