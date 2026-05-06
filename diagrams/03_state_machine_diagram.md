# 🔀 State Machine Diagrams — MediShop Pro
## (Updated: Stripe Deposit + KYC + Redis + PostgreSQL)

---

## State 1 — User Account Status

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDING : Register — bcrypt hash + email sent via SendGrid
  PENDING --> ACTIVE : Email verified via token link
  PENDING --> BANNED : Admin bans immediately
  ACTIVE --> SUSPENDED : Admin suspends account
  ACTIVE --> BANNED : Admin bans account
  SUSPENDED --> ACTIVE : Admin reactivates
  SUSPENDED --> BANNED : Escalated ban
  BANNED --> [*] : Account permanently closed
  note right of PENDING
    emailVerified = false
    Redis rate limit active
    Cannot login fully
  end note
  note right of ACTIVE
    Full access based on role
    JWT + HttpOnly Cookie issued
  end note
```

---

## State 2 — Seller KYC Verification Status

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDING : Seller uploads KYC docs to S3
  PENDING --> APPROVED : Admin reviews S3 docs & approves ✅
  PENDING --> REJECTED : Admin rejects — invalid/missing docs ❌
  REJECTED --> PENDING : Seller re-uploads corrected docs to S3
  APPROVED --> [*] : Store isVerified=true — Can list products
  note right of PENDING
    Documents stored in S3
    Admin downloads & reviews PDF
  end note
  note right of REJECTED
    Rejection reason sent via SendGrid
    Must resubmit valid documents
  end note
```

---

## State 3 — Product Status

```mermaid
stateDiagram-v2
  direction TB
  [*] --> DRAFT : Seller creates product
  DRAFT --> PENDING_REVIEW : Seller submits\nImages & CE/FDA docs on S3
  PENDING_REVIEW --> ACTIVE : Admin approves ✅
  PENDING_REVIEW --> REJECTED : Admin rejects ❌
  REJECTED --> DRAFT : Seller edits & resubmits
  ACTIVE --> INACTIVE : Seller deactivates manually
  INACTIVE --> PENDING_REVIEW : Seller re-enables
  ACTIVE --> [*] : Permanently deleted
  INACTIVE --> [*] : Permanently deleted
  note right of ACTIVE
    Visible in catalog
    Buyers can purchase/rent
    Images/docs served from S3
  end note
```

---

## State 4 — Order Status (Stripe Payment)

```mermaid
stateDiagram-v2
  direction TB
  [*] --> PENDING : Buyer initiates checkout\nStripe PaymentIntent created
  PENDING --> CONFIRMED : Stripe payment succeeded ✅\nStock decremented in PostgreSQL
  PENDING --> CANCELLED : Stripe payment failed ❌
  CONFIRMED --> PROCESSING : Seller confirms & prepares
  CONFIRMED --> CANCELLED : Seller cancels — out of stock
  PROCESSING --> SHIPPED : Seller adds tracking number
  SHIPPED --> DELIVERED : Buyer confirms receipt ✅
  DELIVERED --> [*] : pendingBalance → balance\nSeller can withdraw
  CANCELLED --> REFUNDED : Stripe refund issued
  REFUNDED --> [*] : Funds returned to buyer card
  note right of CONFIRMED
    paymentIntentId stored in PostgreSQL
    Invoice PDF generated → S3
    Seller notified via SendGrid
  end note
```

---

## State 5 — SubOrder Status (Per Store)

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDING : Created within main Order
  PENDING --> CONFIRMED : Seller confirms stock available
  PENDING --> CANCELLED : Seller cannot fulfill
  CONFIRMED --> PROCESSING : Seller starts packing
  PROCESSING --> SHIPPED : Tracking number added
  SHIPPED --> DELIVERED : Buyer confirms receipt
  DELIVERED --> [*] : sellerAmount released to Wallet
  CANCELLED --> [*] : Partial Stripe refund if needed
