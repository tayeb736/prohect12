import React, { useState } from 'react';
import api from '../../../services/api';

const BuyerDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  // Mock data for MVP
  const mockDisputes = [
    { id: 'DSP-892', orderId: 'ORD-123', status: 'PENDING', date: '2026-05-01', subject: 'Item arrived damaged' }
  ];

  return (
    <div className="buyer-overview">
      <div className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between'}}>
        <div>
          <h1>Dispute Center</h1>
          <p>Report issues with your orders</p>
        </div>
        <button style={{background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
          <i className="fas fa-exclamation-triangle"></i> Open New Dispute
        </button>
      </div>
      
      <div className="recent-orders" style={{ marginTop: '20px' }}>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Dispute ID</th>
              <th>Order ID</th>
              <th>Date</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockDisputes.map(d => (
              <tr key={d.id}>
                <td><strong>{d.id}</strong></td>
                <td>{d.orderId}</td>
                <td>{d.date}</td>
                <td>{d.subject}</td>
                <td><span className={`status-badge pending`}>{d.status}</span></td>
                <td><button className="btn-secondary">View Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuyerDisputes;
