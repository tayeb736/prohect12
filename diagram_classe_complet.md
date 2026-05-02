# 📐 Diagramme de Classes — MediShop Pro
### Système complet divisé en 6 modules

---

## 🔵 Module 1 — Utilisateurs & Authentification

> Gère tous les comptes, rôles, profils et adresses.

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

  class User {
    +String id
    +String email
    +String phone
    +String password
    +Role role
    +AccountStatus status
    +Boolean emailVerified
    +Boolean phoneVerified
    +Boolean twoFactorEnabled
    +String twoFactorSecret
    +String refreshToken
    +String passwordResetToken
    +DateTime passwordResetExpiry
    +DateTime lastLoginAt
    +DateTime createdAt
    +DateTime updatedAt
  }

  class BuyerProfile {
    +String id
    +String userId
    +String firstName
    +String lastName
    +String avatar
    +String organizationType
    +String organizationName
    +String wilaya
    +String bio
    +String taxId
    +DateTime createdAt
    +DateTime updatedAt
  }

  class SellerProfile {
    +String id
    +String userId
    +String firstName
    +String lastName
    +String avatar
    +VerificationStatus verificationStatus
    +String rejectionReason
    +DateTime createdAt
    +DateTime updatedAt
  }

  class AdminProfile {
    +String id
    +String userId
    +String firstName
    +String lastName
    +String avatar
    +String permissions
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Address {
    +String id
    +String userId
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
    +String id
    +String userId
    +String productId
    +DateTime createdAt
  }

  class Notification {
    +String id
    +String userId
    +NotificationType type
    +String title
    +String body
    +String data
    +Boolean isRead
    +DateTime readAt
    +DateTime createdAt
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

## 🟡 Module 2 — Boutiques & Catalogue Produits

> Gère les magasins des vendeurs, leurs documents légaux, les catégories et les produits.

```mermaid
classDiagram
direction TB

  class VerificationStatus {
    <<enumeration>>
    PENDING
    APPROVED
    REJECTED
  }

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
    +String id
    +String sellerProfileId
    +String name
    +String slug
    +String description
    +String logo
    +String banner
    +String wilaya
    +String address
    +String phone
    +String email
    +String website
    +String taxId
    +Float rating
    +Int totalReviews
    +Int totalSales
    +Float commissionRate
    +Boolean isVerified
    +DateTime createdAt
    +DateTime updatedAt
  }

  class StoreDocument {
    +String id
    +String storeId
    +String type
    +String name
    +String fileUrl
    +VerificationStatus status
    +String reviewNote
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Category {
    +String id
    +String name
    +String nameAr
    +String slug
    +String description
    +String icon
    +String image
    +String parentId
    +Boolean isActive
    +Int sortOrder
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Product {
    +String id
    +String storeId
    +String categoryId
    +String name
    +String nameAr
    +String slug
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
    +Float salePrice
    +Float comparePrice
    +Float rentPricePerDay
    +Float rentPricePerWeek
    +Float rentPricePerMonth
    +Float depositAmount
    +Int stock
    +String sku
    +Int minOrderQty
    +Int maxOrderQty
    +String specifications
    +String certifications
    +String warranty
    +String metaTitle
    +String metaDescription
    +String tags
    +Int viewCount
    +Int soldCount
    +Float rating
    +Int totalReviews
    +DateTime createdAt
    +DateTime updatedAt
  }

  class ProductImage {
    +String id
    +String productId
    +String url
    +String alt
    +Int sortOrder
    +Boolean isPrimary
    +DateTime createdAt
  }

  class ProductDocument {
    +String id
    +String productId
    +String type
    +String name
    +String fileUrl
    +DateTime createdAt
  }

  class RentalCalendar {
    +String id
    +String productId
    +DateTime startDate
    +DateTime endDate
    +String rentalId
    +Boolean isBlocked
    +String note
    +DateTime createdAt
  }

  SellerProfile "1" *-- "0..1" Store : owns
  Store "1" *-- "*" StoreDocument : submits
  StoreDocument --> VerificationStatus
  
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

## 🟠 Module 3 — Commandes & Panier

> Gère le cycle de vie des achats : panier, commande principale, sous-commandes par vendeur et articles.

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
    +String id
    +String sessionId
    +String userId
    +String items
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Order {
    +String id
    +String orderNumber
    +String buyerProfileId
    +OrderStatus status
    +PaymentStatus paymentStatus
    +String paymentMethod
    +String paymentIntentId
    +Float totalAmount
    +Float shippingAmount
    +Float taxAmount
    +Float discountAmount
    +String notes
    +String shippingAddress
    +DateTime createdAt
    +DateTime updatedAt
  }

  class SubOrder {
    +String id
    +String orderId
    +String storeId
    +OrderStatus status
    +Float subtotal
    +Float commissionAmount
    +Float sellerAmount
    +String trackingNumber
    +String shippingCarrier
    +String notes
    +DateTime createdAt
    +DateTime updatedAt
  }

  class OrderItem {
    +String id
    +String subOrderId
    +String productId
    +String productName
    +String productImage
    +Int quantity
    +Float unitPrice
    +Float totalPrice
    +DateTime createdAt
  }

  class PromoCode {
    +String id
    +String code
    +String description
    +String discountType
    +Float discountValue
    +Float minOrderAmount
    +Int maxUses
    +Int usedCount
    +Boolean isActive
    +DateTime expiresAt
    +String storeId
    +DateTime createdAt
    +DateTime updatedAt
  }

  BuyerProfile "1" *-- "*" Order : places
  Order --> OrderStatus
  Order --> PaymentStatus

  Order "1" *-- "*" SubOrder : split into
  Store "1" -- "*" SubOrder : fulfills
  SubOrder --> OrderStatus

  SubOrder "1" *-- "*" OrderItem : contains
  Product "1" -- "*" OrderItem : sold as
```

---

## 🟢 Module 4 — Locations (Rentals)

> Gère le cycle de vie des locations : réservation, durée, dépôt de garantie et retour.

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

  class PaymentStatus {
    <<enumeration>>
    PENDING
    PAID
    FAILED
    REFUNDED
    PARTIALLY_REFUNDED
  }

  class Rental {
    +String id
    +String rentalNumber
    +String buyerProfileId
    +RentalStatus status
    +PaymentStatus paymentStatus
    +String paymentMethod
    +String paymentIntentId
    +DateTime startDate
    +DateTime endDate
    +DateTime returnedAt
    +Int totalDays
    +Float dailyRate
    +Float totalRentAmount
    +Float depositAmount
    +String depositStatus
    +String shippingAddress
    +String notes
    +String contractUrl
    +DateTime createdAt
    +DateTime updatedAt
  }

  class RentalItem {
    +String id
    +String rentalId
    +String productId
    +String productName
    +String productImage
    +Int quantity
    +Float unitPrice
    +Float totalPrice
  }

  class RentalCalendar {
    +String id
    +String productId
    +DateTime startDate
    +DateTime endDate
    +String rentalId
    +Boolean isBlocked
    +String note
  }

  BuyerProfile "1" *-- "*" Rental : rents
  Rental --> RentalStatus
  Rental --> PaymentStatus
  Rental "1" *-- "*" RentalItem : contains
  Product "1" -- "*" RentalItem : rented as
  Rental "1" -- "*" RentalCalendar : blocks dates
```

---

## 🔴 Module 5 — Finance, Portefeuille & Transactions

> Gère les wallets (vendeur/acheteur), toutes les transactions financières et les demandes de retrait.

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

  class PaymentStatus {
    <<enumeration>>
    PENDING
    PAID
    FAILED
    REFUNDED
    PARTIALLY_REFUNDED
  }

  class Wallet {
    +String id
    +String buyerProfileId
    +String sellerProfileId
    +Float balance
    +Float pendingBalance
    +Float totalEarned
    +Float totalWithdrawn
    +String currency
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Transaction {
    +String id
    +String walletId
    +String orderId
    +String rentalId
    +TransactionType type
    +Float amount
    +Float commissionAmount
    +String currency
    +PaymentStatus status
    +String paymentGatewayId
    +String description
    +String metadata
    +DateTime createdAt
  }

  class Withdrawal {
    +String id
    +String walletId
    +Float amount
    +String status
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
    +String id
    +String key
    +String value
    +String description
    +DateTime updatedAt
  }

  BuyerProfile "1" o-- "0..1" Wallet : has
  SellerProfile "1" o-- "0..1" Wallet : has
  Wallet "1" *-- "*" Transaction : logs
  Wallet "1" *-- "*" Withdrawal : requests
  Transaction --> TransactionType
  Transaction --> PaymentStatus
  Order "1" -- "*" Transaction : triggers
  Rental "1" -- "*" Transaction : triggers
```

---

## 🟣 Module 6 — Support, Avis & Messagerie

> Gère les avis clients, les litiges (disputes), la messagerie interne et les messages de litige.

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
    +String id
    +String userId
    +String productId
    +String storeId
    +Int rating
    +String title
    +String comment
    +Boolean isVerified
    +Boolean isHidden
    +String sellerReply
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Dispute {
    +String id
    +String openedById
    +String orderId
    +String rentalId
    +DisputeStatus status
    +String subject
    +String description
    +String resolution
    +DateTime resolvedAt
    +DateTime createdAt
    +DateTime updatedAt
  }

  class DisputeMessage {
    +String id
    +String disputeId
    +String senderId
    +String message
    +String attachments
    +DateTime createdAt
  }

  class Conversation {
    +String id
    +String productId
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Message {
    +String id
    +String conversationId
    +String senderId
    +String receiverId
    +String content
    +String attachments
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

## 📊 Résumé du Système

| Module | Entités | Enums |
|--------|---------|-------|
| 🔵 Utilisateurs & Auth | `User`, `BuyerProfile`, `SellerProfile`, `AdminProfile`, `Address`, `WishlistItem`, `Notification` | `Role`, `AccountStatus`, `VerificationStatus`, `NotificationType` |
| 🟡 Boutiques & Catalogue | `Store`, `StoreDocument`, `Category`, `Product`, `ProductImage`, `ProductDocument`, `RentalCalendar` | `ProductType`, `ProductCondition`, `ProductStatus` |
| 🟠 Commandes & Panier | `Cart`, `Order`, `SubOrder`, `OrderItem`, `PromoCode` | `OrderStatus`, `PaymentStatus` |
| 🟢 Locations | `Rental`, `RentalItem`, `RentalCalendar` | `RentalStatus`, `PaymentStatus` |
| 🔴 Finance | `Wallet`, `Transaction`, `Withdrawal`, `PlatformSetting` | `TransactionType`, `PaymentStatus` |
| 🟣 Support & Messagerie | `Review`, `Dispute`, `DisputeMessage`, `Conversation`, `Message` | `DisputeStatus` |
| **Total** | **28 Modèles** | **11 Enums** |
