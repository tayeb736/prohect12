import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const Modal = () => {
  const [product, setProduct] = useState<any | null>(null);
  const { setCart } = useAppContext();

  useEffect(() => {
    const handleOpen = (e: any) => {
      setProduct(e.detail);
    };
    window.addEventListener('open-quick-view', handleOpen);
    return () => window.removeEventListener('open-quick-view', handleOpen);
  }, []);

  if (!product) return null;

  const close = () => setProduct(null);

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  const addToCart = () => {
    setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        const newCart = existing 
            ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            : [...prev, { ...product, quantity: 1 }];
        localStorage.setItem('ms_cart', JSON.stringify(newCart));
        return newCart;
    });
    alert('Added to cart!');
    close();
  };

  return (
    <div className="modal-overlay show" id="modalOverlay" onClick={close}>
      <div className="modal open" id="quickViewModal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" id="modalClose" aria-label="Close" onClick={close}>
          <i className="fas fa-times"></i>
        </button>
        <div className="modal__content" id="modalContent">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <img 
                src={product.image} 
                alt={product.name} 
                style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} 
                onError={(e) => (e.currentTarget.src='https://placehold.co/400x300/E5E7EB/9CA3AF?text=No+Image')}
              />
            </div>
            <div>
              <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '10px' }}>{product.category}</div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>{product.name}</h2>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '20px' }}>
                {formatPrice(product.price)}
                {product.oldPrice && <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1rem', marginLeft: '10px' }}>{formatPrice(product.oldPrice)}</span>}
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: 1.6 }}>
                {product.description || 'Premium medical equipment certified for professional use. Guaranteed quality and compliance with health standards.'}
              </p>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button className="btn btn--primary" onClick={addToCart} style={{ flex: 1 }} disabled={product.stock === 0}>
                  <i className="fas fa-cart-plus"></i> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button className="btn btn--outline" onClick={close}>Close</button>
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <div style={{ marginTop: '15px', color: 'var(--warning)', fontWeight: 600 }}>
                  <i className="fas fa-clock"></i> Hurry! Only {product.stock} items left in stock.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
