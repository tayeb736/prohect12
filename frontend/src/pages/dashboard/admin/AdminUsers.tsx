import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="admin-overview">
      <div className="dashboard-header">
        <h1>Platform Users</h1>
      </div>
      
      <div className="recent-orders" style={{ marginTop: '20px' }}>
        <h3>All Registered Users</h3>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const profile = user.role === 'BUYER' ? user.buyerProfile : user.role === 'SELLER' ? user.sellerProfile : user.adminProfile;
              const name = profile ? `${profile.firstName} ${profile.lastName}` : 'N/A';
              return (
                <tr key={user.id}>
                  <td><strong>{name}</strong></td>
                  <td>{user.email}</td>
                  <td><span className={`status-badge ${user.role}`}>{user.role}</span></td>
                  <td><span className={`status-badge ${user.status}`}>{user.status}</span></td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
