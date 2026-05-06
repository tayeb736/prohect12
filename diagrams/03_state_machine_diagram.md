# 🔀 State Machine Diagrams — MediShop Pro

---

## State 1 — User Account Status

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDING : User registers
  PENDING --> ACTIVE : Email verified ✅
  PENDING --> BANNED : Admin bans
  ACTIVE --> SUSPENDED : Admin suspends
  ACTIVE --> BANNED : Admin bans
  SUSPENDED --> ACTIVE : Admin reactivates
  SUSPENDED --> BANNED : Escalated
  BANNED --> [*] : Account closed
```

---

## State 2 — Seller Verification Status

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDING : Seller registers & uploads docs
  PENDING --> APPROVED : Admin approves ✅
  PENDING --> REJECTED : Admin rejects ❌
  REJECTED --> PENDING : Seller resubmits docs
  APPROVED --> [*] : Can sell products
```

---

## State 3 — Product Status

```mermaid
stateDiagram-v2
  direction TB
  [*] --> DRAFT : Seller creates product
  DRAFT --> PENDING_REVIEW : Seller submits
  PENDING_REVIEW --> ACTIVE : Admin approves ✅
  PENDING_REVIEW --> REJECTED : Admin rejects ❌
  REJECTED --> DRAFT : Seller edits & resubmits
  ACTIVE --> INACTIVE : Seller deactivates
  INACTIVE --> PENDING_REVIEW : Seller re-enables
  ACTIVE --> [*] : Deleted
  INACTIVE --> [*] : Deleted
```

---

## State 4 — Order Status

```mermaid
stateDiagram-v2
  direction TB
  [*] --> PENDING : Buyer places order
  PENDING --> CONFIRMED : Payment successful ✅
  PENDING --> CANCELLED : Payment failed ❌
  CONFIRMED --> PROCESSING : Seller prepares
  CONFIRMED --> CANCELLED : Seller cancels
  PROCESSING --> SHIPPED : Seller ships + tracking
  SHIPPED --> DELIVERED : Buyer confirms receipt ✅
  DELIVERED --> [*] : Seller funds released
  CANCELLED --> REFUNDED : Refund issued
  REFUNDED --> [*] : Complete
```

---

## State 5 — Rental Status

```mermaid
stateDiagram-v2
  direction TB
  [*] --> PENDING : Buyer submits rental request
  PENDING --> CONFIRMED : Seller confirms ✅
  PENDING --> CANCELLED : Rejected/Cancelled
  CONFIRMED --> ACTIVE : Start date reached
  CONFIRMED --> CANCELLED : Cancelled before start
  ACTIVE --> RETURNED : Equipment returned on time ✅
  ACTIVE --> OVERDUE : End date passed — not returned
  OVERDUE --> RETURNED : Returned late
  RETURNED --> [*] : Deposit refunded if no damage
  CANCELLED --> [*] : Dates freed in calendar
```

---

## State 6 — Payment Status

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDING : Payment initiated
  PENDING --> PAID : Gateway confirms ✅
  PENDING --> FAILED : Gateway rejects ❌
  FAILED --> PENDING : Buyer retries
  PAID --> REFUNDED : Full refund
  PAID --> PARTIALLY_REFUNDED : Partial refund
  REFUNDED --> [*] : Funds returned
  PARTIALLY_REFUNDED --> [*] : Partial funds returned
```

---

## State 7 — Dispute Status

```mermaid
stateDiagram-v2
  direction LR
  [*] --> OPEN : Buyer opens dispute
  OPEN --> UNDER_REVIEW : Admin investigates
  OPEN --> CLOSED : Invalid claim
  UNDER_REVIEW --> RESOLVED : Admin resolves ✅
  UNDER_REVIEW --> CLOSED : Closed without resolution
  RESOLVED --> CLOSED : Both parties acknowledge
  CLOSED --> [*] : Archived
```

---

## State 8 — Withdrawal Request Status

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDING : Seller requests withdrawal
  PENDING --> COMPLETED : Admin approves & transfers ✅
  PENDING --> REJECTED : Admin rejects ❌
  REJECTED --> PENDING : Seller resubmits
  COMPLETED --> [*] : Transfer done
  REJECTED --> [*] : Cancelled
```

---

## State 9 — Store Document Status

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDING : Seller uploads document
  PENDING --> APPROVED : Admin verifies ✅
  PENDING --> REJECTED : Admin rejects ❌
  REJECTED --> PENDING : Seller uploads new doc
  APPROVED --> [*] : Document accepted
```

---

## 📊 States Summary Table

| Entity | States | Count |
|--------|--------|-------|
| **User Account** | PENDING → ACTIVE → SUSPENDED → BANNED | 4 |
| **Seller Verification** | PENDING → APPROVED / REJECTED | 3 |
| **Product** | DRAFT → PENDING_REVIEW → ACTIVE / INACTIVE / REJECTED | 5 |
| **Order** | PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED / CANCELLED / REFUNDED | 7 |
| **Rental** | PENDING → CONFIRMED → ACTIVE → RETURNED / OVERDUE / CANCELLED | 6 |
| **Payment** | PENDING → PAID / FAILED → REFUNDED / PARTIALLY_REFUNDED | 5 |
| **Dispute** | OPEN → UNDER_REVIEW → RESOLVED → CLOSED | 4 |
| **Withdrawal** | PENDING → COMPLETED / REJECTED | 3 |
| **Store Document** | PENDING → APPROVED / REJECTED | 3 |
