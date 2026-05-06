# Comprehensive Database Schema (Class Diagram) - MediShop Pro

Due to the size of the system and the multitude of relationships, the comprehensive diagram has been divided into **5 main parts** to be clearer and more readable. This diagram is based on the backend database structure (Prisma Schema).

## 1. Users & Profiles Management
This diagram illustrates the core user entities, their profiles based on roles (Buyer, Seller, Admin), and their addresses.

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

  class User {
    +String id
    +String email
    +String phone
    +String password
    +Role role
    +AccountStatus status
    +Boolean emailVerified
    +DateTime createdAt
  }

  class BuyerProfile {
    +String id
    +String firstName
    +String lastName
    +String organizationType
    +String organizationName
    +String wilaya
  }

  class SellerProfile {
    +String id
    +String firstName
    +String lastName
    +VerificationStatus verificationStatus
  }

  class AdminProfile {
    +String id
    +String firstName
    +String lastName
    +String permissions
  }
  
  class Address {
    +String id
    +String label
    +String wilaya
    +String commune
    +String street
    +Boolean isDefault
  }

  User "1" *-- "0..1" BuyerProfile : has
  User "1" *-- "0..1" SellerProfile : has
  User "1" *-- "0..1" AdminProfile : has
  User "1" *-- "*" Address : owns
```

---

## 2. Store & Catalog Management
This diagram illustrates the structure of stores, documents, categories, and products with all their details (images, documents, rental calendar).

```mermaid
classDiagram
  direction TB

  class Store {
    +String id
    +String name
    +String slug
    +String wilaya
    +String taxId
    +Float rating
    +Boolean isVerified
    +Float commissionRate
  }

  class StoreDocument {
    +String id
    +String type
    +String name
    +String fileUrl
    +VerificationStatus status
  }

  class Category {
    +String id
    +String name
    +String slug
    +Boolean isActive
  }

  class Product {
    +String id
    +String name
    +ProductType type
    +ProductStatus status
    +Float salePrice
    +Float rentPricePerDay
    +Int stock
    +String sku
  }

  class ProductImage {
    +String id
    +String url
    +Boolean isPrimary
  }
  
  class ProductDocument {
    +String id
    +String type
    +String fileUrl
  }

  class RentalCalendar {
    +String id
    +DateTime startDate
    +DateTime endDate
    +Boolean isBlocked
  }

  SellerProfile "1" *-- "0..1" Store : owns
  Store "1" *-- "*" StoreDocument : provides
  Store "1" *-- "*" Product : lists
  Category "1" o-- "*" Category : sub-categories
  Category "1" *-- "*" Product : categorizes
  
  Product "1" *-- "*" ProductImage : has
  Product "1" *-- "*" ProductDocument : has
  Product "1" *-- "*" RentalCalendar : schedule
```

---

## 3. Orders & Rentals
This diagram illustrates the lifecycle of purchases (Orders) and rentals (Rentals), and the division of the main order into sub-orders based on stores.

```mermaid
classDiagram
  direction TB

  class Order {
    +String id
    +String orderNumber
    +OrderStatus status
    +PaymentStatus paymentStatus
    +Float totalAmount
    +Float shippingAmount
  }

  class SubOrder {
    +String id
    +OrderStatus status
    +Float subtotal
    +Float commissionAmount
    +Float sellerAmount
  }

  class OrderItem {
    +String id
    +String productName
    +Int quantity
    +Float unitPrice
    +Float totalPrice
  }

  class Rental {
    +String id
    +String rentalNumber
    +RentalStatus status
    +PaymentStatus paymentStatus
    +DateTime startDate
    +DateTime endDate
    +Float totalRentAmount
    +Float depositAmount
  }

  class RentalItem {
    +String id
    +String productName
    +Int quantity
    +Float unitPrice
    +Float totalPrice
  }

  BuyerProfile "1" *-- "*" Order : places
  BuyerProfile "1" *-- "*" Rental : places
  
  Order "1" *-- "*" SubOrder : contains
  Store "1" *-- "*" SubOrder : fulfills
  
  SubOrder "1" *-- "*" OrderItem : includes
  Product "1" *-- "*" OrderItem : references
  
  Rental "1" *-- "*" RentalItem : includes
  Product "1" *-- "*" RentalItem : references
```

---

## 4. Finance & Wallets
This covers everything related to funds on the platform, from wallets (for seller and buyer), financial transactions, and withdrawals.

```mermaid
classDiagram
  direction TB

  class Wallet {
    +String id
    +Float balance
    +Float pendingBalance
    +Float totalEarned
    +Float totalWithdrawn
    +String currency
  }

  class Transaction {
    +String id
    +TransactionType type
    +Float amount
    +Float commissionAmount
    +PaymentStatus status
    +String description
  }

  class Withdrawal {
    +String id
    +Float amount
    +String status
    +String bankName
    +String accountNumber
  }

  BuyerProfile "1" *-- "0..1" Wallet : has
  SellerProfile "1" *-- "0..1" Wallet : has
  
  Wallet "1" *-- "*" Transaction : logs
  Order "0..1" *-- "*" Transaction : generates
  Rental "0..1" *-- "*" Transaction : generates
  
  Wallet "1" *-- "*" Withdrawal : requests
```

---

## 5. Support, Reviews & Communication
Includes the messaging system (Chat), reviews, disputes, as well as notifications.

```mermaid
classDiagram
  direction TB

  class Review {
    +String id
    +Int rating
    +String comment
    +Boolean isVerified
    +String sellerReply
  }

  class Dispute {
    +String id
    +DisputeStatus status
    +String subject
    +String description
    +String resolution
  }

  class DisputeMessage {
    +String id
    +String message
    +String attachments
  }

  class Conversation {
    +String id
    +DateTime updatedAt
  }

  class Message {
    +String id
    +String content
    +Boolean isRead
  }
  
  class Notification {
    +String id
    +NotificationType type
    +String title
    +String body
    +Boolean isRead
  }

  User "1" *-- "*" Review : writes
  Product "0..1" *-- "*" Review : receives
  Store "0..1" *-- "*" Review : receives

  User "1" *-- "*" Dispute : opens
  Dispute "1" *-- "*" DisputeMessage : contains
  
  Conversation "1" *-- "*" Message : holds
  User "1" *-- "*" Message : sends/receives
  
  User "1" *-- "*" Notification : receives
```
