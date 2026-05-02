# 🏥 MediShop Pro — Présentation Complète du Projet
## Marketplace B2B de Matériel Médical — Présentation Académique

---

> **MediShop Pro** est une plateforme e-commerce **multi-vendeurs** spécialisée dans l'achat et la **location** de matériel médical en Algérie. Elle connecte les **acheteurs** (hôpitaux, cliniques, médecins) avec des **vendeurs** certifiés, sous la supervision d'un **administrateur** de plateforme.

---

## 🏗️ 1. Architecture Globale du Système (3 Tiers)

```mermaid
graph TD
  subgraph "🖥️ FRONTEND — React 19 + TypeScript"
    A1[Page Accueil & Boutique]
    A2[Dashboard Acheteur]
    A3[Dashboard Vendeur]
    A4[Dashboard Admin]
    A5[Panier & Checkout]
    A6[Messagerie & Notifications]
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

  subgraph "🗄️ BASE DE DONNÉES — SQLite + Prisma ORM"
    C1[(28 Tables / Models)]
  end

  A1 & A2 & A3 & A4 & A5 & A6 -->|HTTP REST API + JWT| B1
  B1 & B2 & B3 & B4 & B5 & B6 & B7 & B8 & B9 & B10 & B11 -->|Prisma Client| C1
```

---

## 👥 2. Les 3 Rôles Utilisateurs

```mermaid
graph LR
  subgraph "BUYER — المشتري"
    B1[S'inscrire]
    B2[Parcourir les produits]
    B3[Acheter / Louer]
    B4[Suivre ses commandes]
    B5[Messagerie avec vendeur]
    B6[Ouvrir un litige]
    B7[Laisser un avis]
  end

  subgraph "SELLER — البائع"
    S1[S'inscrire + vérification]
    S2[Créer sa boutique]
    S3[Ajouter des produits]
    S4[Gérer les commandes reçues]
    S5[Retirer ses gains — Wallet]
    S6[Répondre aux avis]
  end

  subgraph "SUPER_ADMIN — المسؤول"
    A1[Approuver les boutiques]
    A2[Approuver les produits]
    A3[Gérer tous les utilisateurs]
    A4[Voir toutes les transactions]
    A5[Résoudre les litiges]
    A6[Gérer les paramètres plateforme]
  end
```

---

## 📐 3. Diagrammes de Classes — Par Module

### 🔵 Module 1 — Utilisateurs & Authentification

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
    +String id
    +String email
    +String phone
    +String password
    +Role role
    +AccountStatus status
    +Boolean emailVerified
    +Boolean phoneVerified
    +Boolean twoFactorEnabled
    +String refreshToken
    +String passwordResetToken
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
  }
  class SellerProfile {
    +String id
    +String userId
    +String firstName
    +String lastName
    +String avatar
    +VerificationStatus verificationStatus
    +String rejectionReason
  }
  class AdminProfile {
    +String id
    +String userId
    +String firstName
    +String lastName
    +String permissions
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
    +Boolean isRead
    +DateTime readAt
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

### 🟡 Module 2 — Boutiques & Catalogue Produits

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
  }
  class StoreDocument {
    +String id
    +String storeId
    +String type
    +String name
    +String fileUrl
    +VerificationStatus status
    +String reviewNote
  }
  class Category {
    +String id
    +String name
    +String nameAr
    +String slug
    +String icon
    +String parentId
    +Boolean isActive
    +Int sortOrder
  }
  class Product {
    +String id
    +String storeId
    +String categoryId
    +String name
    +String nameAr
    +String slug
    +ProductType type
    +ProductCondition condition
    +ProductStatus status
    +String brand
    +String model
    +String serialNumber
    +Int yearOfManufacture
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
    +Int viewCount
    +Int soldCount
    +Float rating
    +Int totalReviews
  }
  class ProductImage {
    +String id
    +String productId
    +String url
    +String alt
    +Int sortOrder
    +Boolean isPrimary
  }
  class ProductDocument {
    +String id
    +String productId
    +String type
    +String name
    +String fileUrl
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

  SellerProfile "1" *-- "0..1" Store : owns
  Store "1" *-- "*" StoreDocument : submits
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

### 🟠 Module 3 — Commandes & Panier

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
    +String shippingAddress
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
  }
  class PromoCode {
    +String id
    +String code
    +String discountType
    +Float discountValue
    +Float minOrderAmount
    +Int maxUses
    +Int usedCount
    +Boolean isActive
    +DateTime expiresAt
    +String storeId
  }

  BuyerProfile "1" *-- "*" Order : places
  Order --> OrderStatus
  Order --> PaymentStatus
  Order "1" *-- "*" SubOrder : split into
  Store "1" -- "*" SubOrder : fulfills
  SubOrder "1" *-- "*" OrderItem : contains
  Product "1" -- "*" OrderItem : sold as
