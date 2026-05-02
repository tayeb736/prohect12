# المخطط الشامل لقاعدة البيانات (Class Diagram) - MediShop Pro

نظراً لحجم النظام وتعدد العلاقات، تم تقسيم المخطط الشامل إلى **5 أجزاء رئيسية** ليكون أكثر وضوحاً وقابلية للقراءة. يعتمد هذا المخطط على بنية قاعدة البيانات (Prisma Schema) الخاصة بالخادم (Backend).

## 1. إدارة المستخدمين والملفات الشخصية (Users & Profiles)
يوضح هذا المخطط الكيانات الأساسية للمستخدمين، ملفاتهم الشخصية حسب الصلاحيات (مشتري، بائع، مسؤول)، وعناوينهم.

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

## 2. المتاجر وإدارة الكتالوج (Store & Catalog)
يوضح هذا المخطط بنية المتاجر، الوثائق، الفئات (التصنيفات)، والمنتجات بكل تفاصيلها (صور، وثائق، روزنامة الحجز).

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

## 3. الطلبات والإيجارات (Orders & Rentals)
يوضح دورة حياة الشراء (Orders) والإيجار (Rentals)، وتقسيم الطلب الرئيسي إلى طلبات فرعية (SubOrders) حسب المتاجر.

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

## 4. المحفظة والمعاملات المالية (Finance & Wallets)
يخص كل ما يتعلق بالأموال في المنصة، من محافظ (للبائع والمشتري)، معاملات مالية، وعمليات السحب.

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

## 5. الدعم، التقييم والتواصل (Support & Communication)
يتضمن نظام الرسائل (Chat)، التقييمات (Reviews)، والنزاعات (Disputes)، بالإضافة للمنبهات.

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
