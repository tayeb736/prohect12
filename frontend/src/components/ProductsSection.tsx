import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const ProductsSection = () => {
  const { 
    products, 
    activeCategory, 
    activeFilter, setActiveFilter, 
    currentSort, setCurrentSort,
    wishlist, setWishlist,
    compareList, setCompareList,
    cart, setCart
  } = useAppContext();
  const navigate = useNavigate();

  const [displayCount, setDisplayCount] = useState(24);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
        if (activeCategory !== 'all' && p.category !== activeCategory) return false;
        const tags = p.tags || '';
        if (activeFilter === 'promo' && !tags.includes('promo')) return false;
        if (activeFilter === 'bestseller' && !tags.includes('bestseller')) return false;
        if (activeFilter === 'nouveau' && !tags.includes('nouveau')) return false;
        if (activeFilter === 'under5000' && p.price >= 5000) return false;
        return true;
    });

    switch(currentSort) {
        case 'price-asc': filtered.sort((a,b) => a.price - b.price); break;
        case 'price-desc': filtered.sort((a,b) => b.price - a.price); break;
        case 'name-asc': filtered.sort((a,b) => a.name.localeCompare(b.name)); break;
        case 'name-desc': filtered.sort((a,b) => b.name.localeCompare(a.name)); break;
        case 'rating': filtered.sort((a,b) => b.rating - a.rating); break;
        case 'reviews': filtered.sort((a,b) => (b.reviews || b.totalReviews || 0) - (a.reviews || a.totalReviews || 0)); break;
    }
    return filtered;
  }, [products, activeCategory, activeFilter, currentSort]);

  const toShow = filteredProducts.slice(0, displayCount);
  const showMore = displayCount < filteredProducts.length;

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';
  
  const getStars = (r: number) => {
    const f = Math.floor(r), h = r % 1 >= 0.5 ? 1 : 0, e = 5 - f - h;
    return (
      <>
        {Array(f).fill(0).map((_, i) => <i key={`f-${i}`} className="fas fa-star"></i>)}
        {h ? <i className="fas fa-star-half-alt"></i> : null}
        {Array(e).fill(0).map((_, i) => <i key={`e-${i}`} className="far fa-star"></i>)}
      </>
    );
  };

  const handleWishlist = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setWishlist(prev => {
        const newWishlist = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id];
        localStorage.setItem('ms_wishlist', JSON.stringify(newWishlist));
        return newWishlist;
    });
  };

  const handleCompare = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setCompareList(prev => {
        if (prev.includes(id)) {
            const newList = prev.filter(c => c !== id);
            localStorage.setItem('ms_compare', JSON.stringify(newList));
            return newList;
        }
        if (prev.length >= 4) {
            alert('Max 4 products to compare');
            return prev;
        }
        const newList = [...prev, id];
        localStorage.setItem('ms_compare', JSON.stringify(newList));
        return newList;
    });
  };

  const addToCart = (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
    <section className="products-section container" id="products">
      <div className="section__header">
        <h2 className="section__title"><i className="fas fa-fire"></i> Featured Products</h2>
        <span className="products-count" id="productsCount">Showing {toShow.length} of {filteredProducts.length} products</span>
      </div>

      <div className="filter-bar" id="filterBar">
          <button className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => { setActiveFilter('all'); setDisplayCount(24); }}><span>All Products</span></button>
          <button className={`filter-tab ${activeFilter === 'promo' ? 'active' : ''}`} onClick={() => { setActiveFilter('promo'); setDisplayCount(24); }}><span>Promotions</span></button>
          <button className={`filter-tab ${activeFilter === 'bestseller' ? 'active' : ''}`} onClick={() => { setActiveFilter('bestseller'); setDisplayCount(24); }}><span>Best Sellers</span></button>
          <button className={`filter-tab ${activeFilter === 'nouveau' ? 'active' : ''}`} onClick={() => { setActiveFilter('nouveau'); setDisplayCount(24); }}><span>New Arrivals</span></button>
          <button className={`filter-tab ${activeFilter === 'under5000' ? 'active' : ''}`} onClick={() => { setActiveFilter('under5000'); setDisplayCount(24); }}><span>Under 5,000 DZD</span></button>
          
          <select className="sort-select" value={currentSort} onChange={(e) => setCurrentSort(e.target.value)} aria-label="Sort products">
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
          </select>

          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} aria-label="Grid view"><i className="fas fa-th"></i></button>
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} aria-label="List view"><i className="fas fa-list"></i></button>
          </div>
      </div>

      <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`} id="productsGrid">
        {toShow.length === 0 ? (
           <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)'}}>
             <i className="fas fa-search" style={{fontSize: '3.5rem', marginBottom: '18px', display: 'block', opacity: 0.4}}></i>
             <p style={{fontSize: '1.15rem', fontWeight: 600, color: 'var(--text)'}}>No products found</p>
             <p style={{fontSize: '0.9rem', marginTop: '8px'}}>Try adjusting your filters or search terms</p>
           </div>
        ) : (
          toShow.map((p, i) => {
            const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
            const tags = p.tags || '';
            const isLiked = wishlist.includes(p.id);
            const isCompared = compareList.includes(p.id);
            
            return (
              <div 
                key={p.id} 
                className="product-card" 
                data-id={p.id} 
                onClick={() => navigate(`/product/${p.id}`)}
                style={{ cursor: 'pointer', animationDelay: `${i * 0.03}s`, opacity: 1, transform: 'translateY(0)' }}
              >
                <div className="product-card__image-wrap">
                    <img className="product-card__image" src={p.image} alt={p.name} loading="lazy" onError={(e) => (e.currentTarget.src='https://placehold.co/400x300/E5E7EB/9CA3AF?text=No+Image')} />
                    <div className="product-card__overlay">
                        <button 
                          className="product-card__overlay-btn quick-view-btn" 
                          aria-label="Quick view"
                          onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-quick-view', { detail: p })); }}
                        ><i className="fas fa-eye"></i></button>
                        <button className="product-card__overlay-btn compare-btn" onClick={(e) => handleCompare(e, p.id)} aria-label="Compare">
                          {isCompared ? <i className="fas fa-check"></i> : <i className="fas fa-balance-scale"></i>}
                        </button>
                        <button className="product-card__overlay-btn share-btn" aria-label="Share" onClick={(e) => { e.stopPropagation(); alert('Link copied to clipboard!'); }}><i className="fas fa-share-alt"></i></button>
                    </div>
                    <div className="product-card__badges">
                        {tags.includes('promo') && <span className="badge badge--promo"><i className="fas fa-tag"></i> Sale</span>}
                        {tags.includes('nouveau') && <span className="badge badge--new"><i className="fas fa-sparkles"></i> New</span>}
                        {tags.includes('bestseller') && <span className="badge badge--best"><i className="fas fa-trophy"></i> Top</span>}
                    </div>
                    <button className={`product-card__wishlist ${isLiked ? 'liked' : ''}`} onClick={(e) => handleWishlist(e, p.id)} aria-label="Wishlist">
                      <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
                    </button>
                </div>
                <div className="product-card__body">
                    <div className="product-card__category">{p.category}</div>
                    <h3 className="product-card__name">{p.name}</h3>
                    <div className="product-card__rating">
                        <span className="product-card__stars">{getStars(p.rating)}</span>
                        <span className="product-card__count">({p.reviews || p.totalReviews || 0})</span>
                    </div>
                    <div className="product-card__price-row">
                        <span className="product-card__price">{formatPrice(p.price)}</span>
                        {p.oldPrice && (
                          <>
                            <span className="product-card__old-price">{formatPrice(p.oldPrice)}</span>
                            <span className="product-card__discount">-{discount}%</span>
                          </>
                        )}
                    </div>
                    {p.stock <= 5 && p.stock > 0 && (
                      <div style={{fontSize: '0.75rem', color: 'var(--warning)', marginBottom: '10px', fontWeight: 600}}>
                        <i className="fas fa-clock"></i> Only {p.stock} left!
                      </div>
                    )}
                    <button 
                      className="product-card__btn add-to-cart-btn" 
                      onClick={(e) => addToCart(p, e)}
                      disabled={p.stock === 0} 
                      style={p.stock === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                        <span><i className="fas fa-cart-plus"></i> {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showMore && (
        <div className="load-more-wrap" id="loadMoreWrap">
          <button className="load-more-btn" onClick={() => setDisplayCount(prev => prev + 24)}>
            <span><i className="fas fa-plus-circle"></i> Load More Products</span>
          </button>
        </div>
      )}
    </section>
  );
};
