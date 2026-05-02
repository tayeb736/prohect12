import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminOverview.css';

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pendingStores, setPendingStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, storesRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/pending-stores')
        ]);
        setStats(statsRes.data);
        setPendingStores(storesRes.data || []);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVerifyStore = async (storeId: string) => {
    try {
      await api.patch(`/stores/${storeId}/verify`, { status: 'ACTIVE' });
      alert('Store verified successfully!');
      setPendingStores(prev => prev.filter(s => s.id !== storeId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification failed');
    }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  if (loading) return <div>Loading Admin Panel...</div>;

  const cards = [
    { label: 'Total Users', value: stats?.userCount || 0, icon: 'fas fa-users', color: '#3498db' },
    { label: 'Total Stores', value: stats?.storeCount || 0, icon: 'fas fa-store', color: '#2ecc71' },
    { label: 'Platform Sales', value: formatPrice(stats?.totalSales || 0), icon: 'fas fa-coins', color: '#f1c40f' },
    { label: 'Pending Stores', value: pendingStores.length, icon: 'fas fa-clock', color: '#e67e22' },
  ];

  const chartData = [
    { name: 'Mon', sales: 40000 },
    { name: 'Tue', sales: 30000 },
    { name: 'Wed', sales: 65000 },
    { name: 'Thu', sales: 50000 },
    { name: 'Fri', sales: 85000 },
    { name: 'Sat', sales: 45000 },
    { name: 'Sun', sales: 120000 },
  ];

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <h1>Platform Overview</h1>
        <p>Real-time data for MediShop Pro ecosystem.</p>
      </div>

      <div className="admin-stats-grid">
        {cards.map((stat, i) => (
          <div key={i} className="admin-stat-card">
            <div className="icon" style={{ background: stat.color }}>
              <i className={stat.icon}></i>
            </div>
            <div className="info">
              <span className="label">{stat.label}</span>
              <span className="value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        {/* Pending Verifications */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Pending Store Verifications</h3>
            <button className="view-btn">Review All</button>
          </div>
          <div className="pending-list">
            {pendingStores.length === 0 ? (
              <div style={{padding: '10px'}}>No pending verifications.</div>
            ) : (
              pendingStores.map((store) => (
                <div key={store.id} className="pending-item">
                  <div className="store-info">
                    <strong>{store.name}</strong>
                    <span>Owner: {store.owner?.email} | Wilaya: {store.wilaya || 'N/A'}</span>
                  </div>
                  <button className="review-action-btn" onClick={() => handleVerifyStore(store.id)}>Verify</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Activity & Analytics */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Sales Analytics (Last 7 Days)</h3>
          </div>
          <div style={{width: '100%', height: '300px', padding: '20px 0'}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