```

---

## State 6 — Rental Status (Stripe Deposit)

```mermaid
stateDiagram-v2
  direction TB
  [*] --> PENDING : Buyer places rental request\nStripe charges rent + deposit
  PENDING --> CONFIRMED : Seller confirms ✅
  PENDING --> CANCELLED : Rejected — Stripe full refund
  CONFIRMED --> ACTIVE : Start date reached
  CONFIRMED --> CANCELLED : Cancelled before start — Stripe refund
  ACTIVE --> RETURNED : Equipment returned on time ✅
  ACTIVE --> OVERDUE : End date passed — not returned
  OVERDUE --> RETURNED : Returned late — penalties applied
  RETURNED --> [*] : depositStatus=REFUNDED via Stripe if no damage
  CANCELLED --> [*] : Calendar dates freed in PostgreSQL
  note right of PENDING
    RentalCalendar blocked in PostgreSQL
    Contract PDF generated → S3
  end note
  note right of OVERDUE
    Seller & Buyer emailed via SendGrid
    Daily penalty may apply
  end note
```

---

## State 7 — Payment Status (Stripe)

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDING : Stripe PaymentIntent created
  PENDING --> PAID : Stripe confirms payment ✅
  PENDING --> FAILED : Stripe rejects ❌
  FAILED --> PENDING : Buyer retries with new card
  PAID --> REFUNDED : Full Stripe refund issued
  PAID --> PARTIALLY_REFUNDED : Partial Stripe refund
  REFUNDED --> [*] : Funds returned to buyer
  PARTIALLY_REFUNDED --> [*] : Partial funds returned
```

---

## State 8 — Dispute Status

```mermaid
stateDiagram-v2
  direction LR
  [*] --> OPEN : Buyer opens dispute\nAdmin & Seller notified via SendGrid
  OPEN --> UNDER_REVIEW : Admin starts investigation
  OPEN --> CLOSED : Invalid claim — closed immediately
  UNDER_REVIEW --> RESOLVED : Admin resolves ✅\nStripe refund if in favor of Buyer
  UNDER_REVIEW --> CLOSED : Closed without resolution
  RESOLVED --> CLOSED : Both parties acknowledge
  CLOSED --> [*] : Archived in PostgreSQL
```

---

## State 9 — Withdrawal Status

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDING : Seller requests withdrawal\nbalance deducted in PostgreSQL
  PENDING --> COMPLETED : Admin approves & manual bank transfer ✅
  PENDING --> REJECTED : Admin rejects ❌
  REJECTED --> PENDING : Seller corrects & resubmits
  COMPLETED --> [*] : Seller notified via SendGrid
  REJECTED --> [*] : Balance restored in PostgreSQL
```

---

## State 10 — Store Document (KYC) Status

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDING : Seller uploads document to S3
  PENDING --> APPROVED : Admin downloads from S3 & verifies ✅
  PENDING --> REJECTED : Admin rejects — invalid doc ❌
  REJECTED --> PENDING : Seller re-uploads to S3
  APPROVED --> [*] : Document accepted — contributes to store approval
```

---

## 📊 States Summary Table

| Entity | States | Key Integration |
|--------|--------|----------------|
| **User Account** | PENDING → ACTIVE → SUSPENDED → BANNED | SendGrid verification email |
| **Seller KYC** | PENDING → APPROVED / REJECTED | S3 documents, SendGrid notification |
| **Product** | DRAFT → PENDING_REVIEW → ACTIVE / INACTIVE / REJECTED | S3 images & CE/FDA docs |
| **Order** | PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED | Stripe PaymentIntent, S3 Invoice |
| **SubOrder** | PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED | PostgreSQL per-store tracking |
| **Rental** | PENDING → CONFIRMED → ACTIVE → RETURNED / OVERDUE | Stripe Deposit, S3 Contract PDF |
| **Payment** | PENDING → PAID / FAILED → REFUNDED | Stripe API |
| **Dispute** | OPEN → UNDER_REVIEW → RESOLVED → CLOSED | Stripe Refund, SendGrid |
| **Withdrawal** | PENDING → COMPLETED / REJECTED | Manual bank transfer, SendGrid |
| **Store Document** | PENDING → APPROVED / REJECTED | S3 storage, Admin review |