```

---

### 🟢 Module 4 — Locations (Rentals)

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
    +String id
    +String rentalNumber
    +String buyerProfileId
    +RentalStatus status
    +PaymentStatus paymentStatus
    +String paymentMethod
    +DateTime startDate
    +DateTime endDate
    +DateTime returnedAt
    +Int totalDays
    +Float dailyRate
    +Float totalRentAmount
    +Float depositAmount
    +String depositStatus
    +String contractUrl
  }
  class RentalItem {
    +String id
    +String rentalId
    +String productId
    +String productName
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
  }

  BuyerProfile "1" *-- "*" Rental : rents
  Rental --> RentalStatus
  Rental "1" *-- "*" RentalItem : contains
  Product "1" -- "*" RentalItem : rented as
  Rental "1" -- "*" RentalCalendar : blocks dates
```

---

### 🔴 Module 5 — Finance & Portefeuille

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
    +String id
    +String buyerProfileId
    +String sellerProfileId
    +Float balance
    +Float pendingBalance
    +Float totalEarned
    +Float totalWithdrawn
    +String currency
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
    +String description
    +String metadata
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
  }
  class PlatformSetting {
    +String id
    +String key
    +String value
    +String description
  }

  BuyerProfile "1" o-- "0..1" Wallet : has
  SellerProfile "1" o-- "0..1" Wallet : has
  Wallet "1" *-- "*" Transaction : logs
  Wallet "1" *-- "*" Withdrawal : requests
  Transaction --> TransactionType
  Order "1" -- "*" Transaction : triggers
  Rental "1" -- "*" Transaction : triggers
```

---

### 🟣 Module 6 — Support, Avis & Messagerie

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
  }
  class DisputeMessage {
    +String id
    +String disputeId
    +String senderId
    +String message
    +String attachments
  }
  class Conversation {
    +String id
    +String productId
    +DateTime updatedAt
  }
  class Message {
    +String id
    +String conversationId
    +String senderId
    +String receiverId
    +String content
    +Boolean isRead
    +DateTime readAt
  }

  User "1" -- "*" Review : writes
  Product "0..1" -- "*" Review : rated by
  Store "0..1" -- "*" Review : rated by
  User "1" -- "*" Dispute : opens
  Dispute --> DisputeStatus
  Dispute "1" *-- "*" DisputeMessage : contains
  Conversation "1" *-- "*" Message : holds
  User "1" -- "*" Message : sends / receives
```

---

## 🔄 4. Flux Métier Principaux (Workflows)

### Flux 1 — Inscription & Activation d'un Vendeur

```mermaid
sequenceDiagram
  actor Seller
  participant Frontend
  participant AuthService
  participant Database
  actor Admin

  Seller->>Frontend: Remplir formulaire inscription (SELLER)
  Frontend->>AuthService: POST /auth/register {role: SELLER}
  AuthService->>Database: Créer User (status: PENDING)
  AuthService->>Database: Créer SellerProfile (verificationStatus: PENDING)
  AuthService-->>Frontend: accessToken + refreshToken
  
  Seller->>Frontend: Créer sa boutique + uploader documents
  Frontend->>Database: POST /stores (Store créé, isVerified: false)
  
  Admin->>Frontend: Consulter la boutique dans Dashboard Admin
  Admin->>Frontend: Approuver la boutique
  Frontend->>Database: Store.isVerified = true, SellerProfile.verificationStatus = APPROVED
  Frontend-->>Seller: Notification — Boutique approuvée ✅
```

---

### Flux 2 — Achat d'un Produit (Multi-Vendeur)

```mermaid
sequenceDiagram
  actor Buyer
  participant Frontend
  participant OrdersService
  participant WalletService
  participant Database

  Buyer->>Frontend: Ajouter produits au panier (plusieurs vendeurs)
  Buyer->>Frontend: Confirmer commande
  
  Frontend->>OrdersService: POST /orders {items: [...]}
  OrdersService->>Database: Grouper les articles par Store
  
  loop Pour chaque Store
    OrdersService->>Database: Créer SubOrder
    OrdersService->>Database: Créer OrderItems
    OrdersService->>WalletService: Ajouter sellerAmount en pendingBalance
    OrdersService->>Database: Décrémenter Stock du produit
  end
  
  OrdersService->>Database: Créer Order principale
  OrdersService-->>Frontend: Commande créée ✅
  
  Buyer->>Frontend: Confirmer réception (confirm-delivery)
  Frontend->>OrdersService: POST /orders/:id/confirm-delivery
  OrdersService->>Database: pendingBalance → balance (Argent disponible pour le vendeur)
  OrdersService->>Database: Transaction.status = PAID
```

---

### Flux 3 — Location d'un Équipement

```mermaid
sequenceDiagram
  actor Buyer
  participant Frontend
  participant RentalsService
  participant Database

  Buyer->>Frontend: Choisir produit de type RENT
  Buyer->>Frontend: Sélectionner dates (startDate → endDate)
  Frontend->>Database: Vérifier RentalCalendar (disponibilité)
  
  Buyer->>Frontend: Confirmer location
  Frontend->>RentalsService: POST /rentals
  
  RentalsService->>Database: Créer Rental
  RentalsService->>Database: Créer RentalItems
  RentalsService->>Database: Bloquer dates dans RentalCalendar
  RentalsService->>Database: Enregistrer dépôt de garantie (depositAmount)
  RentalsService-->>Frontend: Rental créée ✅ + contrat PDF

  Buyer->>Frontend: Retourner l'équipement
  Frontend->>RentalsService: PUT /rentals/:id/return
  RentalsService->>Database: Rental.status = RETURNED
  RentalsService->>Database: Libérer dates dans RentalCalendar
  RentalsService->>Database: Rembourser dépôt si pas de dommages
```

