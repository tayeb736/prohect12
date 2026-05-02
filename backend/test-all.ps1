$pass = 0; $fail = 0

function Test { 
    param($name, $block)
    try { 
        $r = & $block
        Write-Host "  [PASS] $name : $r"
        $script:pass++
    }
    catch { 
        $d = $null
        try { $d = ($_.ErrorDetails.Message | ConvertFrom-Json).message } catch {}
        $msg = if ($d) { $d } else { $_.Exception.Message }
        Write-Host "  [FAIL] $name : $msg"
        $script:fail++
    }
}

Write-Host ""
Write-Host "======================================"
Write-Host "  MEDISHOP COMPREHENSIVE TEST SUITE"
Write-Host "======================================"

# ── Logins ──────────────────────────────
Write-Host ""
Write-Host "[1] Authentication"
Test "Buyer login" {
    $b = @{email="buyer@test.dz";password="Password123!"} | ConvertTo-Json
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $b
    $script:bToken = $r.accessToken
    "token OK"
}
Test "Seller login" {
    $b = @{email="seller@test.dz";password="Password123!"} | ConvertTo-Json
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $b
    $script:sToken = $r.accessToken
    "token OK"
}
Test "Admin login" {
    $b = @{email="admin@test.dz";password="Password123!"} | ConvertTo-Json
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $b
    $script:aToken = $r.accessToken
    "token OK"
}
Test "Auth/me (buyer)" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/auth/me" -Headers @{Authorization="Bearer $script:bToken"}
    "role=$($r.role)"
}

# ── Public ───────────────────────────────
Write-Host ""
Write-Host "[2] Public APIs"
Test "GET /products" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/products"
    $script:prodId = $r.data[0].id
    "$($r.meta.total) products"
}
Test "GET /products/:id" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/products/$script:prodId"
    "name=$($r.name)"
}
Test "GET /categories" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/categories"
    "$($r.Count) categories"
}
Test "GET /reviews/product/:id" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/reviews/product/$script:prodId"
    "$($r.Count) reviews"
}

# ── Buyer ────────────────────────────────
Write-Host ""
Write-Host "[3] Buyer APIs"
$bH = @{Authorization="Bearer $script:bToken"}
Test "GET /wallet/my-wallet (buyer)" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/wallet/my-wallet" -Headers $bH
    "balance=$($r.balance)"
}
Test "GET /orders/my-orders" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/orders/my-orders" -Headers $bH
    "$($r.Count) orders"
}
Test "GET /rentals/my-rentals" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/rentals/my-rentals" -Headers $bH
    "$($r.Count) rentals"
}
Test "GET /messages/conversations" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/messages/conversations" -Headers $bH
    "$($r.Count) conversations"
}
Test "GET /users/addresses" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/users/addresses" -Headers $bH
    "$($r.Count) addresses"
}

# ── Seller ───────────────────────────────
Write-Host ""
Write-Host "[4] Seller APIs"
$sH = @{Authorization="Bearer $script:sToken"}
Test "GET /stores/my-store" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/stores/my-store" -Headers $sH
    $script:storeId = $r.id
    "store=$($r.name)"
}
Test "GET /products?storeId" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/products?storeId=$script:storeId" -Headers $sH
    "$($r.meta.total) products"
}
Test "GET /orders/store/:id" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/orders/store/$script:storeId" -Headers $sH
    "$($r.Count) orders"
}
Test "GET /rentals/store/:id" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/rentals/store/$script:storeId" -Headers $sH
    "$($r.Count) rentals"
}
Test "GET /wallet/my-wallet (seller)" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/wallet/my-wallet" -Headers $sH
    "balance=$($r.balance), pending=$($r.pendingBalance)"
}

# ── Admin ────────────────────────────────
Write-Host ""
Write-Host "[5] Admin APIs"
$aH = @{Authorization="Bearer $script:aToken"}
Test "GET /admin/stats" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/admin/stats" -Headers $aH
    "users=$($r.userCount), stores=$($r.storeCount)"
}
Test "GET /admin/pending-stores" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/admin/pending-stores" -Headers $aH
    "$($r.Count) unverified stores"
}
Test "GET /admin/pending-withdrawals" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/admin/pending-withdrawals" -Headers $aH
    "$($r.Count) pending withdrawals"
}

# ── E2E Order Flow ────────────────────────
Write-Host ""
Write-Host "[6] End-to-End Order Flow"
Test "POST /orders (buyer creates)" {
    $body = @{items=@(@{productId=$script:prodId;quantity=1})} | ConvertTo-Json -Depth 5
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/orders" -Method Post -ContentType "application/json" -Body $body -Headers $bH
    $script:subOrderId = $r.subOrders[0].id
    "orderId=$($r.id)"
}
Test "POST /orders/:id/confirm-delivery (buyer)" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/orders/$script:subOrderId/confirm-delivery" -Method Post -Headers $bH
    "status=$($r.status)"
}
Test "Seller wallet updated after delivery" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/wallet/my-wallet" -Headers $sH
    "balance=$($r.balance), pending=$($r.pendingBalance)"
}
Test "POST /wallet/withdraw (seller)" {
    $body = @{amount=1000} | ConvertTo-Json
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/wallet/withdraw" -Method Post -ContentType "application/json" -Body $body -Headers $sH
    "withdrawal processed"
}
Test "Admin pending withdrawals updated" {
    $r = Invoke-RestMethod "http://localhost:3000/api/v1/admin/pending-withdrawals" -Headers $aH
    "$($r.Count) pending"
}

# ── Summary ──────────────────────────────
Write-Host ""
Write-Host "======================================"
Write-Host "  RESULTS: PASSED=$pass  FAILED=$fail"
Write-Host "======================================"
Write-Host ""
