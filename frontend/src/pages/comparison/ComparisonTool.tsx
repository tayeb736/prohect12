import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './ComparisonTool.css';

const ComparisonTool: React.FC = () => {
  const { compareList, products, setCompareList } = useAppContext();
  const navigate = useNavigate();

  // Get full product objects for the items in the compare list
  const compareProducts = products.filter(p => compareList.includes(p.id));

  const removeFromCompare = (id: string | number) => {
    setCompareList(prev => prev.filter(itemId => itemId !== id));
  };

  return (
    <div className="comparison-page">
      <div className="container">
        <div className="comparison-header">
          <h1>Product Comparison</h1>
          <p>Compare technical specifications and prices of medical equipment side-by-side.</p>
          <button className="btn-back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Back to Shop
          </button>
        </div>

        {compareProducts.length === 0 ? (
          <div className="empty-compare">
            <i className="fas fa-balance-scale"></i>
            <h3>Your comparison list is empty</h3>
            <p>Go back to the shop and add some products to compare.</p>
            <button onClick={() => navigate('/shop')}>Explore Shop</button>
          </div>
        ) : (
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Features</th>
                  {compareProducts.map(product => (
                    <th key={product.id}>
                      <div className="product-compare-header">
                        <button className="remove-btn" onClick={() => removeFromCompare(product.id)}>&times;</button>
                        <img src={product.image} alt={product.name} />
                        <h4>{product.name}</h4>
                        <span className="price">{product.price.toLocaleString()} DZD</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Category</td>
                  {compareProducts.map(p => <td key={p.id}>{p.category}</td>)}
                </tr>
                <tr>
                  <td>Rating</td>
                  {compareProducts.map(p => (
                    <td key={p.id}>
                      <div className="stars">
                        <i className="fas fa-star text-warning"></i> {p.rating} ({p.reviews} reviews)
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Manufacturer</td>
                  {compareProducts.map(p => <td key={p.id}>Medical Global Ltd.</td>)}
                </tr>
                <tr>
                  <td>Warranty</td>
                  {compareProducts.map(p => <td key={p.id}>24 Months</td>)}
                </tr>
                <tr>
                  <td>Availability</td>
                  {compareProducts.map(p => <td key={p.id} className="text-success">In Stock</td>)}
                </tr>
                <tr>
                  <td>Action</td>
                  {compareProducts.map(p => (
                    <td key={p.id}>
                      <button className="btn-add-to-cart" onClick={() => navigate(`/product/${p.id}`)}>
                        View Details
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonTool;
