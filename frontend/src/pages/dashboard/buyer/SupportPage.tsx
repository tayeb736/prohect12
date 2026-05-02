import React from 'react';

const SupportPage: React.FC = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '20px' }}>
        <i className="fas fa-headset"></i>
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '20px' }}>24/7 Professional Support</h1>
      <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 40px' }}>
        Our dedicated medical support team is available around the clock to assist with equipment calibration, 
        order inquiries, and technical issues.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <i className="fas fa-phone-alt" style={{ fontSize: '2rem', color: '#10b981', marginBottom: '15px' }}></i>
          <h3>Emergency Hotline</h3>
          <p>+213 (0) 23 45 67 89</p>
        </div>
        <div style={{ padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <i className="fas fa-envelope" style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '15px' }}></i>
          <h3>Email Support</h3>
          <p>support@medishoppro.dz</p>
        </div>
        <div style={{ padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <i className="fas fa-comments" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '15px' }}></i>
          <h3>Live AI Copilot</h3>
          <p>Available in the bottom right corner</p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
