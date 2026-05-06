# 🏃 Activity Diagrams — MediShop Pro
## End-to-End Workflows (PostgreSQL + Redis + Stripe + S3 + KYC)

---

## Activity 1 — Buyer Registration & First Purchase

```mermaid
flowchart TD
  Start([🟢 Start]) --> A1[Visit MediShop Pro platform]
  A1 --> A2[Click Register as Buyer]
  A2 --> A3[Fill form: email, password, org type]
  A3 --> A4[class-validator sanitizes inputs]
  A4 --> A5{Email already exists\nin PostgreSQL?}
  A5 -- Yes --> A6[Show error: Email already used]
  A6 --> A3
  A5 -- No --> A7[bcrypt.hash password]
  A7 --> A8[Create User in PostgreSQL\nstatus: PENDING]
  A8 --> A9[Send verification email\nvia SendGrid]
  A9 --> A10[Buyer clicks verification link]
  A10 --> A11[Account ACTIVE ✅]
  A11 --> A12[Browse product catalog]
  A12 --> A13[Apply filters: category / price / wilaya]
  A13 --> A14[Add products to Cart\nCart stored in Redis TTL:24h]
  A14 --> A15[Proceed to Checkout]
  A15 --> A16[Select shipping address]
  A15 --> A17[Apply promo code?]
  A17 -- Yes --> A18{Code valid\nin PostgreSQL?}
  A18 -- No --> A19[Show error]
  A19 --> A17
  A18 -- Yes --> A20[Apply discount]
  A20 --> A21[Create Stripe PaymentIntent]
  A17 -- No --> A21
  A21 --> A22[Buyer confirms payment\nvia Stripe.js]
  A22 --> A23{Payment successful?}
  A23 -- No --> A24[Show payment error]
  A24 --> A21
  A23 -- Yes --> A25[Order created in PostgreSQL ✅]
  A25 --> A26[Clear cart from Redis]
  A26 --> A27[Generate Tax Invoice PDF → S3]
  A27 --> A28[Email confirmation + invoice link\nvia SendGrid]
  A28 --> End([🔴 End])
```

---

## Activity 2 — Seller KYC Onboarding & Product Listing

```mermaid
flowchart TD
  Start([🟢 Start]) --> B1[Register as Seller]
  B1 --> B2[Fill form → bcrypt hash password]
  B2 --> B3[Verify email via SendGrid]
  B3 --> B4[Access Seller Dashboard]
  B4 --> B5[Create Store: name, wilaya, taxId]
  B5 --> B6[Upload KYC documents\nRC, tax, health license]
  B6 --> B7[Files uploaded to AWS S3 / Cloudinary]
  B7 --> B8[StoreDocuments saved in PostgreSQL\nstatus: PENDING]
  B8 --> B9[Submit store for Admin review]
  B9 --> B10{Admin KYC Review}
  B10 -- Rejected --> B11[Email Seller — rejection reason\nvia SendGrid]
  B11 --> B12[Fix documents & re-upload to S3]
  B12 --> B10
  B10 -- Approved --> B13[Store isVerified = true\nPostgreSQL updated ✅]
  B13 --> B14[Email Seller — "Store approved" via SendGrid]
  B14 --> B15[Add new product]
  B15 --> B16[Fill product details + pricing]
  B16 --> B17[Upload images → AWS S3]
  B17 --> B18[Upload certifications PDF → S3\nCE / FDA documents]
  B18 --> B19{Product type?}
  B19 -- RENT or BOTH --> B20[Set rental prices\ndaily/weekly/monthly + deposit]
  B20 --> B21[Submit for Admin review\nstatus: PENDING_REVIEW]
  B19 -- SALE only --> B21
  B21 --> B22{Admin reviews product}
  B22 -- Rejected --> B23[Edit product & resubmit]
  B23 --> B22
  B22 -- Approved --> B24[Product ACTIVE on platform ✅]
  B24 --> End([🔴 End])
```

---

## Activity 3 — Multi-Vendor Order Processing (Stripe + Redis + Split Payment)

