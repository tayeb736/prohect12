# 🏃 Activity Diagrams — MediShop Pro
## End-to-End Workflow Flows

---

## Activity 1 — Buyer Registration & First Purchase

```mermaid
flowchart TD
  Start([🟢 Start]) --> A1[Visit MediShop Pro platform]
  A1 --> A2[Click Register as Buyer]
  A2 --> A3[Fill form: email, password, org type]
  A3 --> A4{Email already exists?}
  A4 -- Yes --> A5[Show error: Email already used]
  A5 --> A3
  A4 -- No --> A6[Create account — status: PENDING]
  A6 --> A7[Send verification email]
  A7 --> A8[Buyer clicks verification link]
  A8 --> A9[Account ACTIVE ✅]
  A9 --> A10[Browse product catalog]
  A10 --> A11[Apply filters: category / price / wilaya]
  A11 --> A12[Open product detail page]
  A12 --> A13{Product type?}
  A13 -- SALE --> A14[Add to Cart]
  A13 -- RENT --> A15[Select rental dates]
  A15 --> A16{Dates available?}
  A16 -- No --> A17[Choose different dates]
  A17 --> A15
  A16 -- Yes --> A14
  A14 --> A18[Proceed to Checkout]
  A18 --> A19[Select shipping address]
  A19 --> A20[Apply promo code?]
  A20 -- Yes --> A21{Code valid?}
  A21 -- No --> A22[Show error]
  A22 --> A20
  A21 -- Yes --> A23[Apply discount]
  A23 --> A24[Confirm & Place Order]
  A20 -- No --> A24
  A24 --> A25[Order created ✅]
  A25 --> A26[Receive confirmation notification]
  A26 --> End([🔴 End])
```

---

## Activity 2 — Seller Onboarding & Product Listing

```mermaid
flowchart TD
  Start([🟢 Start]) --> B1[Register as Seller]
  B1 --> B2[Fill seller details & verify email]
  B2 --> B3[Access Seller Dashboard]
  B3 --> B4[Create Store: name, wilaya, description]
  B4 --> B5[Upload legal documents: RC, tax ID, NIS]
  B5 --> B6[Submit store for admin review]
  B6 --> B7{Admin reviews store}
  B7 -- Rejected --> B8[Receive rejection notification]
  B8 --> B9[Fix documents & resubmit]
  B9 --> B7
  B7 -- Approved --> B10[Store isVerified = true ✅]
  B10 --> B11[Add new product]
  B11 --> B12[Fill: name, category, type, price, stock]
  B12 --> B13[Upload product images]
  B13 --> B14[Set specifications & certifications]
  B14 --> B15{Product type?}
  B15 -- RENT or BOTH --> B16[Set rental prices: daily/weekly/monthly]
  B16 --> B17[Set deposit amount]
  B17 --> B18[Submit for admin review]
  B15 -- SALE only --> B18
  B18 --> B19{Admin reviews product}
  B19 -- Rejected --> B20[Edit product & resubmit]
  B20 --> B19
  B19 -- Approved --> B21[Product ACTIVE on platform ✅]
  B21 --> B22[Product visible to buyers]
  B22 --> End([🔴 End])
```

---

## Activity 3 — Order Processing Workflow

```mermaid
flowchart TD
  Start([🟢 Start]) --> C1[Buyer places order]
  C1 --> C2[System validates all products are ACTIVE]
  C2 --> C3{All products available?}
  C3 -- No --> C4[Notify Buyer — item unavailable]
  C4 --> End1([🔴 End])
  C3 -- Yes --> C5[Group items by Store]
  C5 --> C6[Create main Order + SubOrders]
  C6 --> C7[Decrement stock for each product]
  C7 --> C8[Add seller amounts to pendingBalance]
  C8 --> C9[Send notifications to all sellers]
  C9 --> C10[Seller confirms & processes SubOrder]
  C10 --> C11[Seller ships — adds tracking number]
  C11 --> C12[Notify Buyer: Order shipped 🚚]
  C12 --> C13{Buyer confirms delivery?}
  C13 -- No, issue --> C14[Buyer opens dispute]
  C14 --> C15[Admin resolves dispute]
  C15 --> End2([🔴 End])
  C13 -- Yes --> C16[Order status → DELIVERED]
  C16 --> C17[Move seller funds: pendingBalance → balance]
  C17 --> C18[Transaction marked as PAID]
  C18 --> C19[Seller can request withdrawal]
  C19 --> End3([🔴 End])
```

---

## Activity 4 — Equipment Rental Lifecycle

```mermaid
flowchart TD
  Start([🟢 Start]) --> D1[Buyer selects RENT product]
  D1 --> D2[View rental availability calendar]
  D2 --> D3[Select startDate and endDate]
  D3 --> D4{Dates available in RentalCalendar?}
  D4 -- No --> D5[Choose different dates]
  D5 --> D3
  D4 -- Yes --> D6[Confirm rental + deposit amount]
  D6 --> D7[System creates Rental record]
  D7 --> D8[Block dates in RentalCalendar]
  D8 --> D9[Generate contract PDF]
  D9 --> D10[Notify Seller — new rental request]
  D10 --> D11{Seller confirms?}
  D11 -- No --> D12[Rental CANCELLED — dates freed]
  D12 --> End1([🔴 End])
  D11 -- Yes --> D13[Rental CONFIRMED ✅]
  D13 --> D14[Rental period starts — status: ACTIVE]
  D14 --> D15{Equipment returned on time?}
  D15 -- Yes --> D16[Mark as RETURNED]
  D16 --> D17{Any damage?}
  D17 -- No --> D18[Refund full deposit to Buyer]
  D18 --> D19[Free calendar dates]
  D19 --> End2([🔴 End])
  D17 -- Yes --> D20[Withhold deposit]
  D20 --> D21[Dispute may be opened]
  D21 --> End3([🔴 End])
  D15 -- No --> D22[Status → OVERDUE]
  D22 --> D23[Notify Buyer & Seller — equipment overdue]
  D23 --> D24[Daily overdue penalties applied]
  D24 --> D25[Equipment eventually returned]
  D25 --> D16
```

