import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import './Auth.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'BUYER' | 'SELLER' | 'ADMIN'>('BUYER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Name';

      await authService.register({
        email: formData.email,
        password: formData.password,
        role: role === 'ADMIN' ? 'SUPER_ADMIN' : role,
        firstName: firstName,
        lastName: lastName
      });
      alert('Account created! Please login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <i className="fas fa-user-plus"></i>
          </div>
          <h1>Join MediShop Pro</h1>
          <p>The marketplace for medical excellence</p>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        <div className="role-selector" style={{display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center'}}>
          <button 
            type="button"
            className={`role-btn ${role === 'BUYER' ? 'active' : ''}`}
            onClick={() => setRole('BUYER')}
            disabled={loading}
          >
            I'm a Buyer
          </button>
          <button 
            type="button"
            className={`role-btn ${role === 'SELLER' ? 'active' : ''}`}
            onClick={() => setRole('SELLER')}
            disabled={loading}
          >
            I'm a Seller
          </button>
          <button 
            type="button"
            className={`role-btn ${role === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setRole('ADMIN')}
            disabled={loading}
          >
            I'm an Admin
          </button>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name / Facility Name</label>
            <input 
              type="text" 
              placeholder="e.g. Dr. Malik" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              autoComplete="name"
            />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Min. 8 characters" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              autoComplete="new-password"
            />
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              placeholder="Repeat password" 
              required 
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
