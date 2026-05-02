import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './SellerLayout.css';
import { authService } from '../../../services/auth.service';

interface SellerLayoutProps {
  children: React.ReactNode;
}

const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const profileName = user?.profile?.storeName || (user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email) || 'Seller';

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Back to Marketplace', path: '/', icon: 'fas fa-arrow-left' },
    { name: 'Overview', path: '/dashboard/seller', icon: 'fas fa-chart-line' },
    { name: 'My Products', path: '/dashboard/seller/products', icon: 'fas fa-box' },
    { name: 'Orders', path: '/dashboard/seller/orders', icon: 'fas fa-shopping-cart' },
    { name: 'Rentals', path: '/dashboard/seller/rentals', icon: 'fas fa-calendar-alt' },
    { name: 'Store Profile', path: '/dashboard/seller/profile', icon: 'fas fa-store' },
    { name: 'Wallet', path: '/dashboard/seller/wallet', icon: 'fas fa-wallet' },
    { name: 'Messages', path: '/dashboard/seller/messages', icon: 'fas fa-comments' },
    { name: 'Settings', path: '/dashboard/seller/settings', icon: 'fas fa-cog' },
  ];

  return (
    <div className="seller-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-hand-holding-medical"></i>
            <span>MediShop PRO</span>
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <i className={`fas ${isSidebarOpen ? 'fa-chevron-left' : 'fa-bars'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={item.icon}></i>
              <span className="nav-text">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search orders, products..." />
          </div>
          <div className="header-actions">
            <div className="notification-bell">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </div>
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{profileName}</span>
                <span className="user-role">{user?.role || 'Seller'}</span>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=random`} alt="Avatar" />
            </div>
          </div>
        </header>

        <section className="page-container">
          {children}
        </section>
      </main>
    </div>
  );
};

export default SellerLayout;