---

## Activity 5 — Admin Store & Product Moderation

```mermaid
flowchart TD
  Start([🟢 Start]) --> E1[Admin logs into Admin Dashboard]
  E1 --> E2[View pending stores & products count]
  E2 --> E3{What to moderate?}
  
  E3 -- Store --> E4[Open pending store application]
  E4 --> E5[Review seller info & documents]
  E5 --> E6[Download & verify legal documents]
  E6 --> E7{Documents valid?}
  E7 -- No --> E8[Reject store with reason]
  E8 --> E9[Seller notified — must resubmit]
  E9 --> End1([🔴 End])
  E7 -- Yes --> E10[Approve store]
  E10 --> E11[Store.isVerified = true]
  E11 --> E12[Seller notified — can list products]
  E12 --> End2([🔴 End])
  
  E3 -- Product --> E13[Open pending product]
  E13 --> E14[Review product details, images, pricing]
  E14 --> E15{Product compliant?}
  E15 -- No --> E16[Reject product with reason]
  E16 --> E17[Seller notified — must edit & resubmit]
  E17 --> End3([🔴 End])
  E15 -- Yes --> E18[Approve product]
  E18 --> E19[Product.status = ACTIVE]
  E19 --> E20[Product visible on catalog]
  E20 --> End4([🔴 End])
```

---

## Activity 6 — Dispute Opening & Resolution

```mermaid
flowchart TD
  Start([🟢 Start]) --> F1[Buyer has issue with order or rental]
  F1 --> F2[Navigate to dispute section]
  F2 --> F3[Select order / rental]
  F3 --> F4[Describe issue — subject & description]
  F4 --> F5[Submit dispute]
  F5 --> F6[Dispute created — status: OPEN]
  F6 --> F7[Admin & Seller notified]
  F7 --> F8[Seller responds with evidence]
  F8 --> F9[Buyer adds more info if needed]
  F9 --> F10[Admin reviews all messages]
  F10 --> F11[Status → UNDER_REVIEW]
  F11 --> F12{Admin decision?}
  F12 -- In favor of Buyer --> F13[Issue refund to Buyer]
  F13 --> F14[Dispute RESOLVED]
  F12 -- In favor of Seller --> F15[Release funds to Seller]
  F15 --> F14
  F12 -- Close without resolution --> F16[Dispute CLOSED]
  F14 --> F17[Both parties notified of outcome]
  F16 --> F17
  F17 --> End([🔴 End])
```

---

## Activity 7 — Seller Withdrawal Flow

```mermaid
flowchart TD
  Start([🟢 Start]) --> G1[Seller views wallet dashboard]
  G1 --> G2[Check available balance]
  G2 --> G3{Sufficient balance?}
  G3 -- No --> G4[Wait for order deliveries to release funds]
  G4 --> End1([🔴 End])
  G3 -- Yes --> G5[Click Request Withdrawal]
  G5 --> G6[Enter amount & bank details]
  G6 --> G7{Amount <= wallet balance?}
  G7 -- No --> G8[Show error — insufficient funds]
  G8 --> G6
  G7 -- Yes --> G9[Deduct from wallet.balance]
  G9 --> G10[Create Withdrawal record — PENDING]
  G10 --> G11[Create Transaction — WITHDRAWAL, PENDING]
  G11 --> G12[Notify Admin]
  G12 --> G13{Admin reviews}
  G13 -- Approved --> G14[Process bank transfer]
  G14 --> G15[Withdrawal.status = COMPLETED]
  G15 --> G16[Notify Seller — funds transferred ✅]
  G16 --> End2([🔴 End])
  G13 -- Rejected --> G17[Restore wallet.balance]
  G17 --> G18[Notify Seller with rejection reason]
  G18 --> End3([🔴 End])
```

---

## Activity 8 — JWT Token Refresh & Session Management

```mermaid
flowchart TD
  Start([🟢 Start]) --> H1[User makes API request]
  H1 --> H2{AccessToken valid?}
  H2 -- Yes --> H3[Process request normally ✅]
  H3 --> End1([🔴 End])
  H2 -- Expired --> H4[Frontend detects 401 error]
  H4 --> H5[Send refreshToken to POST /auth/refresh]
  H5 --> H6{RefreshToken valid?}
  H6 -- Yes --> H7[Generate new accessToken]
  H7 --> H8[Rotate refreshToken]
  H8 --> H9[Update stored tokens in browser]
  H9 --> H10[Retry original API request]
  H10 --> H3
  H6 -- Expired / Invalid --> H11[Clear all tokens from browser]
  H11 --> H12[Redirect user to Login page]
  H12 --> End2([🔴 End])
```
