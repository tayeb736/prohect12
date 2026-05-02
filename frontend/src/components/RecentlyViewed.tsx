import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const RecentlyViewed = () => {
  const { products, cart, setCart } = useAppContext();
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<number[]>([]);

  useEffect(() => {
    // Read recently viewed from local storage
    try {
      const stored = JSON.parse(localStorage.getItem('ms_recently') || '[]');
      setRecentlyViewedIds(stored);
    } catch {
      // Ignore
    }

    // Optional: listen to custom event if other components update it
    const handleRecentUpdate = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('ms_recently') || '[]');
        setRecentlyViewedIds(stored);
      } catch {}
    };
    window.addEventListener('ms_recently_updated', handleRecentUpdate);
    return () => window.removeEventListener('ms_recently_updated', handleRecentUpdate);
  }, []);

  if (recentlyViewedIds.length === 0 || products.length === 0) return null;

  const recentProducts = recentlyViewedIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as any[];

  if (recentProducts.length === 0) return null;

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  const addToCart = (product: any) => {
    setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        const newCart = existing 
            ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            : [...prev, { ...product, quantity: 1 }];
        localStorage.setItem('ms_cart', JSON.stringify(newCart));
        return newCart;
    });
    alert('Added to cart!');
  };

  return (
    <section className="recently-section" id="recentlySection">
      <div className="container">
        <h2 className="recently__title"><i className="fas fa-clock-rotate-left"></i> Recently Viewed</h2>
        <div className="recently-scroll" id="recentlyGrid">
          {recentProducts.map((p) => (
            <div className="recently-item" key={p.id}>
              <img src={p.image} alt={p.name} className="recently-item__img" loading="lazy" onError={(e) => (e.currentTarget.src='https://placehold.co/100x100/E5E7EB/9CA3AF?text=No+Image')} />
              <div className="recently-item__details">
                <div className="recently-item__name">{p.name}</div>
                <div className="recently-item__price">{formatPrice(p.price)}</div>
                <button className="recently-item__btn" onClick={() => addToCart(p)}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
