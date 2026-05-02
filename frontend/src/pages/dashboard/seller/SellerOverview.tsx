import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SellerOverview.css';

const SellerOverview: React.FC = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const walletRes = await api.get('/wallet/my-wallet');
        setWallet(walletRes.data);

        const storeRes = await api.get('/stores/my-store');
        if (storeRes.data && storeRes.data.id) {
            setStore(storeRes.data);
            const storeId = storeRes.data.id;
            const [ordersRes, rentalsRes] = await Promise.all([
              api.get(`/orders/store/${storeId}`),
              api.get(`/rentals/store/${storeId}`)
            ]);
    
            setOrders(ordersRes.data || []);
            setRentals(rentalsRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load overview data or no store found:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p || 0)) + ' DZD';

  if (loading) return <div>Loading dashboard...</div>;

  if (!store) {
      return (
          <div className="seller-overview">
              <div className="overview-header">
                <h1>Welcome, Seller!</h1>
                <p>You need to create your store before you can start selling.</p>
                <button className="btn btn-primary" style={{marginTop: '20px'}} onClick={() => navigate('/dashboard/seller/settings')}>Create Store</button>
              </div>
          </div>
      );
  }

  const totalSales = wallet?.transactions
    ?.filter((t: any) => t.type === 'SALE' && t.status === 'PAID')
    ?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0;

  const activeRentals = rentals.filter(r => r.status === 'ACTIVE').length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  const allTransactions = [
    ...orders.map(o => ({
      id: o.id,
      date: new Date(o.createdAt).toLocaleDateString(),
      buyer: o.order?.buyerProfile?.organizationName || `${o.order?.buyerProfile?.firstName} ${o.order?.buyerProfile?.lastName}`,
      total: o.sellerAmount,
      status: o.status,
    })),
    ...rentals.map(r => ({
      id: r.id,
      date: new Date(r.createdAt).toLocaleDateString(),
      buyer: r.buyerProfile?.organizationName || `${r.buyerProfile?.firstName} ${r.buyerProfile?.lastName}`,
      total: r.totalRentAmount,
      status: r.status,
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const stats = [
    { title: 'Total Sales (Paid)', value: formatPrice(totalSales), icon: 'fas fa-money-bill-wave', color: '#007bff' },
    { title: 'Active Rentals', value: activeRentals.toString(), icon: 'fas fa-calendar-check', color: '#2ed573' },
    { title: 'Pending Orders', value: pendingOrders.toString(), icon: 'fas fa-clock', color: '#ffa502' },
    { title: 'Store Status', value: store?.status || 'Unknown', icon: 'fas fa-store', color: store?.status === 'ACTIVE' ? '#2ed573' : '#ff4757' },
  ];

  return (
    <div className="seller-overview">
      <div className="overview-header">
        <h1>Welcome Back, {store?.name || 'Seller'}</h1>
        <p>Here is what's happening with your store today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ '--accent-color': stat.color } as any}>
            <div className="stat-icon">
              <i className={stat.icon}></i>
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <p className="value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="dashboard-card recent-orders">
          <div className="card-header">
            <h2>Recent Orders & Rentals</h2>
            <button className="view-all" onClick={() => navigate('/dashboard/seller/orders')}>View All</button>
          </div>
          <div className="card-content">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {allTransactions.length === 0 ? (
                  <tr><td colSpan={4} style={{textAlign: 'center'}}>No recent activity</td></tr>
                ) : (
                  allTransactions.slice(0, 5).map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.id.substring(0, 8).toUpperCase()}</td>
                      <td>{tx.buyer}</td>
                      <td><span className={`status-badge ${tx.status.toLowerCase()}`}>{tx.status}</span></td>
                      <td>{formatPrice(tx.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="card-content action-buttons">
            <button className="action-btn primary" onClick={() => navigate('/dashboard/seller/products/add')}>
              <i className="fas fa-plus"></i> Add New Product
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/dashboard/seller/wallet')}>
              <i className="fas fa-wallet"></i> View Wallet
            </button>
            <button className="action-btn secondary">
              <i className="fas fa-headset"></i> Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOverview;
