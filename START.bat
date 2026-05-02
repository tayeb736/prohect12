@echo off
echo ========================================
echo    MediShop Pro - Quick Start
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed!
    echo Please download Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [1/3] Docker found! Building and starting...
echo.

REM Build and start containers
docker-compose up --build -d

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start containers!
    pause
    exit /b 1
)

echo.
echo [2/3] Waiting for backend to be ready...
timeout /t 10 /nobreak >nul

echo.
echo [3/3] Seeding demo data...
docker exec medishop_backend npx ts-node prisma/seed.ts

echo.
echo ========================================
echo    SUCCESS! MediShop Pro is running!
echo ========================================
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:3000/api/v1
echo   API Docs:  http://localhost:3000/api/docs
echo.
echo   Demo Accounts:
echo   Admin:   admin@medishop.dz / admin123
echo   Seller:  seller@vendor.dz / seller123
echo   Buyer:   Register a new account
echo.
echo ========================================

REM Open browser
start http://localhost:5173

pause
