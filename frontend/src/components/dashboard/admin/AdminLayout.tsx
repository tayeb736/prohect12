import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';
import { authService } from '../../../services/auth.service';
import api from '../../../services/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const profileName = user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email || 'Admin';

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Control Panel', path: '/dashboard/admin', icon: 'fas fa-chart-line' },
    { name: 'Store Requests', path: '/dashboard/admin/stores', icon: 'fas fa-store-alt' },
    { name: 'Product Approval', path: '/dashboard/admin/products', icon: 'fas fa-check-circle' },
    { name: 'Disputes', path: '/dashboard/admin/disputes', icon: 'fas fa-exclamation-triangle' },
    { name: 'Transactions', path: '/dashboard/admin/transactions', icon: 'fas fa-exchange-alt' },
    { name: 'All Users', path: '/dashboard/admin/users', icon: 'fas fa-users' },
    { name: 'Settings', path: '/dashboard/admin/profile', icon: 'fas fa-cog' },
  ];

  return (
    <div className="admin-dashboard">
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <i className="fas fa-user-shield"></i>
            <span>ADMIN CENTER</span>
          </div>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={item.icon}></i>
              <span className="nav-text">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-info">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=000&color=fff`} alt="Admin" />
            {isSidebarOpen && (
              <div className="text">
                <span className="name">{profileName}</span>
                <span className="status">Online</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <button className="toggle-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <i className="fas fa-bars"></i>
          </button>
          <div className="header-right">
            <div className="system-status">
              <span className="pulse"></span> System Healthy
            </div>
            <button className="logout-btn" onClick={handleLogout}><i className="fas fa-power-off"></i></button>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
