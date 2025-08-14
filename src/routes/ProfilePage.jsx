import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../styles/profile.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trades');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : ''}`}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getCreatorFormStatus = () => {
    if (!userProfile || userProfile.role !== 'creator') return null;
    
    const statusMap = {
      'incomplete': { text: 'Incomplete', color: '#ef4444', show: true },
      'draft': { text: 'Draft', color: '#f59e0b', show: true },
      'pending': { text: 'Under Review', color: '#3b82f6', show: true },
      'approved': { text: 'Approved', color: '#10b981', show: false }
    };
    
    return statusMap[userProfile.creatorStatus] || null;
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
      {/* Top Navigation Header */}
      <header className="top-navigation">
        <div className="nav-container">
          <div className="nav-left">
            <div className="logo">
              <div className="logo-icon">
                <img src="src/assets/icons/icon-1.png" alt="Fairora" />
              </div>
              <span>Fairora</span>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="nav-menu">
            <button className="nav-item" onClick={() => navigate('/dashboard')}>
              <span className="nav-icon">🏪</span>
              <span>Marketplace</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/dashboard/trending')}>
              <span className="nav-icon">📈</span>
              <span>Trending</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/dashboard/rankings')}>
              <span className="nav-icon">🏆</span>
              <span>Rankings</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/wallet')}>
              <span className="nav-icon">💰</span>
              <span>Wallet</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/messages')}>
              <span className="nav-icon">💬</span>
              <span>Messages</span>
            </button>
          </nav>
          
          <div className="nav-right">
            <div className="user-menu">
              <div 
                className="user-avatar-button"
                onMouseEnter={() => setUserDropdownOpen(true)}
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <div className="user-avatar">
                  {getUserInitials()}
                </div>
                <span className="user-name">{getDisplayName()}</span>
                <span className="dropdown-arrow">▼</span>
              </div>
              
              {userDropdownOpen && (
                <div 
                  className="user-dropdown"
                  onMouseEnter={() => setUserDropdownOpen(true)}
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div 
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/profile/edit');
                      setUserDropdownOpen(false);
                    }}
                  >
                    <span className="item-icon">✏️</span>
                    Edit Profile
                  </div>
                  <div 
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/settings');
                      setUserDropdownOpen(false);
                    }}
                  >
                    <span className="item-icon">⚙️</span>
                    Settings
                  </div>
                  <div className="dropdown-divider"></div>
                  <div 
                    className="dropdown-item logout-item"
                    onClick={() => {
                      handleLogout();
                      setUserDropdownOpen(false);
                    }}
                  >
                    <span className="item-icon">🚪</span>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Draft Banner */}
      {getCreatorFormStatus()?.show && (
        <div className="draft-banner">
          <div className="banner-content">
            <div className="banner-icon">⚠️</div>
            <div className="banner-text">
              <strong>Creator Form Status: {getCreatorFormStatus().text}</strong>
              <span>Complete your creator form to start selling your digital products.</span>
            </div>
            <button 
              className="banner-action"
              onClick={() => navigate('/creator-form')}
            >
              Continue Setup
            </button>
          </div>
        </div>
      )}

      {/* Full Width Banner */}
      <div className="hero-banner">
        <div className="hero-gradient"></div>
      </div>
      
      {/* Main Content Container */}
      <div className="profile-container">
        <div className="profile-content">
          {/* Avatar positioned above profile name */}
            <div className="profile-avatar">
              <div className="gradient-bg avatar-circle">
                {getUserInitials()}
              </div>
            </div>
          {/* Left Column - Profile Info */}
          <div className="profile-info">
            
            <h1 className="profile-name">{getDisplayName()}</h1>
            
            {/* Profile Stats */}
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">250k+</span>
                <span className="stat-label">Trade Volume</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Trades Completed</span>
              </div>
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

          {/* Right Column - Action Buttons */}
          <div className="profile-actions">
            <button className="btn-edit-profile">
              Edit Profile
            </button>
            <button className="btn-add-listing">
              Add Listing
            </button>
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
      {/* Rating and Feedback Section */}
      <div className="rating-feedback-section">
        <div className="rating-feedback-container">
          {/* Average Rating */}
          <div className="average-rating">
            <h3 className="section-title">Average Rating</h3>
            <div className="rating-card">
              <div className="overall-rating">
                <div className="rating-number">4.</div>
                <div className="rating-details">
                  <div className="rating-count">50k</div>
                  <div className="rating-label">Reviews</div>
                </div>
              </div>
              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="rating-row">
                    <span className="rating-value">{rating}</span>
                    <div className="rating-bar">
                      <div 
                        className="rating-fill"
                        style={{ 
                          width: rating === 5 ? '80%' : 
                                rating === 4 ? '60%' : 
                                rating === 3 ? '40%' : 
                                rating === 2 ? '20%' : '10%'
                        }}
                      ></div>
                    </div>
                    <span className="rating-percentage">
                      {rating === 5 ? '80' : 
                       rating === 4 ? '60' : 
                       rating === 3 ? '40' : 
                       rating === 2 ? '20' : '10'}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Feedback */}
          <div className="customer-feedback">
            <h3 className="section-title">Customer Feedback</h3>
            <div className="feedback-list">
              <div className="feedback-item">
                <div className="feedback-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      <img src="/api/placeholder/40/40" alt="Rachel Patel" />
                    </div>
                    <div className="user-details">
                      <div className="user-name">Rachel Patel</div>
                      <div className="feedback-date">October 12, 2024</div>
                    </div>
                  </div>
                  <div className="feedback-rating">
                    {renderStars(5)}
                  </div>
                </div>
                <div className="feedback-content">
                  Thank You For Your Ongoing Efforts In Trading. We've Reviewed Recent Activity And Would Like To Provide Constructive Feedback To Support Your Trading Journey.
                </div>
              </div>

              <div className="feedback-item">
                <div className="feedback-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      <img src="/api/placeholder/40/40" alt="Rachel Patel" />
                    </div>
                    <div className="user-details">
                      <div className="user-name">Rachel Patel</div>
                      <div className="feedback-date">October 12, 2024</div>
                    </div>
                  </div>
                  <div className="feedback-rating">
                    {renderStars(5)}
                  </div>
                </div>
                <div className="feedback-content">
                  Thank You For Your Ongoing Efforts In Trading. We've Reviewed Recent Activity And Would Like To Provide Constructive Feedback To Support Your Trading Journey.
                </div>
              </div>
            </div>
          </div>
        </div>    
      </div>

    </div>
  );
};

export default ProfilePage;