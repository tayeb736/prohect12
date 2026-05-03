import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const AdminDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/admin/disputes');
      setDisputes(res.data);
    } catch (err) {
      console.error('Failed to fetch disputes', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading disputes...</div>;

  return (
    <div className="admin-overview">
      <div className="dashboard-header">
        <h1>Disputes Resolution Center</h1>
        <p>Review and resolve issues between buyers and sellers</p>
      </div>
      
      <div className="recent-orders" style={{ marginTop: '20px' }}>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Dispute ID</th>
              <th>Opened By</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {disputes.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign: 'center'}}>No active disputes</td></tr>
            ) : (
              disputes.map(d => {
                const opener = d.openedBy?.email || 'Unknown';
                return (
                  <tr key={d.id}>
                    <td><strong>{d.id.substring(0, 8)}</strong></td>
                    <td>{opener}</td>
                    <td>{d.subject}</td>
                    <td><span className={`status-badge ${d.status}`}>{d.status}</span></td>
                    <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button style={{background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>Review Case</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDisputes;