---

### Flux 4 — Retrait des Gains (Vendeur)

```mermaid
sequenceDiagram
  actor Seller
  participant Frontend
  participant WalletService
  participant Database
  actor Admin

  Seller->>Frontend: Voir son Wallet (balance disponible)
  Frontend->>WalletService: GET /wallet/me
  WalletService-->>Frontend: {balance: 5000 DZD, pendingBalance: 2000 DZD}

  Seller->>Frontend: Demander un retrait (3000 DZD)
  Frontend->>WalletService: POST /wallet/withdraw {amount: 3000}
  WalletService->>Database: wallet.balance -= 3000
  WalletService->>Database: Créer Withdrawal (status: PENDING)
  WalletService->>Database: Créer Transaction (type: WITHDRAWAL)

  Admin->>Frontend: Voir les demandes de retrait
  Admin->>Frontend: Approuver le retrait
  Frontend->>Database: Withdrawal.status = COMPLETED
  Frontend-->>Seller: Notification — Virement effectué ✅
```

---

## 🌐 5. API REST — Points d'Accès Principaux

| Module | Méthode | Endpoint | Rôle requis |
|--------|---------|----------|-------------|
| **Auth** | POST | `/auth/register` | Public |
| | POST | `/auth/login` | Public |
| | GET | `/auth/me` | Connecté |
| | POST | `/auth/logout` | Connecté |
| **Produits** | GET | `/products` | Public |
| | GET | `/products/:id` | Public |
| | POST | `/products` | SELLER |
| | PATCH | `/products/:id` | SELLER |
| | DELETE | `/products/:id` | SELLER |
| **Commandes** | POST | `/orders` | BUYER |
| | GET | `/orders/my-orders` | BUYER |
| | GET | `/orders/store/:id` | SELLER |
| | POST | `/orders/:id/confirm-delivery` | BUYER |
| **Locations** | POST | `/rentals` | BUYER |
| | GET | `/rentals/my-rentals` | BUYER |
| | PUT | `/rentals/:id/return` | BUYER |
| **Boutiques** | POST | `/stores` | SELLER |
| | GET | `/stores/my-store` | SELLER |
| | GET | `/stores/:slug` | Public |
| **Wallet** | GET | `/wallet/me` | Connecté |
| | POST | `/wallet/withdraw` | SELLER |
| **Admin** | GET | `/admin/stats` | SUPER_ADMIN |
| | POST | `/admin/stores/:id/verify` | SUPER_ADMIN |
| | POST | `/admin/users/:id/suspend` | SUPER_ADMIN |
| **Messages** | GET | `/messages/conversations` | Connecté |
| | POST | `/messages/send` | Connecté |
| **Avis** | POST | `/reviews` | BUYER |
| | GET | `/reviews/product/:id` | Public |
| **Litiges** | POST | `/disputes` | BUYER |
| | GET | `/disputes` | Connecté |

---

## 🛠️ 6. Stack Technologique

```mermaid
graph LR
  subgraph "Frontend"
    F1["⚛️ React 19"]
    F2["🔷 TypeScript"]
    F3["🎨 CSS Vanilla"]
    F4["🔄 Context API"]
    F5["📡 Fetch API / Axios"]
  end

  subgraph "Backend"
    B1["🏗️ NestJS"]
    B2["🔷 TypeScript"]
    B3["🔐 JWT + Bcrypt"]
    B4["🛡️ Guards + Decorators"]
    B5["⚡ Rate Limiting"]
  end

  subgraph "Base de Données"
    D1["🗄️ SQLite"]
    D2["🔷 Prisma ORM"]
    D3["28 Models"]
    D4["11 Enums"]
  end

  F1 --- F2 --- F3 --- F4 --- F5
  B1 --- B2 --- B3 --- B4 --- B5
  D1 --- D2 --- D3 --- D4
```

---

## 📊 7. Résumé Statistique du Projet

| Catégorie | Détail | Nombre |
|---|---|---|
| **Modèles BDD** | Users, Products, Orders, Rentals, Wallet... | **28** |
| **Enums** | Role, OrderStatus, ProductType... | **11** |
| **Modules NestJS** | Auth, Products, Orders, Wallet... | **13** |
| **Endpoints API** | GET, POST, PATCH, DELETE | **40+** |
| **Rôles** | BUYER, SELLER, SUPER_ADMIN | **3** |
| **Pages Frontend** | Home, Shop, Auth, Dashboards... | **6+** |
| **Flux Métier** | Inscription, Achat, Location, Retrait | **4** |
