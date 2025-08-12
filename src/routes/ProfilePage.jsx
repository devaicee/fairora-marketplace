import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../styles/profile.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trades');
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
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const getUserInitials = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    return userProfile?.displayName || user?.email?.split('@')[0] || 'User';
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Full Width Banner */}
      <div className="hero-banner">
        <div className="hero-gradient"></div>
      </div>
      
      {/* Avatar positioned over banner */}
      <div className="avatar-section">
        <div className="profile-avatar">
          <div className="gradient-bg avatar-circle">
            {getUserInitials()}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="profile-container">
        {/* Profile Info */}
        <div className="profile-info">
          <h1 className="profile-name">{getDisplayName()}</h1>
          
          {/* Stats as simple text line */}
          <div className="profile-stats-text">
            250k+ Trade Volume • 50+ Trades Completed
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <button className="btn-edit-profile">
              Edit Profile
            </button>
            <button className="btn-add-listing">
              Add Listing
            </button>
            <button className="btn-transaction-history">
              Transaction History
            </button>
          </div>

          {/* Bio */}
          <div className="profile-bio">
            {userProfile?.bio || 'Digital creator passionate about crafting unique experiences and building meaningful connections through innovative design.'}
          </div>

          {/* Social Links */}
          <div className="social-links">
            <a href="#" className="social-link" title="Website">
              <span className="social-icon">🌐</span>
            </a>
            <a href="#" className="social-link" title="Gaming">
              <span className="social-icon">🎮</span>
            </a>
            <a href="#" className="social-link" title="YouTube">
              <span className="social-icon">📺</span>
            </a>
            <a href="#" className="social-link" title="Twitter">
              <span className="social-icon">🐦</span>
            </a>
            <a href="#" className="social-link" title="Instagram">
              <span className="social-icon">📷</span>
            </a>
          </div>
        </div>
      </div>

      {/* Full Width Tab Navigation */}
      <div className="profile-tabs">
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveTab('trades')}
          >
            <span className="tab-icon">📊</span>
            My Trades
            <span className="tab-badge">12</span>
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="tab-icon">📋</span>
            History
            <span className="tab-badge">45</span>
          </button>
          <button 
            className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <span className="tab-icon">❤️</span>
            Favorites
            <span className="tab-badge">8</span>
          </button>
        </div>
      </div>

      {/* Full Width Tab Content */}
      <div className="tab-content">
        <div className="content-container">
          {activeTab === 'trades' && (
            <div className="content-section">
              <div className="content-cards">
                <div className="content-card">
                  <div className="card-header">
                    <h3>Active Listings</h3>
                    <span className="card-count">8 items</span>
                  </div>
                  <div className="card-content">
                    <p>Your active trade listings will appear here</p>
                  </div>
                </div>
                
                <div className="content-card">
                  <div className="card-header">
                    <h3>Pending Trades</h3>
                    <span className="card-count">4 pending</span>
                  </div>
                  <div className="card-content">
                    <p>Trades awaiting confirmation</p>
                  </div>
                </div>
                
                <div className="content-card">
                  <div className="card-header">
                    <h3>Recent Activity</h3>
                    <span className="card-count">Last 7 days</span>
                  </div>
                  <div className="card-content">
                    <p>Your recent trading activity and updates</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="content-section">
              <div className="content-cards">
                <div className="content-card">
                  <div className="card-header">
                    <h3>Completed Trades</h3>
                    <span className="card-count">45 total</span>
                  </div>
                  <div className="card-content">
                    <p>Your completed trading history</p>
                  </div>
                </div>
                
                <div className="content-card">
                  <div className="card-header">
                    <h3>Monthly Stats</h3>
                    <span className="card-count">This month</span>
                  </div>
                  <div className="card-content">
                    <p>Your trading performance this month</p>
                  </div>
                </div>
                
                <div className="content-card">
                  <div className="card-header">
                    <h3>Trading Timeline</h3>
                    <span className="card-count">All time</span>
                  </div>
                  <div className="card-content">
                    <p>Complete timeline of all your trades</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'favorites' && (
            <div className="content-section">
              <div className="content-cards">
                <div className="content-card">
                  <div className="card-header">
                    <h3>Saved Items</h3>
                    <span className="card-count">8 items</span>
                  </div>
                  <div className="card-content">
                    <p>Your favorite and saved items</p>
                  </div>
                </div>
                
                <div className="content-card">
                  <div className="card-header">
                    <h3>Watchlist</h3>
                    <span className="card-count">12 watching</span>
                  </div>
                  <div className="card-content">
                    <p>Items you're watching for price changes</p>
                  </div>
                </div>
                
                <div className="content-card">
                  <div className="card-header">
                    <h3>Collections</h3>
                    <span className="card-count">3 collections</span>
                  </div>
                  <div className="card-content">
                    <p>Your organized item collections</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;