```mermaid
flowchart TD
  Start([🟢 Start]) --> C1[Buyer loads cart from Redis]
  C1 --> C2[Verify all products ACTIVE\ncheck PostgreSQL stock]
  C2 --> C3{All products valid?}
  C3 -- No --> C4[Notify Buyer — item unavailable]
  C4 --> End1([🔴 End])
  C3 -- Yes --> C5[Create Stripe PaymentIntent\ntotal amount]
  C5 --> C6[Buyer confirms payment\nvia Stripe.js]
  C6 --> C7{Stripe confirms payment?}
  C7 -- No --> C8[Show payment failure]
  C8 --> End2([🔴 End])
  C7 -- Yes --> C9[Group cart items by Store]
  C9 --> C10[For each Store:\nCreate SubOrder in PostgreSQL]
  C10 --> C11[Create OrderItems in PostgreSQL]
  C11 --> C12[Decrement Product.stock in PostgreSQL]
  C12 --> C13[Calculate commission\ncommissionRate × subtotal]
  C13 --> C14[Add sellerAmount to\nSeller pendingBalance in PostgreSQL]
  C14 --> C15[Create Transaction record\nstatus: PENDING]
  C15 --> C16[Email Seller via SendGrid\nNew order received 📦]
  C16 --> C17{More stores?}
  C17 -- Yes --> C10
  C17 -- No --> C18[Create main Order in PostgreSQL\npaymentStatus: PAID]
  C18 --> C19[Delete cart from Redis]
  C19 --> C20[Generate Tax Invoice PDF]
  C20 --> C21[Upload invoice to S3]
  C21 --> C22[Email Buyer: confirmation + invoice URL]
  C22 --> End3([🔴 End])
```

---

## Activity 4 — Equipment Rental with Stripe Deposit

```mermaid
flowchart TD
  Start([🟢 Start]) --> D1[Buyer selects RENT product]
  D1 --> D2[View rental availability calendar\nfrom PostgreSQL RentalCalendar]
  D2 --> D3[Select startDate & endDate]
  D3 --> D4{Dates available\nin RentalCalendar?}
  D4 -- No --> D5[Choose different dates]
  D5 --> D3
  D4 -- Yes --> D6[Calculate total:\nrentAmount + depositAmount]
  D6 --> D7[Create Stripe charge\nrent + deposit combined]
  D7 --> D8{Payment successful?}
  D8 -- No --> D9[Show payment error]
  D9 --> End1([🔴 End])
  D8 -- Yes --> D10[Create Rental in PostgreSQL\nstatus: PENDING]
  D10 --> D11[Block dates in RentalCalendar\nisBlocked: true]
  D11 --> D12[Generate Rental Contract PDF]
  D12 --> D13[Upload contract to S3\nUpdate Rental.contractUrl]
  D13 --> D14[Email Buyer: contract PDF via SendGrid]
  D14 --> D15[Notify Seller — new rental]
  D15 --> D16{Seller confirms?}
  D16 -- No --> D17[Rental CANCELLED\nFree calendar dates\nStripe refund issued]
  D17 --> End2([🔴 End])
  D16 -- Yes --> D18[Rental CONFIRMED\nstatus: ACTIVE on start date]
  D18 --> D19{Equipment returned on time?}
  D19 -- Yes --> D20[Mark RETURNED in PostgreSQL]
  D20 --> D21{Any damage?}
  D21 -- No --> D22[Stripe refund depositAmount ✅]
  D22 --> D23[Free calendar dates]
  D23 --> End3([🔴 End])
  D21 -- Yes --> D24[Deposit withheld\nDispute can be opened]
  D24 --> End4([🔴 End])
  D19 -- No → Overdue --> D25[Status OVERDUE\nNotify Buyer & Seller via SendGrid]
  D25 --> D26[Apply daily overdue penalty]
  D26 --> D19
```

---

## Activity 5 — Admin KYC Moderation

```mermaid
flowchart TD
  Start([🟢 Start]) --> E1[Admin logs into Admin Dashboard\nRole Guard: SUPER_ADMIN only]
  E1 --> E2[View pending count:\nstores + products awaiting review]
  E2 --> E3{What to moderate?}

  E3 -- Store KYC --> E4[Open pending store application]
  E4 --> E5[Review seller info in PostgreSQL]
  E5 --> E6[Download KYC documents from S3\nRC, tax, health license]
  E6 --> E7{Documents valid\nand complete?}
  E7 -- No --> E8[Reject store with written reason]
  E8 --> E9[Email Seller via SendGrid\n rejection reason]
  E9 --> End1([🔴 End])
  E7 -- Yes --> E10[Approve store in PostgreSQL\nisVerified: true\nverificationStatus: APPROVED]
  E10 --> E11[Email Seller — "Store approved ✅"]
  E11 --> End2([🔴 End])

  E3 -- Product --> E12[Open pending product\nstatus: PENDING_REVIEW]
  E12 --> E13[Review details, images from S3]
  E13 --> E14[Check certifications PDF\nCE / FDA from S3]
  E14 --> E15{Product compliant\nand safe?}
  E15 -- No --> E16[Reject product\nstatus: REJECTED]
  E16 --> E17[Email Seller via SendGrid]
  E17 --> End3([🔴 End])
  E15 -- Yes --> E18[Approve product\nstatus: ACTIVE in PostgreSQL]
  E18 --> E19[Product visible on catalog ✅]
  E19 --> End4([🔴 End])
```

