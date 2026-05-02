import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../../services/product.service';
import './AddProduct.css';

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '', // Backend expects categoryId
    description: '',
    type: 'SALE',
    price: '',
    rentPriceDay: '',
    deposit: '',
    stock: '',
    condition: 'NEW',
    brand: '',
    model: '',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400', // Default for now
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Prepare data for backend (converting strings to numbers where needed)
      const submissionData = {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        type: formData.type,
        condition: formData.condition,
        brand: formData.brand,
        model: formData.model,
        salePrice: formData.type !== 'RENT' ? Number(formData.price) : undefined,
        rentPricePerDay: formData.type !== 'SALE' && formData.rentPriceDay ? Number(formData.rentPriceDay) : undefined,
        depositAmount: formData.type !== 'SALE' && formData.deposit ? Number(formData.deposit) : undefined,
        stock: Number(formData.stock),
      };

      await productService.create(submissionData);
      alert('Product listed successfully and is now pending admin review!');
      navigate('/dashboard/seller/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to list product. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/seller/products')}>
          <i className="fas fa-arrow-left"></i> Back to List
        </button>
        <h1>Add New Medical Equipment</h1>
      </div>

      {error && <div className="auth-error-msg">{error}</div>}

      <div className="stepper">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Basic Info</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Pricing & Stock</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Technical Details</div>
      </div>

      <div className="form-container">
        {step === 1 && (
          <div className="form-step">
            <h2>Basic Information</h2>
            <div className="input-group">
              <label>Product Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Philips Affiniti 70 Ultrasound" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Category ID *</label>
                <input 
                  type="text" 
                  placeholder="e.g. radiology-uuid" 
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Condition *</label>
                <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})}>
                  <option value="NEW">Brand New</option>
                  <option value="USED_LIKE_NEW">Refurbished / Like New</option>
                  <option value="USED_GOOD">Used - Good Condition</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>Description *</label>
              <textarea 
                rows={5} 
                placeholder="Describe the technical features..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h2>Pricing & Inventory</h2>
            <div className="input-group">
              <label>Listing Type</label>
              <div className="type-selector">
                <button 
                  className={formData.type === 'SALE' ? 'active' : ''} 
                  onClick={() => setFormData({...formData, type: 'SALE'})}
                >For Sale Only</button>
                <button 
                  className={formData.type === 'RENT' ? 'active' : ''} 
                  onClick={() => setFormData({...formData, type: 'RENT'})}
                >For Rent Only</button>
                <button 
                  className={formData.type === 'BOTH' ? 'active' : ''} 
                  onClick={() => setFormData({...formData, type: 'BOTH'})}
                >Both Sale & Rent</button>
              </div>
            </div>

            {(formData.type === 'SALE' || formData.type === 'BOTH') && (
              <div className="input-group animate-in">
                <label>Sale Price (DZD) *</label>
                <input type="number" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
            )}

            {(formData.type === 'RENT' || formData.type === 'BOTH') && (
              <div className="input-row animate-in">
                <div className="input-group">
                  <label>Daily Rental Rate (DZD) *</label>
                  <input type="number" placeholder="0.00" value={formData.rentPriceDay} onChange={(e) => setFormData({...formData, rentPriceDay: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Security Deposit (DZD) *</label>
                  <input type="number" placeholder="0.00" value={formData.deposit} onChange={(e) => setFormData({...formData, deposit: e.target.value})} />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Available Stock Units *</label>
              <input type="number" placeholder="1" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <h2>Technical Specifications</h2>
            <div className="input-row">
              <div className="input-group">
                <label>Brand / Manufacturer</label>
                <input type="text" placeholder="e.g. Siemens" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Model Number</label>
                <input type="text" placeholder="e.g. XC-500" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} />
              </div>
            </div>
            <div className="upload-zone">
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Image processing integrated.</p>
            </div>
          </div>
        )}

        <div className="form-footer">
          {step > 1 && <button className="btn-secondary" onClick={prevStep} disabled={loading}>Previous</button>}
          {step < 3 ? (
            <button className="btn-primary" onClick={nextStep}>Next Step</button>
          ) : (
            <button className="btn-success" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Processing...' : 'Submit for Review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
