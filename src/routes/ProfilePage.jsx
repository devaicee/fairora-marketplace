import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import '../styles/refactored-dashboard.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    bio: '',
    location: '',
    website: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser);
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          setFormData({
            displayName: userData.displayName || currentUser.displayName || '',
            email: userData.email || currentUser.email || '',
            bio: userData.bio || '',
            location: userData.location || '',
            website: userData.website || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.displayName
      });

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        updatedAt: new Date().toISOString()
      });

      setUserProfile(prev => ({
        ...prev,
        ...formData,
        updatedAt: new Date().toISOString()
      }));

      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="section-content">
      <div className="profile-page">
        <div className="section-header">
          <h2>Edit Profile</h2>
          <p>Manage your profile information and preferences</p>
        </div>

        <div className="profile-card-large">
          <div className="profile-header">
            <img 
              src="src/assets/icons/ava-1.png" 
              alt={formData.displayName} 
              className="profile-large-avatar"
            />
            <div className="profile-header-info">
              <h3>{formData.displayName || 'User'}</h3>
              <p>{formData.email}</p>
              <span className="role-badge">{userProfile?.role || 'User'}</span>
            </div>
            <button 
              className="btn-secondary edit-btn"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Your display name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Your location"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://your-website.com"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <div className="profile-info-section">
                <h4>Bio</h4>
                <p>{formData.bio || 'No bio provided'}</p>
              </div>

              <div className="profile-info-section">
                <h4>Location</h4>
                <p>{formData.location || 'Not specified'}</p>
              </div>

              <div className="profile-info-section">
                <h4>Website</h4>
                <p>
                  {formData.website ? (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer">
                      {formData.website}
                    </a>
                  ) : (
                    'No website provided'
                  )}
                </p>
              </div>

              <div className="profile-info-section">
                <h4>Member Since</h4>
                <p>
                  {userProfile?.createdAt 
                    ? new Date(userProfile.createdAt).toLocaleDateString()
                    : 'Unknown'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;