import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { authService } from '../../services/auth.service';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { CartPanel } from '../../components/CartPanel';
import { Sidebar } from '../../components/Sidebar';
import { ScrollTop } from '../../components/ScrollTop';
import './ProductDetails.css';

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, compareList, setCompareList } = useAppContext();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // Find product by id (fallback to first product for demo if not found)
  const product = products.find(p => String(p.id) === id) || products[0];

  if (!product) return <div>Product not found</div>;

  return (
    <>
      <Sidebar />
      <Header />
      <div className="product-details-page">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="breadcrumb">
          <span onClick={() => navigate('/')}>Home</span> / 
          <span onClick={() => navigate('/shop')}>Shop</span> / 
          <span className="current">{product.name}</span>
        </nav>

        <div className="details-grid">
          {/* Left: Image Gallery */}
          <div className="gallery-section">
            <div className="main-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="thumbnails">
              <img src={product.image} alt="thumb" className="active" />
              <img src="https://images.unsplash.com/photo-1579152276503-346766497f14?auto=format&fit=crop&q=80&w=200" alt="thumb" />
              <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=200" alt="thumb" />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="info-section">
            <span className="badge-category">{product.category}</span>
            <h1>{product.name}</h1>
            <div className="rating-summary">
              <div className="stars">
                {[1,2,3,4,5].map(s => <i key={s} className={`fas fa-star ${s <= Math.floor(product.rating) ? 'filled' : ''}`}></i>)}
              </div>
              <span className="count">({product.reviews} Customer Reviews)</span>
            </div>

            <div className="price-container">
              <span className="current-price">{product.price.toLocaleString()} DZD</span>
              {product.oldPrice && <span className="old-price">{product.oldPrice.toLocaleString()} DZD</span>}
            </div>

            <p className="short-description">
              Professional grade medical equipment designed for high-performance clinical environments. 
              Certified for use in major Algerian hospitals. Includes 2-year manufacturer warranty.
            </p>

            <div className="purchase-actions">
              <div className="qty-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button 
                  className="btn-add-cart"
                  style={{ flex: 1 }}
                  onClick={() => addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity,
                    type: 'SALE'
                  })}
                >
                  <i className="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button 
                  className="btn-buy-now"
                  style={{ flex: 1, backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', padding: '12px' }}
                  onClick={() => {
                    const user = authService.getCurrentUser();
                    if (user) {
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: quantity,
                        type: 'SALE'
                      });
                      navigate('/checkout');
                    } else {
                      alert('You must log in or create an account to complete your purchase.');
                      navigate('/register');
                    }
                  }}
                >
                  <i className="fas fa-bolt"></i> Buy Now
                </button>
              </div>
            </div>

            <div className="rental-promo" style={{background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '20px'}}>
              <div className="promo-text" style={{marginBottom: '15px'}}>
                <strong style={{display: 'block', fontSize: '1.1rem', color: '#1e293b'}}>Need this temporarily?</strong>
                <span style={{color: '#64748b'}}>Rent this equipment for {product.rentPriceDay || 5000} DZD/Day (Deposit: {(product.rentPriceDay || 5000) * 5} DZD)</span>
              </div>
              <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#475569'}}>Start Date</label>
                  <input type="date" id="rentStart" style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                </div>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#475569'}}>End Date</label>
                  <input type="date" id="rentEnd" style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1'}} onChange={(e) => {
                     const start = (document.getElementById('rentStart') as HTMLInputElement).value;
                     const end = e.target.value;
                     if (start && end) {
                       const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24));
                       const cost = days * (product.rentPriceDay || 5000);
                       const dep = (product.rentPriceDay || 5000) * 5;
                       const el = document.getElementById('rentalCalc');
                       if (el) el.innerHTML = `Total for ${days} days: <b>${cost} DZD</b> + Deposit: <b>${dep} DZD</b>`;
                     }
                  }} />
                </div>
              </div>
              <div id="rentalCalc" style={{fontSize: '0.9rem', marginBottom: '15px', color: '#0f172a'}}>Select dates to calculate cost</div>
              <button 
                className="btn-rent-now" 
                style={{width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}
                onClick={() => {
                  const start = (document.getElementById('rentStart') as HTMLInputElement).value;
                  const end = (document.getElementById('rentEnd') as HTMLInputElement).value;
                  if(!start || !end) { alert('Please select start and end dates'); return; }
                  addToCart({
                    id: `${product.id}-rent`,
                    name: `[RENTAL] ${product.name}`,
                    price: (product.rentPriceDay || 5000) + ((product.rentPriceDay || 5000) * 5), // cost + deposit (simplified for MVP)
                    image: product.image,
                    quantity: 1,
                    type: 'RENT'
                  });
                  alert('Rental added to cart!');
                }}
              >
                <i className="fas fa-calendar-check"></i> Book Rental
              </button>
            </div>

            <div className="seller-trust" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <i className="fas fa-verified text-primary"></i>
                <span>Sold by: <strong>MedTech Solutions DZ</strong></span>
              </div>
              <button 
                onClick={() => {
                  if (compareList.includes(product.id)) {
                    navigate('/compare');
                  } else {
                    setCompareList([...compareList, product.id]);
                    alert('Product added to comparison list!');
                  }
                }}
                style={{background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'}}
              >
                <i className="fas fa-balance-scale"></i> Compare
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="tabs-section">
          <div className="tab-headers">
            <button className={activeTab === 'specs' ? 'active' : ''} onClick={() => setActiveTab('specs')}>Technical Specs</button>
            <button className={activeTab === 'desc' ? 'active' : ''} onClick={() => setActiveTab('desc')}>Detailed Description</button>
            <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews</button>
          </div>
          <div className="tab-content">
            {activeTab === 'specs' && (
              <div className="specs-table">
                <div className="row"><span>Manufacturer</span><span>Siemens Healthineers</span></div>
                <div className="row"><span>Model Year</span><span>2025</span></div>
                <div className="row"><span>Power Supply</span><span>220V / 50Hz</span></div>
                <div className="row"><span>Certification</span><span>CE, ISO 13485</span></div>
                <div className="row"><span>Warranty</span><span>24 Months</span></div>
              </div>
            )}
            {activeTab === 'desc' && (
              <div className="detailed-desc">
                <p>This equipment represents the latest in medical technology advancement. It provides highly accurate results with a user-friendly interface designed for doctors and nurses. </p>
                <ul>
                  <li>Energy efficient operation</li>
                  <li>Real-time data synchronization</li>
                  <li>Emergency backup battery included</li>
                </ul>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="reviews-list">
                <div className="submit-review-form" style={{background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0'}}>
                  <h4 style={{marginBottom: '15px'}}>Share your experience</h4>
                  <div className="star-rating-input" style={{marginBottom: '15px', display: 'flex', gap: '8px', fontSize: '1.2rem', color: '#f59e0b'}}>
                    {[1,2,3,4,5].map(s => (
                      <i key={s} className={`${s <= reviewForm.rating ? 'fas' : 'far'} fa-star`} onClick={() => setReviewForm({...reviewForm, rating: s})} style={{cursor: 'pointer'}}></i>
                    ))}
                  </div>
                  <textarea 
                    placeholder="Write your review here..." 
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    style={{width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px'}}
                  />
                  <button 
                    disabled={submitting}
                    onClick={() => {
                      if (!reviewForm.comment) return;
                      setSubmitting(true);
                      setTimeout(() => {
                        alert('Thank you! Your review has been submitted for moderation.');
                        setReviewForm({ rating: 5, comment: '' });
                        setSubmitting(false);
                      }, 1000);
                    }}
                    style={{background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}
                  >
                    {submitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>

                <div className="review-item">
                  <div className="rev-header">
                    <strong>Dr. Ahmed Belkacem</strong>
                    <span><i className="fas fa-star text-warning"></i> 5/5</span>
                  </div>
                  <p>Excellent equipment. The delivery to Oran was very fast and the setup was professional.</p>
                </div>
                <div className="review-item" style={{marginTop: '20px'}}>
                  <div className="rev-header">
                    <strong>Clinic EL-NOUR</strong>
                    <span><i className="fas fa-star text-warning"></i> 4/5</span>
                  </div>
                  <p>Reliable machine. Using it for 3 months now with zero issues. Customer support was helpful during calibration.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    <CartPanel />
    <ScrollTop />
  </>
  );
};

export default ProductDetails;
