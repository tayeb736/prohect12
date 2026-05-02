import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './Shop.css';

const Shop: React.FC = () => {
  const { products, addToCart, loading } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const [priceRange, setPriceRange] = useState(5000000);

  if (loading) return <div className="shop-loading">Loading medical catalog...</div>;

  let filteredProducts = [...products];
  if (filter === 'new') {
    filteredProducts = filteredProducts.slice(0, 4); // Simulate new arrivals
  } else if (filter === 'best') {
    filteredProducts = filteredProducts.filter(p => p.rating >= 4.8); // Simulate best sellers
  }

  return (
    <div className="shop-page">
      <div className="container">
        <div className="shop-layout">
          {/* Sidebar Filters */}
          <aside className="shop-sidebar">
            <div className="filter-group">
              <h3>Categories</h3>
              <div className="filter-list">
                <label><input type="checkbox" /> Radiology</label>
                <label><input type="checkbox" /> Dental Equipment</label>
                <label><input type="checkbox" /> Surgical Tools</label>
                <label><input type="checkbox" /> Patient Monitors</label>
              </div>
            </div>

            <div className="filter-group">
              <h3>Listing Type</h3>
              <div className="filter-list">
                <label><input type="radio" name="type" /> All Items</label>
                <label><input type="radio" name="type" /> For Sale</label>
                <label><input type="radio" name="type" /> For Rent</label>
              </div>
            </div>

            <div className="filter-group">
              <h3>Price Range (DZD)</h3>
              <input 
                type="range" 
                min="0" 
                max="5000000" 
                step="10000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
              />
              <div className="price-labels">
                <span>0</span>
                <span>{priceRange.toLocaleString()} DZD</span>
              </div>
            </div>

            <div className="filter-group">
              <h3>Location (Wilaya)</h3>
              <select className="filter-select">
                <option>All Algeria</option>
                <option>Algiers</option>
                <option>Oran</option>
                <option>Setif</option>
              </select>
            </div>
          </aside>

          {/* Main Products Area */}
          <main className="shop-main">
            <div className="shop-header">
              <h2>Found {products.length} Products</h2>
              <div className="sort-box">
                <span>Sort by:</span>
                <select>
                  <option>Latest Arrivals</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Top Rated</option>
                </select>
              </div>
            </div>

            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="shop-product-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="image-wrap">
                    <img src={product.image} alt={product.name} />
                    <button className="wishlist-btn" onClick={(e) => e.stopPropagation()}><i className="far fa-heart"></i></button>
                    {product.type === 'RENT' && <span className="rent-tag">Rental</span>}
                  </div>
                  <div className="content">
                    <span className="category">
                      {typeof product.category === 'object' ? product.category.name : product.category}
                    </span>
                    <h3 className="name">{product.name}</h3>
                    <div className="rating">
                      <i className="fas fa-star"></i>
                      <span>{product.rating} ({product.reviews})</span>
                    </div>
                    <div className="footer">
                      <div className="price-box">
                        <span className="price">{product.price.toLocaleString()} DZD</span>
                        {product.oldPrice && <span className="old-price">{product.oldPrice.toLocaleString()} DZD</span>}
                      </div>
                      <button 
                        className="add-to-cart"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            quantity: 1,
                            type: 'SALE'
                          });
                        }}
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
