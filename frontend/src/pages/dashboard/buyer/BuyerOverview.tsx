import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './BuyerOverview.css';

const BuyerOverview: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, ordersRes, rentalsRes] = await Promise.all([
          api.get('/wallet/my-wallet'),
          api.get('/orders/my-orders'),
          api.get('/rentals/my-rentals')
        ]);
        setWallet(walletRes.data);
        setOrders(ordersRes.data || []);
        setRentals(rentalsRes.data || []);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  if (loading) return <div>Loading overview...</div>;

  const activeRentals = rentals.filter(r => r.status === 'ACTIVE' || r.status === 'CONFIRMED');
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="buyer-overview">
      <div className="overview-header">
        <h1>Welcome Back</h1>
        <p>You have {activeRentals.length} active rentals and {orders.filter(o => o.status === 'PENDING').length} pending orders.</p>
      </div>

      <div className="buyer-stats">
        <div className="buyer-stat-card wallet">
          <div className="icon"><i className="fas fa-wallet"></i></div>
          <div className="details">
            <span>Wallet Balance</span>
            <strong>{formatPrice(wallet?.balance || 0)}</strong>
          </div>
        </div>
        <div className="buyer-stat-card points">
          <div className="icon"><i className="fas fa-shopping-basket"></i></div>
          <div className="details">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>
        </div>
        
        {/* NEW MEDIPOINTS CARD */}
        <div className="buyer-stat-card" style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', right: '-20px', top: '-20px', opacity: 0.2, fontSize: '5rem'}}>
            <i className="fas fa-star"></i>
          </div>
          <div className="icon" style={{background: 'rgba(255,255,255,0.2)', color: 'white'}}><i className="fas fa-medal"></i></div>
          <div className="details">
            <span style={{color: 'rgba(255,255,255,0.9)'}}>MediPoints Loyalty</span>
            <strong>{orders.length * 150} <span style={{fontSize: '0.8rem'}}>Pts</span></strong>
            <div style={{marginTop: '8px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.15)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block'}}>
              {1000 - ((orders.length * 150) % 1000)} pts to Next Reward
            </div>
          </div>
        </div>
      </div>

      <div className="buyer-grid">
        {/* Active Rentals Section */}
        <div className="buyer-card rental-card">
          <h3>Active Rentals</h3>
          <div className="rental-list">
            {activeRentals.length === 0 ? (
              <div style={{padding: '10px', fontSize: '0.9rem'}}>No active rentals.</div>
            ) : (
              activeRentals.map((rental, i) => {
                const totalDays = rental.totalDays || 1;
                const startDate = new Date(rental.startDate);
                const today = new Date();
                const passed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
                const progress = Math.min(100, Math.round((passed / totalDays) * 100));

                return (
                  <div key={i} className="rental-item">
                    <div className="rental-info">
                      <strong>{rental.items?.[0]?.productName || 'Rental Item'}</strong>
                      <span>Store: {rental.items?.[0]?.product?.store?.name || 'Unknown'}</span>
                    </div>
                    <div className="rental-progress">
                      <div className="progress-bar">
                        <div className="fill" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="days-tag">{Math.max(0, totalDays - passed)} days left</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="buyer-card order-card">
          <h3>Recent Orders</h3>
          <div className="order-list">
            {recentOrders.length === 0 ? (
              <div style={{padding: '10px', fontSize: '0.9rem'}}>No orders found.</div>
            ) : (
              recentOrders.map((order, i) => (
                <div key={i} className="order-item">
                  <div className="order-main">
                    <div className="order-id">#{order.id.substring(0, 8).toUpperCase()}</div>
                    <div className="order-date">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className={`order-status ${order.status.toLowerCase()}`}>{order.status}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerOverview;
