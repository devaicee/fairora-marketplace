import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load existing form data if available
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const creatorFormDoc = await getDoc(doc(db, 'creator_forms', `creator_${user.uid}`));
          if (creatorFormDoc.exists()) {
            const existingData = creatorFormDoc.data();
            setFormData({
              productTitle: existingData.productTitle || '',
              description: existingData.description || '',
              category: existingData.category || '',
              tags: Array.isArray(existingData.tags) ? existingData.tags.join(', ') : (existingData.tags || ''),
              productPrice: existingData.productPrice ? existingData.productPrice.toString() : ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading existing form data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingData();
  }, []);

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


  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const creatorData = {
        creatorId: user.uid,
        creatorEmail: user.email,
        creatorName: user.displayName || user.email?.split('@')[0] || 'Unknown',
        productTitle: formData.productTitle,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        productPrice: parseFloat(formData.productPrice) || 0,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const creatorFormId = `creator_${user.uid}`;
      await setDoc(doc(db, 'creator_forms', creatorFormId), creatorData);

      await updateDoc(doc(db, 'users', user.uid), {
        role: 'creator',
        creatorStatus: 'draft',
        lastUpdated: new Date().toISOString()
      });

      alert('Form saved as draft successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Save draft error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.productTitle || !formData.description || !formData.category || !formData.productPrice) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const creatorData = {
        creatorId: user.uid,
        creatorEmail: user.email,
        creatorName: user.displayName || user.email?.split('@')[0] || 'Unknown',
        productTitle: formData.productTitle,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        productPrice: parseFloat(formData.productPrice),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      };

      const creatorFormId = `creator_${user.uid}`;
      await setDoc(doc(db, 'creator_forms', creatorFormId), creatorData);

      await updateDoc(doc(db, 'users', user.uid), {
        role: 'creator',
        creatorStatus: 'pending',
        lastUpdated: new Date().toISOString()
      });

      alert('Your creator application has been submitted for review!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Submit for review error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="creator-form-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#ffffff', fontSize: '18px' }}>Loading form...</div>
      </div>
    );
  }

  return (
    <div className="creator-form-container">
      <div className="creator-form-card">
        <h2>Complete Your Creator Profile</h2>
        <p>Add your first product to get started</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmitForReview}>
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
            <div className="file-upload-placeholder">
              <span className="upload-icon">📁</span>
              <div className="upload-text">Click to upload product images</div>
              <div className="upload-subtext">File uploads will be available when Firebase Storage is enabled</div>
            </div>
            <small>Multiple images to showcase your product</small>
          </div>

          <div className="form-group">
            <label>Digital File</label>
            <div className="file-upload-placeholder">
              <span className="upload-icon">📎</span>
              <div className="upload-text">Click to upload digital file</div>
              <div className="upload-subtext">Main digital asset upload will be available later</div>
            </div>
            <small>The main digital asset/file for your product</small>
          </div>

          <div className="form-group">
            <label>Proof of Ownership (optional)</label>
            <div className="file-upload-placeholder">
              <span className="upload-icon">🔒</span>
              <div className="upload-text">Click to upload verification documents</div>
              <div className="upload-subtext">Verification document upload will be available later</div>
            </div>
            <small>Upload verification documents if needed</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSaveDraft}
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