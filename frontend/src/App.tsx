import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Home } from './pages/home/Home';
import SellerLayout from './components/dashboard/layout/SellerLayout';
import SellerOverview from './pages/dashboard/seller/SellerOverview';
import SellerProducts from './pages/dashboard/seller/SellerProducts';
import SellerOrders from './pages/dashboard/seller/SellerOrders';
import SellerWallet from './pages/dashboard/seller/SellerWallet';
import SellerRentals from './pages/dashboard/seller/SellerRentals';
import AddProduct from './pages/dashboard/seller/AddProduct';
import AdminLayout from './components/dashboard/admin/AdminLayout';
import AdminOverview from './pages/dashboard/admin/AdminOverview';
import AdminStores from './pages/dashboard/admin/AdminStores';
import AdminProducts from './pages/dashboard/admin/AdminProducts';
import AdminDisputes from './pages/dashboard/admin/AdminDisputes';
import BuyerLayout from './components/dashboard/buyer/BuyerLayout';
import BuyerOverview from './pages/dashboard/buyer/BuyerOverview';
import BuyerOrders from './pages/dashboard/buyer/BuyerOrders';
import BuyerWallet from './pages/dashboard/buyer/BuyerWallet';
import BuyerRentals from './pages/dashboard/buyer/BuyerRentals';
import BuyerDisputes from './pages/dashboard/buyer/BuyerDisputes';
import SupportPage from './pages/dashboard/buyer/SupportPage';
import ProfileSettings from './pages/dashboard/shared/ProfileSettings';
import Checkout from './pages/checkout/Checkout';
import Shop from './pages/shop/Shop';
import ProductDetails from './pages/product-details/ProductDetails';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LiveChat from './components/LiveChat';
import QuickViewModal from './components/QuickViewModal';
import './index.css';

import ComparisonTool from './pages/comparison/ComparisonTool';

function App() {
  return (
    <Router>
      <LiveChat />
      <QuickViewModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/compare" element={<ComparisonTool />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Seller Dashboard Routes */}
        <Route
          path="/dashboard/seller/*"
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <SellerLayout>
                <Routes>
                  <Route path="/" element={<SellerOverview />} />
                  <Route path="/overview" element={<SellerOverview />} />
                  <Route path="/products" element={<SellerProducts />} />
                  <Route path="/products/add" element={<AddProduct />} />
                  <Route path="/orders" element={<SellerOrders />} />
                  <Route path="/wallet" element={<SellerWallet />} />
                  <Route path="/settings" element={<ProfileSettings />} />
                  <Route path="/profile" element={<ProfileSettings />} />
                  <Route path="/rentals" element={<SellerRentals />} />
                  <Route path="/messages" element={<div style={{padding: '30px', background: 'white', borderRadius: '8px'}}><h2>Messages</h2><p>Your inbox is empty.</p></div>} />
                </Routes>
              </SellerLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/dashboard/admin/*"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<AdminOverview />} />
                  <Route path="/overview" element={<AdminOverview />} />
                  <Route path="/stores" element={<AdminStores />} />
                  <Route path="/products" element={<AdminProducts />} />
                  <Route path="/disputes" element={<AdminDisputes />} />
                  <Route path="/profile" element={<ProfileSettings />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Buyer Dashboard Routes */}
        <Route
          path="/dashboard/buyer/*"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <BuyerLayout>
                <Routes>
                  <Route path="/" element={<BuyerOverview />} />
                  <Route path="/overview" element={<BuyerOverview />} />
                  <Route path="/orders" element={<BuyerOrders />} />
                  <Route path="/wallet" element={<BuyerWallet />} />
                  <Route path="/profile" element={<ProfileSettings />} />
                  <Route path="/settings" element={<ProfileSettings />} />
                  <Route path="/rentals" element={<BuyerRentals />} />
                  <Route path="/disputes" element={<BuyerDisputes />} />
                  <Route path="/wishlist" element={<div style={{padding: '30px', background: 'white', borderRadius: '8px'}}><h2>My Wishlist</h2><p>Your wishlist is empty.</p></div>} />
                  <Route path="/addresses" element={<ProfileSettings />} />
                  <Route path="/support" element={<SupportPage />} />
                </Routes>
              </BuyerLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
