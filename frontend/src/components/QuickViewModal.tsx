import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const QuickViewModal: React.FC = () => {
  const [product, setProduct] = useState<any>(null);
  const { addToCart } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setProduct(customEvent.detail);
      }
    };
    
    window.addEventListener('open-quick-view', handleOpen);
    return () => window.removeEventListener('open-quick-view', handleOpen);
  }, []);

  if (!product) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--bg-secondary)', width: '90%', maxWidth: '800px', borderRadius: '16px',
        overflow: 'hidden', display: 'flex', position: 'relative', boxShadow: 'var(--shadow-2xl)'
      }}>
        <button 
          onClick={() => setProduct(null)}
          style={{ position: 'absolute', top: '15px', right: '15px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)', color: 'var(--text)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <i className="fas fa-times"></i>
        </button>
        
        <div style={{ width: '45%', background: 'var(--bg-main)' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        
        <div style={{ width: '55%', padding: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--text)' }}>{product.name}</h2>
          <div style={{ color: 'var(--primary)', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px' }}>
            {product.price} DZD
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: 1.6 }}>
            Premium medical equipment ensuring top reliability. Suitable for clinics, hospitals, and independent practices. CE Certified.
          </p>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => {
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  quantity: 1,
                  type: 'SALE'
                });
                alert('Added to cart!');
              }}
              style={{ flex: 1, background: 'var(--primary)', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Add to Cart
            </button>
            <button 
              onClick={() => {
                setProduct(null);
                navigate(`/product/${product.id}`);
              }}
              style={{ flex: 1, background: 'transparent', color: 'var(--primary)', border: '2px solid var(--primary)', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
