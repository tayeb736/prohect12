import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const SellerRentals: React.FC = () => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      // Assuming endpoint is /rentals/store/:id or getting all store rentals
      // Since we don't have a specific endpoint ready, we mock it or fetch orders and filter
      const res = await api.get('/orders/my-orders'); // Placeholder endpoint, in real life should be /rentals/seller
      setRentals([]); // Keep empty for MVP until rental backend is fully built
    } catch (err) {
      console.error('Failed to fetch rentals', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading rentals...</div>;

  return (
    <div className="seller-overview">
      <div className="dashboard-header">
        <h1>Rentals Management</h1>
      </div>
      
      <div className="recent-orders" style={{ marginTop: '20px' }}>
        <h3>Active & Upcoming Rentals</h3>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Rental ID</th>
              <th>Product</th>
              <th>Dates</th>
              <th>Deposit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '30px'}}>No active rentals currently</td></tr>
            ) : (
              rentals.map(rental => (
                <tr key={rental.id}>
                  <td><strong>#{rental.rentalNumber}</strong></td>
                  <td>{rental.items[0]?.productName}</td>
                  <td>{new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}</td>
                  <td>{rental.depositAmount} DZD</td>
                  <td><span className={`status-badge ${rental.status.toLowerCase()}`}>{rental.status}</span></td>
                  <td><button className="btn-action">View</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerRentals;
