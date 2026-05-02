import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const BuyerRentals: React.FC = () => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const res = await api.get('/rentals/my-rentals');
      setRentals(res.data);
    } catch (err) {
      console.error('Failed to fetch rentals', err);
    } finally {
      setLoading(false);
    }
  };

  const returnEquipment = async (id: string) => {
    if(!window.confirm('Are you sure you want to return this equipment?')) return;
    try {
      await api.put(`/rentals/${id}/return`);
      alert('Equipment marked as returned. Waiting for seller confirmation to release deposit.');
      fetchRentals();
    } catch (err) {
      alert('Failed to return equipment');
    }
  };

  if (loading) return <div>Loading rentals...</div>;

  return (
    <div className="buyer-overview">
      <div className="dashboard-header">
        <h1>My Rentals</h1>
      </div>
      
      <div className="recent-orders" style={{ marginTop: '20px' }}>
        <h3>Rental History</h3>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Rental ID</th>
              <th>Dates</th>
              <th>Total Rent</th>
              <th>Deposit Status</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '30px'}}>You have not rented any equipment yet</td></tr>
            ) : (
              rentals.map(rental => (
                <tr key={rental.id}>
                  <td><strong>#{rental.rentalNumber || rental.id.substring(0,8)}</strong></td>
                  <td>{new Date(rental.startDate).toLocaleDateString()} to {new Date(rental.endDate).toLocaleDateString()}</td>
                  <td>{rental.totalRentAmount} DZD</td>
                  <td>{rental.depositStatus}</td>
                  <td><span className={`status-badge ${rental.status.toLowerCase()}`}>{rental.status}</span></td>
                  <td>
                    {rental.status === 'ACTIVE' && (
                      <button onClick={() => returnEquipment(rental.id)} style={{background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>Return Item</button>
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

export default BuyerRentals;
