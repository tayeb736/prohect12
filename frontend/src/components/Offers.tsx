import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const Offers = () => {
  const { products, cart, setCart } = useAppContext();
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: { h: number, m: number, s: number } }>({});

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  // Get flash deals (products with 'promo' tag)
  const offers = products.filter(p => p.tags && p.tags.includes('promo')).slice(0, 4);

  // Set a fake deadline for UI purposes (e.g., end of current day or next 48 hours)
  const deadlines = offers.reduce((acc, offer, index) => {
    // Make deadlines slightly different based on index
    acc[offer.id] = Date.now() + (index + 1) * 24 * 60 * 60 * 1000 - 3600000 * index;
    return acc;
  }, {} as { [key: string]: number });

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      const newTimeLeft: { [key: string]: { h: number, m: number, s: number } } = {};
      
      offers.forEach(offer => {
        const deadline = deadlines[offer.id] || now;
        const diff = Math.max(0, deadline - now);
        
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        newTimeLeft[offer.id] = { h, m, s };
      });
      
      setTimeLeft(newTimeLeft);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [products]); // Depend on products so it re-runs when products load

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

  if (offers.length === 0) return null;

  return (
    <section className="offers-section" id="offers">
      <div className="container">
        <div className="offers__header">
          <h2 className="offers__title"><i className="fas fa-clock"></i> Flash Deals – Limited Time!</h2>
          <p className="offers__subtitle">Don't miss these exceptional deals on certified medical equipment.</p>
        </div>
        <div className="offers__grid">
          {offers.map((offer) => {
            const discount = offer.oldPrice ? Math.round((1 - offer.price / offer.oldPrice) * 100) : 10;
            const time = timeLeft[offer.id] || { h: 0, m: 0, s: 0 };
            
            return (
              <div className="offer-card" key={offer.id}>
                <div className="offer-card__image-wrap">
                  <span className="offer-card__discount">-{discount}% OFF</span>
                  <img src={offer.image} alt={offer.name} className="offer-card__image" loading="lazy" onError={(e) => (e.currentTarget.src='https://placehold.co/400x250/E5E7EB/9CA3AF?text=No+Image')} />
                </div>
                <div className="offer-card__body">
                  <h3 className="offer-card__name">{offer.name}</h3>
                  <div className="offer-card__price-row">
                    <span className="offer-card__price">{formatPrice(offer.price)}</span>
                    {offer.oldPrice && <span className="offer-card__old-price">{formatPrice(offer.oldPrice)}</span>}
                  </div>
                  <div className="offer-card__timer">
                    <div className="timer-block">
                      <span className="timer-block__number">{String(time.h).padStart(2, '0')}</span>
                      <span className="timer-block__label">Hours</span>
                    </div>
                    <div className="timer-block">
                      <span className="timer-block__number">{String(time.m).padStart(2, '0')}</span>
                      <span className="timer-block__label">Mins</span>
                    </div>
                    <div className="timer-block">
                      <span className="timer-block__number">{String(time.s).padStart(2, '0')}</span>
                      <span className="timer-block__label">Secs</span>
                    </div>
                  </div>
                  <button className="offer-card__btn" onClick={() => addToCart(offer)}>
                    <i className="fas fa-cart-plus"></i> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
