import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      // Assuming endpoint exists or fetch all and filter locally for MVP
      const res = await api.get('/products');
      const pending = res.data.filter((p: any) => p.status === 'PENDING_REVIEW');
      setProducts(pending);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'ACTIVE' | 'REJECTED') => {
    try {
      await api.patch(`/products/${id}`, { status });
      alert(`Product marked as ${status}`);
      fetchPendingProducts();
    } catch (err) {
      alert('Failed to update product');
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="admin-overview">
      <div className="dashboard-header">
        <h1>Product Approvals</h1>
      </div>
      
      <div className="recent-orders" style={{ marginTop: '20px' }}>
        <h3>Items Pending Review</h3>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Condition</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign: 'center'}}>No pending products</td></tr>
            ) : (
              products.map(product => (
                <tr key={product.id}>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <img src={product.images?.[0]?.url || 'https://placehold.co/40'} alt={product.name} style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td>{product.category?.name || 'N/A'}</td>
                  <td>{product.salePrice} DZD</td>
                  <td><span className={`status-badge ${product.condition}`}>{product.condition}</span></td>
                  <td>
                    <button onClick={() => updateStatus(product.id, 'ACTIVE')} style={{background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px'}}>Approve</button>
                    <button onClick={() => updateStatus(product.id, 'REJECTED')} style={{background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>Reject</button>
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

export default AdminProducts;
