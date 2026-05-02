import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './BuyerLayout.css';
import { authService } from '../../../services/auth.service';

interface BuyerLayoutProps {
  children: React.ReactNode;
}

const BuyerLayout: React.FC<BuyerLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const profileName = user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email || 'Patient';

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Back to Marketplace', path: '/', icon: 'fas fa-arrow-left' },
    { name: 'Overview', path: '/dashboard/buyer', icon: 'fas fa-chart-pie' },
    { name: 'Profile Settings', path: '/dashboard/buyer/profile', icon: 'fas fa-user-circle' },
    { name: 'My Orders', path: '/dashboard/buyer/orders', icon: 'fas fa-box-open' },
    { name: 'Active Rentals', path: '/dashboard/buyer/rentals', icon: 'fas fa-hourglass-half' },
    { name: 'Disputes', path: '/dashboard/buyer/disputes', icon: 'fas fa-exclamation-triangle' },
    { name: 'My Wishlist', path: '/dashboard/buyer/wishlist', icon: 'fas fa-heart' },
    { name: 'My Wallet', path: '/dashboard/buyer/wallet', icon: 'fas fa-wallet' },
    { name: 'Shipping Addresses', path: '/dashboard/buyer/addresses', icon: 'fas fa-map-marker-alt' },
    { name: 'Help & Support', path: '/dashboard/buyer/support', icon: 'fas fa-headset' },
  ];

  return (
    <div className="buyer-dashboard">
      <aside className={`buyer-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="buyer-logo">
          <i className="fas fa-heartbeat"></i>
          <span>MediShop Buyer</span>
        </div>

        <nav className="buyer-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`buyer-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={item.icon}></i>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="buyer-sidebar-footer">
          <button className="logout-link" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</button>
        </div>
      </aside>

      <main className="buyer-main">
        <header className="buyer-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <i className="fas fa-bars"></i>
          </button>
          <div className="header-user">
            <div className="notifications">
              <i className="far fa-bell"></i>
              <span className="dot"></span>
            </div>
            <span className="username">{profileName}</span>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=00d2d3&color=fff`} alt="User" />
          </div>
        </header>

        <section className="buyer-content">
          {children}
        </section>
      </main>
    </div>
  );
};

export default BuyerLayout;
