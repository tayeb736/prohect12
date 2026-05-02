import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SellerProducts.css';

const SellerProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const storeRes = await api.get('/stores/my-store');
        const storeId = storeRes.data.id;
        
        const productsRes = await api.get(`/products?storeId=${storeId}&limit=100`);
        setProducts(productsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch store products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  return (
    <div className="seller-products">
      <div className="page-header">
        <div className="header-text">
          <h1>My Medical Products</h1>
          <p>Manage your inventory and product listings.</p>
        </div>
        <button className="add-btn" onClick={() => navigate('/dashboard/seller/products/add')}>
          <i className="fas fa-plus"></i> Add New Product
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search products..." />
        </div>
        <div className="filter-actions">
          <select>
            <option>All Categories</option>
            <option>Radiology</option>
            <option>Dental</option>
          </select>
          <select>
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      <div className="products-table-container">
        {loading ? (
          <div>Loading products...</div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign: 'center'}}>No products found. Add your first product!</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="product-info-cell">
                      <img src={product.images?.[0] || 'https://placehold.co/100'} alt={product.name} />
                      <div className="name-wrap">
                        <span className="p-name">{product.name}</span>
                        <span className="p-id">ID: {product.id.substring(0,8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td>{product.category?.name || 'Uncategorized'}</td>
                    <td><span className="p-price">{formatPrice(product.salePrice || product.rentPricePerDay || 0)}</span></td>
                    <td>{product.stock} units</td>
                    <td>
                      <span className={`status-tag ${product.status.toLowerCase()}`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="icon-btn edit" title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="icon-btn delete" title="Delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;
