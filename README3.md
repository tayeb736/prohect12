# 🏥 MediShop Pro - Comprehensive Project Report (v1.0)

## 📋 Overview
**MediShop Pro** is an integrated B2B e-commerce platform specialized in selling and renting medical equipment in Algeria. The project connects sellers (companies and suppliers) with buyers (hospitals, clinics, and doctors) in a secure and organized digital environment.

---

## 🛠 Tech Stack

### 1. Backend
*   **NestJS**: A powerful framework built on Node.js to ensure clean and scalable architecture.
*   **Prisma 7**: The latest version of the ORM for high-precision database management.
*   **PostgreSQL**: A robust relational database for managing large and complex data.
*   **JWT & Bcrypt**: To secure the login process and encrypt passwords.
*   **Swagger/OpenAPI**: To easily document and test API routes.

### 2. Frontend
*   **React 19**: The latest version for building fast and interactive user interfaces.
*   **Vite**: A super-fast build tool for the project.
*   **React Router 7**: To manage routes and navigation between pages.
*   **Context API**: To manage application state (cart, user, products) without complexity.
*   **Axios**: For real-time, direct connection with the Backend.

---

## 🚀 Core Features

### 1. Multi-vendor System
*   Each seller can create their own store and upload their documents for verification (KYC).
*   Automatic order splitting system between sellers when purchasing from different stores.

### 2. Hybrid Marketplace (Sale & Rent)
*   Full support for selling new and used medical devices.
*   **Advanced Rental System**: Allows reserving devices for specific periods with calculation of daily rates and security deposits.

### 3. Financial Wallet System
*   A digital wallet for each seller to track their earnings and request withdrawals.
*   Automatic calculation of platform commissions.
*   Complete transaction history.

### 4. Triple Dashboards
*   **Admin Dashboard**: For supervision, store verification, and product approval.
*   **Seller Dashboard**: For inventory management, order tracking, and earnings withdrawal.
*   **Buyer Dashboard**: For tracking purchases, managing rentals, and address management.

---

## 🏗 Project Structure

### Backend (`/backend`)
*   `src/auth`: Identity and authorization system.
*   `src/stores`: Store management and verification.
*   `src/products`: Digital catalog (sale/rent).
*   `src/orders`: Complex purchasing logic.
*   `src/wallet`: Financial operations.
*   `prisma/schema.prisma`: Database schema (over 25 tables).

### Frontend (`/frontend`)
*   `src/pages/shop`: Shop page with smart filters.
*   `src/pages/dashboard`: The three dashboards.
*   `src/context/AppContext`: Cart and live data management.
*   `src/services`: Services to communicate with the API (Axios).

---

## 🔐 Security and Validation
*   Route protection using **Guards** (e.g., a seller cannot access the admin dashboard).
*   Data validation before entering the database.
*   Use of **JWT Interceptors** in the frontend to secure every request.

---

## 🏁 Conclusion
The project is now ready to run as a fully-featured **MVP (Minimum Viable Product)**. The interfaces are connected to the server, and the complete buying and selling lifecycle is active, making it a very strong foundation for any professional medical platform in the Algerian market.

---
**Prepared and Developed by: Antigravity AI Coding Assistant**
**Date: May 2, 2026**
