====================================================================
               🏥 MEDISHOP PRO - USB Run Guide
====================================================================

Welcome! If you are reading this file, you are currently trying to run the
MediShop Pro project on a new computer.

You have two ways to run the project depending on the software installed on this computer:

--------------------------------------------------------------------
🟢 Method 1: Using Docker (Easiest and Fastest)
--------------------------------------------------------------------
Use this method if the computer has Docker Desktop installed.

1. Ensure Docker Desktop is running.
2. Double-click the `START.bat` file located next to this file.
3. Wait a moment... The script will start everything (backend, frontend, and database).
4. The browser will automatically open to the URL: http://localhost:5173

Note for Mac/Linux: Open the Terminal and type:
sh start.sh

--------------------------------------------------------------------
🔵 Method 2: Using Traditional Node.js
--------------------------------------------------------------------
Use this method if Docker is not available, but the computer has Node.js.
(If Node.js is not installed, install it first from the installer you brought with you).

Step 1: Run the Server (Backend)
---------------------------------
1. Open Command Prompt (CMD) inside the `backend` folder.
2. Type the following commands in order:
   npm install
   npx prisma generate
   npx ts-node prisma/seed.ts    <-- This is to create demo accounts and data
   npm run start:dev

Step 2: Run the Interface (Frontend)
---------------------------------
1. Open a new Command Prompt (CMD) inside the `frontend` folder.
2. Type the following commands:
   npm install
   npm run dev

3. Open the browser to the URL: http://localhost:5173


====================================================================
🔑 Ready-to-Use Demo Accounts
====================================================================
You can use these accounts immediately to test the system:

👑 Administrator (Admin):
Email: admin@medishop.dz
Password: admin123

🏪 Seller:
Email: seller@vendor.dz
Password: seller123

🛒 Buyer:
You can easily create a new buyer account from the Register page.

====================================================================
Important Links:
- Website: http://localhost:5173
- API Server: http://localhost:3000/api/v1
- API Documentation (Swagger): http://localhost:3000/api/docs
====================================================================
