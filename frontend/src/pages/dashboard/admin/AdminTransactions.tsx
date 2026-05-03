import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/admin/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div className="admin-overview">
      <div className="dashboard-header">
        <h1>Platform Transactions</h1>
      </div>
      
      <div className="recent-orders" style={{ marginTop: '20px' }}>
        <h3>Recent Sales & Payouts</h3>
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign: 'center'}}>No transactions found</td></tr>
            ) : (
              transactions.map(tx => (
                <tr key={tx.id}>
                  <td><code>{tx.id.substring(0, 8)}</code></td>
                  <td>{tx.type}</td>
                  <td><strong>{tx.amount} DZD</strong></td>
                  <td><span className={`status-badge ${tx.status}`}>{tx.status}</span></td>
                  <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactions;
