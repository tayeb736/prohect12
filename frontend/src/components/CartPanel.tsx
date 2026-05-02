import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

export const CartPanel = () => {
  const { cart, setCart, isCartOpen, setIsCartOpen } = useAppContext();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    const user = authService.getCurrentUser();
    setIsCartOpen(false); // Close the cart panel
    if (user) {
      navigate('/checkout'); // User is logged in, go to checkout
    } else {
      // User is not logged in, redirect to register
      alert('Please create an account or login to proceed with checkout.');
      navigate('/register');
    }
  };
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
        const newCart = prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
        localStorage.setItem('ms_cart', JSON.stringify(newCart));
        return newCart;
    });
  };

  const removeItem = (id: number) => {
    setCart(prev => {
        const newCart = prev.filter(item => item.id !== id);
        localStorage.setItem('ms_cart', JSON.stringify(newCart));
        return newCart;
    });
  };

  return (
    <>
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
        id="cartOverlay"
        onClick={() => setIsCartOpen(false)}
        style={{ display: isCartOpen ? 'block' : 'none' }}
      ></div>
      <aside className={`cart-panel ${isCartOpen ? 'open' : ''}`} id="cartPanel" aria-label="Shopping Cart">
        <div className="cart-panel__header">
            <h3 className="cart-panel__title">
                <i className="fas fa-shopping-cart"></i> My Cart (<span>{cartItemCount}</span>)
            </h3>
            <button className="cart-panel__close" aria-label="Close" onClick={() => setIsCartOpen(false)}>
                <i className="fas fa-times"></i>
            </button>
        </div>
        
        <div className="cart-panel__body" id="cartBody">
            {cart.length === 0 ? (
                <div style={{textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)'}}>
                    <i className="fas fa-shopping-basket" style={{fontSize: '3rem', marginBottom: '15px', display: 'block', opacity: 0.5}}></i>
                    <p style={{fontWeight: 600, color: 'var(--text)', marginBottom: '5px'}}>Your cart is empty</p>
                    <p style={{fontSize: '0.9rem', marginBottom: '20px'}}>Discover our premium medical equipment.</p>
                    <button className="btn btn--primary" onClick={() => setIsCartOpen(false)} style={{width: '100%'}}>Start Shopping</button>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="cart-item" style={{display: 'flex', gap: '15px', padding: '15px 0', borderBottom: '1px solid var(--border)'}}>
                        <img src={item.image} alt={item.name} style={{width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px'}} />
                        <div style={{flex: 1}}>
                            <h4 style={{fontSize: '0.9rem', marginBottom: '5px'}}>{item.name}</h4>
                            <div style={{fontWeight: 600, color: 'var(--primary)', marginBottom: '10px'}}>{formatPrice(item.price)}</div>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <div style={{display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px'}}>
                                    <button onClick={() => updateQuantity(item.id, -1)} style={{padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer'}}>-</button>
                                    <span style={{padding: '0 10px', fontSize: '0.9rem'}}>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} style={{padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer'}}>+</button>
                                </div>
                                <button onClick={() => removeItem(item.id)} style={{background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '5px'}}><i className="fas fa-trash-alt"></i></button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {cart.length > 0 && (
            <div className="cart-panel__footer" id="cartFooter">
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: 600, fontSize: '1.1rem'}}>
                    <span>Subtotal:</span>
                    <span>{formatPrice(cartSubtotal)}</span>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <button 
                      className="btn btn--primary" 
                      onClick={handleCheckout}
                      style={{width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'}}
                    >
                      Proceed to Checkout
                    </button>
                    <button className="btn btn--outline" onClick={() => setIsCartOpen(false)} style={{width: '100%', padding: '12px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'}}>Continue Shopping</button>
                </div>
            </div>
        )}
    </aside>
    </>
  );
};
