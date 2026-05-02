import React, { useState, useEffect } from 'react';

const NewsletterPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenNewsletter');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenNewsletter', 'true');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      closePopup();
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
      backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'white', maxWidth: '800px', width: '100%', borderRadius: '24px', 
        overflow: 'hidden', display: 'flex', position: 'relative', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <button 
          onClick={closePopup}
          style={{
            position: 'absolute', top: '15px', right: '15px', background: 'white', 
            border: 'none', width: '30px', height: '30px', borderRadius: '50%', 
            cursor: 'pointer', zIndex: 10, fontSize: '1.2rem'
          }}
        >&times;</button>

        <div style={{ flex: 1, padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {!subscribed ? (
            <>
              <span style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '10px', display: 'block' }}>Join the Elite</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '15px', lineHeight: 1.1 }}>Get <span style={{ color: 'var(--primary)' }}>2,000 DZD</span> Off Your First Order</h2>
              <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '1.1rem' }}>Subscribe to our newsletter and receive exclusive medical industry insights and flash deals directly in your inbox.</p>
              
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="email" 
                  placeholder="Enter your professional email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: 1, padding: '15px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem' }}
                />
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Subscribe</button>
              </form>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '15px' }}>No spam, ever. Unsubscribe with one click.</p>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', color: '#10b981', marginBottom: '20px' }}><i className="fas fa-check-circle"></i></div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '10px' }}>You're on the list!</h2>
              <p style={{ color: '#64748b' }}>Check your email for your discount code.</p>
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'none', md: 'block', background: 'url("https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800") center/cover' }}>
          {/* Decorative image side */}
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;