---

## Activity 6 — Dispute & Refund via Stripe

```mermaid
flowchart TD
  Start([🟢 Start]) --> F1[Buyer has issue with order or rental]
  F1 --> F2[Navigate to Disputes section]
  F2 --> F3[Select related order or rental]
  F3 --> F4[Describe issue: subject + description]
  F4 --> F5[Submit dispute]
  F5 --> F6[Dispute created in PostgreSQL\nstatus: OPEN]
  F6 --> F7[Email Admin & Seller via SendGrid]
  F7 --> F8[Seller responds with evidence]
  F8 --> F9[Admin reviews all messages]
  F9 --> F10[Status → UNDER_REVIEW in PostgreSQL]
  F10 --> F11{Admin decision?}
  F11 -- Favor Buyer --> F12[Issue Stripe refund to Buyer]
  F12 --> F13[Dispute RESOLVED in PostgreSQL]
  F11 -- Favor Seller --> F14[Release funds to Seller wallet]
  F14 --> F13
  F11 -- Close without resolution --> F15[Dispute CLOSED]
  F13 --> F16[Email both parties via SendGrid]
  F15 --> F16
  F16 --> End([🔴 End])
```

---

## Activity 7 — Seller Withdrawal Flow

```mermaid
flowchart TD
  Start([🟢 Start]) --> G1[Seller views wallet dashboard]
  G1 --> G2[Fetch balance from PostgreSQL]
  G2 --> G3{Available balance > 0?}
  G3 -- No --> G4[Wait for delivery confirmations\nto release pendingBalance]
  G4 --> End1([🔴 End])
  G3 -- Yes --> G5[Click Request Withdrawal]
  G5 --> G6[Enter amount + bank details]
  G6 --> G7{Amount ≤ wallet.balance\nin PostgreSQL?}
  G7 -- No --> G8[Show error — insufficient funds]
  G8 --> G6
  G7 -- Yes --> G9[Deduct from wallet.balance in PostgreSQL]
  G9 --> G10[Create Withdrawal record\nstatus: PENDING]
  G10 --> G11[Create Transaction\ntype: WITHDRAWAL, status: PENDING]
  G11 --> G12[Email Admin via SendGrid\nnew withdrawal pending]
  G12 --> G13{Admin reviews}
  G13 -- Approved --> G14[Admin processes bank transfer\noutside platform]
  G14 --> G15[Withdrawal.status = COMPLETED]
  G15 --> G16[Email Seller via SendGrid ✅]
  G16 --> End2([🔴 End])
  G13 -- Rejected --> G17[Restore wallet.balance in PostgreSQL]
  G17 --> G18[Email Seller: rejection reason]
  G18 --> End3([🔴 End])
```

---

## Activity 8 — Secure Login with Rate Limiting

```mermaid
flowchart TD
  Start([🟢 Start]) --> H1[User submits login form]
  H1 --> H2[class-validator sanitizes inputs]
  H2 --> H3[Check Rate Limit in Redis\nfor this IP address]
  H3 --> H4{Attempts > 5\nin last 15 minutes?}
  H4 -- Yes --> H5[Return 429 Too Many Requests]
  H5 --> H6[Show lockout message to user]
  H6 --> End1([🔴 End])
  H4 -- No --> H7[Find User by email in PostgreSQL]
  H7 --> H8{User found?}
  H8 -- No --> H9[Increment Redis fail counter\nReturn 401]
  H9 --> End2([🔴 End])
  H8 -- Yes --> H10{bcrypt.compare\npassword vs hash}
  H10 -- Wrong --> H11[Increment Redis fail counter\nReturn 401]
  H11 --> End3([🔴 End])
  H10 -- Correct --> H12[Reset Redis fail counter]
  H12 --> H13[Sign accessToken 15min]
  H13 --> H14[Sign refreshToken 7 days]
  H14 --> H15[Save bcrypt refreshToken\nin PostgreSQL]
  H15 --> H16[Set-Cookie: refreshToken\nHttpOnly + Secure + SameSite=Strict]
  H16 --> H17[Return accessToken in response body]
  H17 --> H18[Store accessToken in memory\nnot localStorage — XSS safe]
  H18 --> H19[Redirect to Dashboard ✅]
  H19 --> End4([🔴 End])
```
