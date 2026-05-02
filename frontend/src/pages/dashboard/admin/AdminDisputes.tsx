import React, { useState } from 'react';

const AdminDisputes: React.FC = () => {
  const mockDisputes = [
    { id: 'DSP-892', buyer: 'Dr. Ahmed', seller: 'MediTech Store', date: '2026-05-01', subject: 'Item arrived damaged', status: 'REQUIRES_ACTION' }
  ];

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
              <th>Buyer</th>
              <th>Seller</th>
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
                <td>{d.buyer}</td>
                <td>{d.seller}</td>
                <td>{d.date}</td>
                <td>{d.subject}</td>
                <td><span className={`status-badge pending`} style={{background: '#fef3c7', color: '#d97706'}}>{d.status}</span></td>
                <td>
                  <button style={{background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>Review Case</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDisputes;
