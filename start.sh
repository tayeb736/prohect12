#!/bin/bash
# MediShop Pro - Quick Start for Mac/Linux
echo "========================================"
echo "   MediShop Pro - Quick Start"
echo "========================================"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker not installed!"
    echo "Visit: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo "[1/3] Building and starting containers..."
docker-compose up --build -d

echo "[2/3] Waiting for backend..."
sleep 10

echo "[3/3] Seeding demo data..."
docker exec medishop_backend npx ts-node prisma/seed.ts

echo ""
echo "========================================"
echo "  SUCCESS! MediShop Pro is running!"
echo "========================================"
echo ""
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:3000/api/v1"
echo "  API Docs:  http://localhost:3000/api/docs"
echo ""
echo "  Admin:   admin@medishop.dz / admin123"
echo "  Seller:  seller@vendor.dz / seller123"
echo "========================================"

# Open browser
open http://localhost:5173 2>/dev/null || xdg-open http://localhost:5173 2>/dev/null
