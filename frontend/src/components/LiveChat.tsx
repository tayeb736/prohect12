import React, { useState } from 'react';

const LiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([
    { sender: 'ai', text: 'Hello Doctor! I am MediAI Copilot. Are you opening a new clinic or looking for specific equipment?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'me', text: input }]);
    setInput('');
    setIsTyping(true);
    
    // Mock AI analysis delay
    setTimeout(() => {
      let reply = "Based on your request, I recommend our 'Standard Clinic Package' which includes an Examination Table, Sterilizer, and Basic Surgical Kit. Would you like me to add these to your cart?";
      if (input.toLowerCase().includes('dental')) {
        reply = "For a dental clinic, you will need a Dental Chair Unit, Autoclave, and an Intraoral Camera. I found 3 highly-rated sellers for these. Should I show them?";
      }
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '30px', right: '30px', width: '65px', height: '65px', 
          borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: 'white', border: 'none', 
          boxShadow: '0 10px 25px rgba(139,92,246,0.5)', cursor: 'pointer', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        <i className={isOpen ? "fas fa-times" : "fas fa-robot"}></i>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '110px', right: '30px', width: '380px', height: '500px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px',
          boxShadow: 'var(--shadow-3d)', zIndex: 9999, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', animation: 'slideUp 0.3s ease'
        }}>
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', padding: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', backdropFilter: 'blur(5px)' }}>
              <i className="fas fa-brain"></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>MediAI Copilot</h3>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Your Intelligent Equipment Assistant</span>
            </div>
          </div>
          
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', background: 'var(--bg-main)' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ 
                  background: msg.sender === 'me' ? '#3b82f6' : 'var(--bg-secondary)', 
                  color: msg.sender === 'me' ? 'white' : 'var(--text)', 
                  padding: '12px 18px', borderRadius: '18px', 
                  borderBottomRightRadius: msg.sender === 'me' ? '4px' : '18px', 
                  borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '18px',
                  boxShadow: 'var(--shadow-sm)', fontSize: '0.95rem', border: msg.sender === 'me' ? 'none' : '1px solid var(--border)',
                  lineHeight: '1.5'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: '18px', borderBottomLeftRadius: '4px', border: '1px solid var(--border)' }}>
                <span style={{display: 'inline-block', width: '8px', height: '8px', background: '#8b5cf6', borderRadius: '50%', margin: '0 2px', animation: 'bounceIn 1s infinite'}}></span>
                <span style={{display: 'inline-block', width: '8px', height: '8px', background: '#8b5cf6', borderRadius: '50%', margin: '0 2px', animation: 'bounceIn 1s infinite 0.2s'}}></span>
                <span style={{display: 'inline-block', width: '8px', height: '8px', background: '#8b5cf6', borderRadius: '50%', margin: '0 2px', animation: 'bounceIn 1s infinite 0.4s'}}></span>
              </div>
            )}
          </div>
          
          <div style={{ padding: '15px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me to find equipment..." 
              style={{ flex: 1, padding: '12px 15px', borderRadius: '25px', border: '1px solid var(--border)', outline: 'none', background: 'var(--bg-main)', color: 'var(--text)', fontSize: '0.95rem' }}
            />
            <button 
              onClick={handleSend}
              style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#8b5cf6', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChat;
