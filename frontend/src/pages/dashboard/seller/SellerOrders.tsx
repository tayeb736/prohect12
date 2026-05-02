import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './SellerOrders.css';

const SellerOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const storeRes = await api.get('/stores/my-store');
        const storeId = storeRes.data.id;

        const [ordersRes, rentalsRes] = await Promise.all([
          api.get(`/orders/store/${storeId}`),
          api.get(`/rentals/store/${storeId}`)
        ]);

        setOrders(ordersRes.data || []);
        setRentals(rentalsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  if (loading) return <div>Loading orders...</div>;

  const allTransactions = [
    ...orders.map(o => ({
      id: o.id,
      date: new Date(o.createdAt).toLocaleDateString(),
      buyer: o.order?.buyerProfile?.organizationName || `${o.order?.buyerProfile?.firstName} ${o.order?.buyerProfile?.lastName}`,
      total: o.sellerAmount,
      status: o.status,
      type: 'SALE'
    })),
    ...rentals.map(r => ({
      id: r.id,
      date: new Date(r.createdAt).toLocaleDateString(),
      buyer: r.buyerProfile?.organizationName || `${r.buyerProfile?.firstName} ${r.buyerProfile?.lastName}`,
      total: r.totalRentAmount,
      status: r.status,
      type: 'RENTAL'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="seller-orders">
      <div className="page-header">
        <h1>Order Management</h1>
        <div className="orders-filters">
          <select className="filter-select">
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          <input type="text" placeholder="Search orders..." className="search-input" />
        </div>
      </div>

      <div className="orders-table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>Buyer</th>
              <th>Total Amount (Net)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allTransactions.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign: 'center'}}>No orders found</td></tr>
            ) : (
              allTransactions.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.id.substring(0, 8).toUpperCase()}</td>
                  <td>{tx.date}</td>
                  <td><span className={`status-badge ${tx.type === 'SALE' ? 'completed' : 'pending'}`}>{tx.type}</span></td>
                  <td>{tx.buyer}</td>
                  <td><strong>{formatPrice(tx.total)}</strong></td>
                  <td>
                    <span className={`status-badge ${tx.status.toLowerCase()}`}>{tx.status}</span>
                  </td>
                  <td>
                    <button className="btn-icon" title="View Details"><i className="fas fa-eye"></i></button>
                    {tx.type === 'RENTAL' && tx.status === 'ACTIVE' && (
                      <button className="btn-icon" title="Process Return" onClick={() => alert('Process return not fully implemented here yet')}><i className="fas fa-box-open"></i></button>
                    )}
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

export default SellerOrders;
