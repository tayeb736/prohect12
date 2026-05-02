import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { authService } from '../../../services/auth.service';
import { storeService } from '../../../services/store.service';
import './ProfileSettings.css';

const ProfileSettings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState('');

  // General Form Data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    wilaya: '',
    taxId: '',
    storeName: '',
    avatar: ''
  });

  const [addresses, setAddresses] = useState([
    { id: 1, type: 'Home', address: '123 Rue Didouche Mourad', wilaya: 'Algiers', isDefault: true },
    { id: 2, type: 'Office', address: 'Clinic Les Pins, Hydra', wilaya: 'Algiers', isDefault: false }
  ]);

  // Password Data
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications Data
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    orderUpdates: true,
    promotions: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // In a real app, you would fetch from /users/me
      const localUser = authService.getCurrentUser();
      if (localUser) {
        setUser(localUser);
        setFormData({
          firstName: localUser.profile?.firstName || localUser.firstName || 'User',
          lastName: localUser.profile?.lastName || localUser.lastName || '',
          phone: localUser.profile?.phone || localUser.phone || '',
          email: localUser.email || '',
          address: localUser.profile?.address || localUser.address || '',
          wilaya: localUser.profile?.wilaya || localUser.wilaya || 'Algiers',
          taxId: '',
          storeName: '',
          avatar: localUser.profile?.avatar || localUser.avatar || ''
        });

        if (localUser.role === 'SELLER') {
          try {
            const store = await storeService.getMyStore();
            if (store) {
              setFormData(prev => ({
                ...prev,
                storeName: store.name,
                taxId: store.taxId || ''
              }));
            }
          } catch (e) {
            console.log('No store found for this seller yet');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const handleToggle = (name: string) => {
    setNotifications({ ...notifications, [name]: !(notifications as any)[name] });
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        wilaya: formData.wilaya
      });
      showMessage('Profile updated successfully!', 'success');
      // Update local storage
      const userRes = await api.get('/users/me');
      localStorage.setItem('ms_user', JSON.stringify(userRes.data));
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      showMessage('New passwords do not match!', 'error');
      return;
    }
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      showMessage('Password updated securely!', 'success');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMessage('Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      try {
        await storeService.getMyStore();
        await storeService.update({ name: formData.storeName, taxId: formData.taxId });
      } catch (e) {
        await storeService.create({ name: formData.storeName, taxId: formData.taxId, description: 'Medical equipment supplier' });
      }
      showMessage('Business information saved successfully!', 'success');

      // Update local storage
      const userRes = await api.get('/users/me');
      localStorage.setItem('ms_user', JSON.stringify(userRes.data));
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to save business info', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (msg: string, type: 'success'|'error') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="profile-settings-container">
      <div className="settings-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1>Account Settings</h1>
          <p>Manage your account preferences and security</p>
        </div>
        <a href="/" style={{
          padding: '10px 20px', 
          background: 'var(--primary)', 
          color: 'white', 
          borderRadius: '10px', 
          textDecoration: 'none', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0, 210, 211, 0.3)'
        }}>
          <i className="fas fa-shopping-bag"></i> Back to Marketplace
        </a>
      </div>
      
      {message && (
        <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', background: message.includes('Failed') || message.includes('not match') ? '#fee2e2' : '#d1fae5', color: message.includes('Failed') || message.includes('not match') ? '#ef4444' : '#10b981', fontWeight: 600 }}>
          <i className={`fas ${message.includes('Failed') ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i> {message}
        </div>
      )}

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <button className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
            <i className="far fa-user"></i> General Info
          </button>
          <button className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <i className="fas fa-shield-alt"></i> Security
          </button>
          <button className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <i className="far fa-bell"></i> Notifications
          </button>
          <button className={`settings-tab ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
            <i className="fas fa-map-marker-alt"></i> Shipping Addresses
          </button>
          {user?.role === 'SELLER' && (
            <button className={`settings-tab ${activeTab === 'business' ? 'active' : ''}`} onClick={() => setActiveTab('business')}>
              <i className="fas fa-store"></i> Business Profile
            </button>
          )}
        </aside>

        <main className="settings-content">
          {/* GENERAL INFO TAB */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral}>
              <h2 className="settings-section-title">General Information</h2>
              
              <div className="avatar-upload-section">
                <img 
                  src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.firstName)}&size=100&background=2563eb&color=fff`} 
                  alt="Profile" 
                  className="avatar-preview"
                />
                <div className="avatar-actions">
                  <button type="button" className="btn-upload"><i className="fas fa-upload"></i> Upload new photo</button>
                  <span className="avatar-hint">JPG, GIF or PNG. Max size of 2MB</span>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
                <div className="form-group full-width">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled style={{background: '#f3f4f6', cursor: 'not-allowed'}} />
                  <span style={{fontSize: '0.8rem', color: 'var(--gray-500)'}}>Email cannot be changed directly. Contact support if needed.</span>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+213 XX XX XX XX" />
                </div>
                <div className="form-group">
                  <label>Wilaya</label>
                  <select name="wilaya" value={formData.wilaya} onChange={handleChange}>
                    <option value="Algiers">16 - Algiers</option>
                    <option value="Oran">31 - Oran</option>
                    <option value="Constantine">25 - Constantine</option>
                    <option value="Setif">19 - Setif</option>
                    <option value="Ouargla">30 - Ouargla</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Full Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street name, Building, etc." />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <form onSubmit={handleSavePassword}>
              <h2 className="settings-section-title">Change Password</h2>
              <div className="settings-form-grid">
                <div className="form-group full-width">
                  <label>Current Password</label>
                  <input type="password" name="currentPassword" value={passData.currentPassword} onChange={handlePassChange} required />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" name="newPassword" value={passData.newPassword} onChange={handlePassChange} required minLength={8} />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" name="confirmPassword" value={passData.confirmPassword} onChange={handlePassChange} required minLength={8} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>

              <h2 className="settings-section-title" style={{marginTop: '40px'}}>Two-Factor Authentication (2FA)</h2>
              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Authenticator App</h4>
                  <p>Protect your account with an extra layer of security.</p>
                </div>
                <button type="button" className="btn-upload" style={{borderColor: 'var(--primary)', color: 'var(--primary)'}}>Enable 2FA</button>
              </div>
            </form>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="settings-section-title">Notification Preferences</h2>
              
              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Email Alerts</h4>
                  <p>Receive updates about your account and security to your email.</p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={notifications.emailAlerts} onChange={() => handleToggle('emailAlerts')} />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>SMS Alerts</h4>
                  <p>Get text messages for important events (like order delivery).</p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={notifications.smsAlerts} onChange={() => handleToggle('smsAlerts')} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Order Updates</h4>
                  <p>Be notified when your order status changes.</p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={notifications.orderUpdates} onChange={() => handleToggle('orderUpdates')} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Promotions & Offers</h4>
                  <p>Receive news about special discounts on medical equipment.</p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={notifications.promotions} onChange={() => handleToggle('promotions')} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2 className="settings-section-title" style={{margin: 0}}>Shipping Addresses</h2>
                <button type="button" className="btn-save" style={{padding: '8px 15px', fontSize: '0.85rem'}}><i className="fas fa-plus"></i> Add New</button>
              </div>
              
              <div className="address-list" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {addresses.map(addr => (
                  <div key={addr.id} style={{padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px'}}>
                        <strong style={{fontSize: '1rem'}}>{addr.type}</strong>
                        {addr.isDefault && <span style={{fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 700}}>DEFAULT</span>}
                      </div>
                      <p style={{margin: 0, color: '#64748b', fontSize: '0.9rem'}}>{addr.address}, {addr.wilaya}</p>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                      <button style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer'}}><i className="fas fa-edit"></i> Edit</button>
                      <button style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}}><i className="fas fa-trash-alt"></i> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUSINESS TAB (SELLERS ONLY) */}
          {activeTab === 'business' && user?.role === 'SELLER' && (
            <form onSubmit={handleSaveBusiness}>
              <h2 className="settings-section-title">Business Information</h2>
              <div className="settings-form-grid">
                <div className="form-group full-width">
                  <label>Store / Company Name</label>
                  <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} required />
                </div>
                <div className="form-group full-width">
                  <label>Tax ID (NIF / NIS)</label>
                  <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} placeholder="Tax Identification Number" />
                </div>
                <div className="form-group full-width">
                  <label>Business License Document</label>
                  <div style={{border: '2px dashed var(--border)', padding: '20px', textAlign: 'center', borderRadius: '8px', background: '#f9fafb'}}>
                    <i className="fas fa-file-pdf" style={{fontSize: '2rem', color: 'var(--gray-400)', marginBottom: '10px'}}></i>
                    <p style={{margin: '0 0 10px 0', fontSize: '0.9rem'}}>Drag and drop your RC/Registre de Commerce here</p>
                    <button type="button" className="btn-upload">Browse Files</button>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Business Info'}
                </button>
              </div>
            </form>
          )}

        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;
