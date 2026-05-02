import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Checkout.css';

const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    wilaya: 'Algiers',
    fullAddress: '',
    phone: '',
  });

  const handleSubmitOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const saleItems = cart.filter(item => item.type === 'SALE' || item.type === 'BOTH');
      const rentItems = cart.filter(item => item.type === 'RENT');

      const promises = [];

      // 1. Handle Sales (Orders)
      if (saleItems.length > 0) {
        promises.push(api.post('/orders', {
          items: saleItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }));
      }

      // 2. Handle Rentals
      if (rentItems.length > 0) {
        // Note: Real rental needs start/end dates. 
        // For simplicity, we use default dates if not provided in cart.
        for (const item of rentItems) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30); // Default 30 days

          promises.push(api.post('/rentals', {
            productId: item.productId,
            quantity: item.quantity,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }));
        }
      }

      await Promise.all(promises);

      alert('All orders and rentals placed successfully!');
      clearCart();
      navigate('/dashboard/buyer/orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-empty">
        <i className="fas fa-shopping-cart"></i>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')}>Return to Shop</button>
      </div>
    );
  }

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Secure Checkout</h1>
          <div className="checkout-steps">
            <span className={step >= 1 ? 'active' : ''}>1. Shipping</span>
            <span className={step >= 2 ? 'active' : ''}>2. Payment</span>
            <span className={step >= 3 ? 'active' : ''}>3. Review</span>
          </div>
        </div>

        {error && <div className="error-msg" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

        <div className="checkout-grid">
          {/* Left Column: Forms */}
          <div className="checkout-main">
            {step === 1 && (
              <div className="checkout-card">
                <h2>Shipping Information</h2>
                <div className="form-row">
                  <div className="input-group">
                    <label>First Name</label>
                    <input type="text" value={address.firstName} onChange={e => setAddress({...address, firstName: e.target.value})} placeholder="John" />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input type="text" value={address.lastName} onChange={e => setAddress({...address, lastName: e.target.value})} placeholder="Doe" />
                  </div>
                </div>
                <div className="input-group">
                  <label>Wilaya (Algeria)</label>
                  <select value={address.wilaya} onChange={e => setAddress({...address, wilaya: e.target.value})}>
                    <option>Algiers</option>
                    <option>Oran</option>
                    <option>Constantine</option>
                    <option>Setif</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Full Address</label>
                  <textarea rows={3} value={address.fullAddress} onChange={e => setAddress({...address, fullAddress: e.target.value})} placeholder="Street, Building, Apartment..."></textarea>
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="05XXXXXXXX" />
                </div>
                <button className="btn-next" onClick={() => setStep(2)}>Continue to Payment</button>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-card">
                <h2>Payment Method</h2>
                <div className="payment-options">
                  <div className="payment-option active">
                    <input type="radio" name="pay" checked readOnly />
                    <div className="pay-info">
                      <strong>Credit / Debit Card</strong>
                      <span>Pay securely with Stripe</span>
                    </div>
                    <i className="fab fa-cc-visa"></i>
                  </div>
                  <div className="payment-option">
                    <input type="radio" name="pay" disabled />
                    <div className="pay-info">
                      <strong>Cash on Delivery</strong>
                      <span>Available for verified hospitals only</span>
                    </div>
                    <i className="fas fa-truck-loading"></i>
                  </div>
                </div>
                <div className="card-inputs">
                  <input type="text" placeholder="Card Number" />
                  <div className="form-row">
                    <input type="text" placeholder="MM/YY" />
                    <input type="text" placeholder="CVC" />
                  </div>
                </div>
                <div className="actions">
                  <button className="btn-back" onClick={() => setStep(1)}>Back</button>
                  <button className="btn-next" onClick={() => setStep(3)}>Review Order</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-card">
                <h2>Final Review</h2>
                <p>Please confirm your details before placing the order.</p>
                <div className="review-details">
                  <div className="review-section">
                    <strong>Shipping to:</strong>
                    <p>{address.firstName} {address.lastName}, {address.wilaya}, Algeria</p>
                    <p>{address.fullAddress}</p>
                  </div>
                  <div className="review-section">
                    <strong>Payment:</strong>
                    <p>Visa ending in 4242</p>
                  </div>
                </div>
                
                {cart.length > 1 && (
                  <div style={{background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '15px', marginTop: '20px', display: 'flex', gap: '15px', alignItems: 'center'}}>
                    <i className="fas fa-boxes" style={{fontSize: '1.5rem', color: '#3b82f6'}}></i>
                    <div>
                      <strong style={{display: 'block', color: '#1e3a8a', marginBottom: '3px'}}>Split Shipment Notice</strong>
                      <span style={{fontSize: '0.85rem', color: '#1e40af'}}>Your order contains items from different vendors. It will be split into separate shipments with different tracking numbers.</span>
                    </div>
                  </div>
                )}
                
                <div className="actions" style={{marginTop: '25px'}}>
                  <button className="btn-back" onClick={() => setStep(2)}>Back</button>
                  <button className="btn-place" onClick={handleSubmitOrder} disabled={loading}>
                    {loading ? 'Processing...' : 'Place Order Now'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-sidebar">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cart.map((item, i) => (
                  <div key={i} className="summary-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <span className="name">{item.name}</span>
                      <span className="qty">Qty: {item.quantity} x {item.type}</span>
                    </div>
                    <span className="price">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-totals">
                <div className="row">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="row">
                  <span>Shipping</span>
                  <span className="free">FREE</span>
                </div>
                <div className="row total">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
