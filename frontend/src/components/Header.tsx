import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

export const Header = () => {
  const { cart, wishlist, setIsCartOpen, setIsSideNavOpen, theme, setTheme, language, setLanguage } = useAppContext();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const token = localStorage.getItem('ms_token');
  const user = authService.getCurrentUser();
  const dashboardLink = (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') ? '/dashboard/admin' : user?.role === 'SELLER' ? '/dashboard/seller' : '/dashboard/buyer';
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  return (
    <header className="header" id="header">
        <div className="header__top" id="headerTop">
            <span><i className="fas fa-truck-medical"></i> Free shipping across Algeria on orders over 20,000 DZD | CE Certified | ISO 13485 Quality</span>
            <button className="header__top-close" aria-label="Close" onClick={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}><i className="fas fa-times"></i></button>
        </div>
        <div className="container">
            <div className="header__main">
                <button className="hamburger" id="hamburgerBtn" aria-label="Menu" onClick={() => setIsSideNavOpen(true)}>
                    <span className="hamburger__line"></span><span className="hamburger__line"></span><span className="hamburger__line"></span>
                </button>
                <Link to="/" className="header__logo">
                    <i className="fas fa-heartbeat"></i>
                    MediShop<span>Pro</span>
                </Link>
                <div className="search">
                    <input type="text" className="search__input" id="searchInput" placeholder="Search 200+ medical products..." aria-label="Search" />
                    <button 
                      className="search__btn" 
                      aria-label="Search" 
                      style={{ right: '50px' }}
                    >
                      <i className="fas fa-search"></i>
                    </button>
                    <button 
                      aria-label="Voice Search"
                      onClick={() => {
                        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                        if (SpeechRecognition) {
                          const recognition = new SpeechRecognition();
                          recognition.lang = 'ar-DZ'; // or 'fr-FR', 'en-US' based on context
                          recognition.onstart = () => {
                            const input = document.getElementById('searchInput') as HTMLInputElement;
                            input.placeholder = "Listening...";
                            input.style.borderColor = "var(--danger)";
                          };
                          recognition.onresult = (event: any) => {
                            const transcript = event.results[0][0].transcript;
                            const input = document.getElementById('searchInput') as HTMLInputElement;
                            input.value = transcript;
                            input.placeholder = "Search 200+ medical products...";
                            input.style.borderColor = "var(--border)";
                          };
                          recognition.start();
                        } else {
                          alert("Voice search is not supported in your browser.");
                        }
                      }}
                      style={{
                        position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', color: 'var(--primary)', border: 'none',
                        width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer'
                      }}
                    >
                      <i className="fas fa-microphone"></i>
                    </button>
                    <div className="search__suggestions" id="searchSuggestions"></div>
                </div>
                <div className="header__actions" id="headerActions">
                    <button className="header__action-btn btn-compare-hide" aria-label="Compare" id="compareToggle"><i className="fas fa-balance-scale"></i></button>
                    <button className="header__action-btn btn-wishlist-hide" aria-label="Wishlist">
                        <i className="far fa-heart"></i>
                        {wishlist.length > 0 && <span className="header__badge" id="wishlistBadge">{wishlist.length}</span>}
                    </button>
                    <button className="header__action-btn" id="cartToggle" aria-label="Cart" onClick={() => setIsCartOpen(true)}>
                        <i className="fas fa-shopping-cart"></i>
                        {cartItemCount > 0 && <span className="header__badge" id="cartBadge">{cartItemCount}</span>}
                    </button>
                    <button className="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" onClick={() => {
                        setTheme(theme === 'dark' ? 'light' : 'dark');
                    }}>
                        <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                    </button>
                    <div className="auth-buttons" style={{ position: 'relative', marginLeft: '10px' }} ref={profileRef}>
                        {token ? (
                            <>
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    style={{ 
                                        width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', 
                                        color: 'var(--primary)', border: '2px solid var(--primary)', display: 'flex', 
                                        alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <i className="fas fa-user"></i>
                                </button>
                                
                                {isProfileOpen && (
                                    <div style={{
                                        position: 'absolute', top: 'calc(100% + 10px)', right: '0', background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-xl)',
                                        width: '240px', zIndex: 100, overflow: 'hidden', animation: 'slideDown 0.2s ease'
                                    }}>
                                        <div style={{ padding: '15px', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                                            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)' }}>{user?.firstName} {user?.lastName}</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</p>
                                        </div>
                                        <div style={{ padding: '8px 0' }}>
                                            <Link to={dashboardLink} onClick={() => setIsProfileOpen(false)} style={{ display: 'block', padding: '10px 20px', color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem', transition: '0.2s' }}>
                                                <i className="fas fa-chart-line" style={{ width: '20px', color: 'var(--primary)' }}></i> Dashboard
                                            </Link>
                                            <Link to={`${dashboardLink}/settings`} onClick={() => setIsProfileOpen(false)} style={{ display: 'block', padding: '10px 20px', color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem', transition: '0.2s' }}>
                                                <i className="fas fa-cog" style={{ width: '20px', color: 'var(--text-secondary)' }}></i> Settings
                                            </Link>
                                            
                                            <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                                                <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}><i className="fas fa-globe" style={{ width: '20px', color: 'var(--text-secondary)' }}></i> Language</span>
                                                <select 
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                    style={{ border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text)', borderRadius: '4px', padding: '2px 5px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                >
                                                    <option value="en">EN</option>
                                                    <option value="fr">FR</option>
                                                    <option value="ar">AR</option>
                                                </select>
                                            </div>
                                            
                                            <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderTop: '1px solid var(--border)', padding: '12px 20px', color: 'var(--danger)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600, marginTop: '8px' }}>
                                                <i className="fas fa-sign-out-alt" style={{ width: '20px' }}></i> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Link to="/login" className="btn btn-outline" style={{ padding: '8px 15px', borderRadius: '4px', textDecoration: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: '500', fontSize: '0.9rem' }}>Sign In</Link>
                                <Link to="/register" className="btn btn-primary" style={{ padding: '8px 15px', borderRadius: '4px', textDecoration: 'none', background: 'var(--primary)', color: 'white', fontWeight: '500', fontSize: '0.9rem' }}>Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <nav className="nav" id="mainNav">
            <div className="container">
                <ul className="nav__list">
                    <li><Link to="/shop" className="nav__link active" id="megaTrigger"><span>All Categories</span></Link></li>
                    <li><Link to="/shop?filter=offers" className="nav__link"><span>Flash Deals</span><span className="nav__link__hot"></span></Link></li>
                    <li><Link to="/shop?filter=brands" className="nav__link"><span>Brands</span></Link></li>
                    <li><Link to="/shop?filter=new" className="nav__link"><span>New Arrivals</span><span className="nav__link__hot"></span></Link></li>
                    <li><Link to="/shop?filter=best" className="nav__link"><span>Best Sellers</span></Link></li>
                    <li><Link to="/dashboard/buyer/support" className="nav__link"><span>Support 24/7</span></Link></li>
                </ul>
            </div>
        </nav>
    </header>
  );
};
