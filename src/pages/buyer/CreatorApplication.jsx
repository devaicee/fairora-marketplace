import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../../styles/creator-application.css';

const CreatorApplication = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    experience: '',
    skills: '',
    portfolio: '',
    motivation: '',
    businessPlan: '',
    previousWork: '',
    socialMedia: {
      website: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      other: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [existingApplication, setExistingApplication] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          
          if (userData.role === 'creator') {
            setMessage({ 
              text: 'You are already a verified creator. You can access creator features from your dashboard.', 
              type: 'success' 
            });
          }
          
          if (userData.creatorApplication) {
            setExistingApplication(userData.creatorApplication);
            setApplicationData({ ...applicationData, ...userData.creatorApplication });
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setMessage({ text: 'Error loading your profile', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setApplicationData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setApplicationData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    const required = ['fullName', 'experience', 'skills', 'motivation'];
    for (let field of required) {
      if (!applicationData[field].trim()) {
        setMessage({ text: `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`, type: 'error' });
        return false;
      }
    }

    if (applicationData.experience.length < 100) {
      setMessage({ text: 'Please provide at least 100 characters for your experience', type: 'error' });
      return false;
    }

    if (applicationData.motivation.length < 150) {
      setMessage({ text: 'Please provide at least 150 characters for your motivation', type: 'error' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);

    try {
      const applicationDoc = {
        ...applicationData,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        adminNotes: '',
        reviewedAt: null,
        reviewedBy: null
      };

      if (existingApplication) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          creatorApplication: applicationDoc,
          applicationStatus: 'pending'
        });
        setMessage({ text: 'Application updated successfully! We\'ll review it within 3-5 business days.', type: 'success' });
      } else {
        await addDoc(collection(db, 'creator_applications'), applicationDoc);
        
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          creatorApplication: applicationDoc,
          applicationStatus: 'pending'
        });
        setMessage({ text: 'Application submitted successfully! We\'ll review it within 3-5 business days.', type: 'success' });
      }

      setExistingApplication(applicationDoc);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      setMessage({ text: 'Error submitting application. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getApplicationStatus = () => {
    if (!existingApplication) return null;
    
    const statusConfig = {
      'pending': { text: 'Under Review', color: '#f59e0b', description: 'Your application is being reviewed by our team.' },
      'approved': { text: 'Approved', color: '#10b981', description: 'Congratulations! Your application has been approved.' },
      'rejected': { text: 'Rejected', color: '#ef4444', description: 'Your application was not approved at this time.' },
      'needs_revision': { text: 'Needs Revision', color: '#f59e0b', description: 'Please revise your application based on our feedback.' }
    };
    
    return statusConfig[existingApplication.status] || statusConfig.pending;
  };

  if (loading) {
    return <div className="application-loading">Loading application...</div>;
  }

  if (userProfile?.role === 'creator') {
    return (
      <div className="creator-application">
        <div className="already-creator">
          <div className="success-icon">✅</div>
          <h2>You're Already a Creator!</h2>
          <p>You have creator privileges and can access all creator features.</p>
          <button onClick={() => navigate('/dashboard')} className="dashboard-btn">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getApplicationStatus();

  return (
    <div className="creator-application">
      <div className="application-header">
        <h1>Apply to Become a Creator</h1>
        <p>Join our community of creators and start selling your digital products</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {statusInfo && (
        <div className="application-status" style={{ borderColor: statusInfo.color }}>
          <div className="status-header">
            <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
              {statusInfo.text}
            </span>
            <span className="status-date">
              Submitted: {new Date(existingApplication.submittedAt).toLocaleDateString()}
            </span>
          </div>
          <p className="status-description">{statusInfo.description}</p>
          {existingApplication.adminNotes && (
            <div className="admin-feedback">
              <h4>Admin Feedback:</h4>
              <p>{existingApplication.adminNotes}</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              value={applicationData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Professional Background</h3>
          
          <div className="form-group">
            <label htmlFor="experience">Professional Experience *</label>
            <textarea
              id="experience"
              value={applicationData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="Describe your professional experience, background, and relevant qualifications (minimum 100 characters)"
              rows="4"
              required
            />
            <small className="char-count">{applicationData.experience.length}/100 minimum</small>
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills & Expertise *</label>
            <input
              type="text"
              id="skills"
              value={applicationData.skills}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              placeholder="List your key skills and areas of expertise (comma separated)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="portfolio">Portfolio/Work Samples</label>
            <input
              type="url"
              id="portfolio"
              value={applicationData.portfolio}
              onChange={(e) => handleInputChange('portfolio', e.target.value)}
              placeholder="https://your-portfolio.com or link to work samples"
            />
          </div>

          <div className="form-group">
            <label htmlFor="previousWork">Previous Work/Projects</label>
            <textarea
              id="previousWork"
              value={applicationData.previousWork}
              onChange={(e) => handleInputChange('previousWork', e.target.value)}
              placeholder="Describe notable projects or work you've completed"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Motivation & Plans</h3>
          
          <div className="form-group">
            <label htmlFor="motivation">Why do you want to become a creator? *</label>
            <textarea
              id="motivation"
              value={applicationData.motivation}
              onChange={(e) => handleInputChange('motivation', e.target.value)}
              placeholder="Tell us about your motivation for joining as a creator and what you hope to achieve (minimum 150 characters)"
              rows="4"
              required
            />
            <small className="char-count">{applicationData.motivation.length}/150 minimum</small>
          </div>

          <div className="form-group">
            <label htmlFor="businessPlan">Business Plan/Strategy</label>
            <textarea
              id="businessPlan"
              value={applicationData.businessPlan}
              onChange={(e) => handleInputChange('businessPlan', e.target.value)}
              placeholder="Describe your plan for creating and selling products on our platform"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Social Media & Online Presence</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                value={applicationData.socialMedia.website}
                onChange={(e) => handleInputChange('socialMedia.website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedin">LinkedIn</label>
              <input
                type="url"
                id="linkedin"
                value={applicationData.socialMedia.linkedin}
                onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="twitter">Twitter/X</label>
              <input
                type="url"
                id="twitter"
                value={applicationData.socialMedia.twitter}
                onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                placeholder="https://twitter.com/yourusername"
              />
            </div>

            <div className="form-group">
              <label htmlFor="instagram">Instagram</label>
              <input
                type="url"
                id="instagram"
                value={applicationData.socialMedia.instagram}
                onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                placeholder="https://instagram.com/yourusername"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="other">Other Social Media</label>
            <input
              type="text"
              id="other"
              value={applicationData.socialMedia.other}
              onChange={(e) => handleInputChange('socialMedia.other', e.target.value)}
              placeholder="Any other relevant social media profiles or platforms"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="submit-btn"
          >
            {submitting ? 'Submitting...' : existingApplication ? 'Update Application' : 'Submit Application'}
          </button>
        </div>
      </form>

      <div className="application-info">
        <h3>What happens next?</h3>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Review Process</h4>
              <p>Our team will review your application within 3-5 business days</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Notification</h4>
              <p>You'll receive an email notification with the decision</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Creator Access</h4>
              <p>If approved, you'll gain access to creator tools and can start selling</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorApplication;