import { useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const CreatorForm = () => {
  const [formData, setFormData] = useState({
    productTitle: '',
    description: '',
    category: '',
    tags: '',
    productPrice: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categories = [
    'Creative Assets',
    'Audio & Music',
    'Video & Animation',
    'Design & Code',
    'eBooks & Documents',
    'Educational Materials',
    'Printable Designs',
    'Digital Art',
    'Software & Apps',
    'Photography'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const productData = {
        creatorId: user.uid,
        creatorEmail: user.email,
        productTitle: formData.productTitle,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        productPrice: parseFloat(formData.productPrice),
        status: isDraft ? 'draft' : 'pending_review',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        note: 'File uploads will be added when Firebase Storage is available'
      };

      const productId = `${user.uid}_${Date.now()}`;
      await setDoc(doc(db, 'products', productId), productData);

      await updateDoc(doc(db, 'users', user.uid), {
        profileComplete: true,
        lastProductId: productId
      });

      if (isDraft) {
        alert('Product saved as draft successfully!');
      } else {
        alert('Product profile completed! File uploads will be added later.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Creator form error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="creator-form-container">
      <button 
        className="btn-back-home"
        onClick={() => navigate('/')}
      >
        ← Back to Home
      </button>
      <div className="creator-form-card">
        <h2>Complete Your Creator Profile</h2>
        <p>Add your first product to get started</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="form-group">
            <label>Product Title *</label>
            <input
              type="text"
              name="productTitle"
              value={formData.productTitle}
              onChange={handleInputChange}
              required
              placeholder="Enter product title"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={6}
              placeholder="Describe your product in detail..."
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g. design, ui/ux, mobile"
            />
          </div>

          <div className="form-group">
            <label>Product Price (credits) *</label>
            <input
              type="number"
              name="productPrice"
              value={formData.productPrice}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter price in credits"
            />
          </div>

          <div className="form-group">
            <label>Product Images</label>
            <div style={{ 
              padding: '1rem', 
              border: '2px dashed #e2e8f0', 
              borderRadius: '8px', 
              textAlign: 'center',
              color: '#666',
              backgroundColor: '#f8f9fa'
            }}>
              📁 File uploads will be available when Firebase Storage is enabled
            </div>
            <small>Multiple images to showcase your product</small>
          </div>

          <div className="form-group">
            <label>Digital File</label>
            <div style={{ 
              padding: '1rem', 
              border: '2px dashed #e2e8f0', 
              borderRadius: '8px', 
              textAlign: 'center',
              color: '#666',
              backgroundColor: '#f8f9fa'
            }}>
              📁 Main digital asset upload will be available later
            </div>
            <small>The main digital asset/file for your product</small>
          </div>

          <div className="form-group">
            <label>Proof of Ownership (optional)</label>
            <div style={{ 
              padding: '1rem', 
              border: '2px dashed #e2e8f0', 
              borderRadius: '8px', 
              textAlign: 'center',
              color: '#666',
              backgroundColor: '#f8f9fa'
            }}>
              📁 Verification document upload will be available later
            </div>
            <small>Upload verification documents if needed</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatorForm;