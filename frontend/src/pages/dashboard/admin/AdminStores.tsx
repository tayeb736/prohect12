import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './AdminOverview.css';

const AdminStores: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await api.get('/admin/pending-stores');
      setStores(res.data);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyStore = async (id: string, status: 'ACTIVE' | 'REJECTED') => {
    try {
      await api.patch(`/stores/${id}/verify`, { status });
      alert(`Store has been ${status}`);
      fetchStores();
    } catch (err) {
      alert('Failed to update store status');
    }
  };

  if (loading) return <div>Loading stores...</div>;

  return (
    <div className="admin-overview">
      <div className="dashboard-header">
        <h1>Store Verification (KYC)</h1>
      </div>
      
      <div className="recent-orders" style={{ marginTop: '20px' }}>
        <h3>Pending Store Approvals</h3>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Seller Name</th>
              <th>Wilaya</th>
              <th>Tax ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign: 'center'}}>No pending stores</td></tr>
            ) : (
              stores.map(store => (
                <tr key={store.id}>
                  <td><strong>{store.name}</strong></td>
                  <td>{store.sellerProfile?.firstName} {store.sellerProfile?.lastName}</td>
                  <td>{store.wilaya}</td>
                  <td>{store.taxId}</td>
                  <td>
                    <button onClick={() => verifyStore(store.id, 'ACTIVE')} className="btn-approve" style={{background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px'}}>Approve</button>
                    <button onClick={() => verifyStore(store.id, 'REJECTED')} className="btn-reject" style={{background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>Reject</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStores;
