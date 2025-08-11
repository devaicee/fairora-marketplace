import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import '../App.css';
import '../styles/dashboard.css';

const ImprovedDashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [products, setProducts] = useState([]);
  const [trendingTrades, setTrendingTrades] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [forumTopics, setForumTopics] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser);
      
      try {
        // Get user profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
        
        // Load dashboard data
        await loadDashboardData();
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      // Load approved products from creator_forms
      const productsQuery = query(
        collection(db, 'creator_forms'),
        where('status', '==', 'approved'),
        limit(12)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If no approved products, show pending ones for demo
      if (productsData.length === 0) {
        const pendingQuery = query(
          collection(db, 'creator_forms'),
          where('status', '==', 'pending'),
          limit(12)
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingData = pendingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isDemoProduct: true
        }));
        setProducts(pendingData);
      } else {
        setProducts(productsData);
      }

      // Mock trending trades data
      setTrendingTrades([
        {
          id: 1,
          title: 'Creative Design Pack',
          creator: 'MrFox',
          trades: 1025,
          image: 'src/assets/images/img-1.jpg',
          category: 'creative'
        },
        {
          id: 2,
          title: 'Knowledge Exchange',
          creator: 'Shroomie',
          trades: 890,
          image: 'src/assets/images/img-4.jpg',
          category: 'knowledge'
        },
        {
          id: 3,
          title: 'Digital Assets',
          creator: 'BeKind2Robots',
          trades: 756,
          image: 'src/assets/images/img-7.jpg',
          category: 'digital'
        }
      ]);

      // Mock top creators data
      setTopCreators([
        { name: "RespitReal", trades: 245, avatar: "ava-1.png", earnings: "100k" },
        { name: "DigiLab", trades: 189, avatar: "ava-2.png", earnings: "85k" },
        { name: "GravityOne", trades: 156, avatar: "ava-3.png", earnings: "75k" },
        { name: "Juanito", trades: 134, avatar: "ava-4.png", earnings: "65k" },
        { name: "BlueWhale", trades: 123, avatar: "ava-5.png", earnings: "60k" }
      ]);

      // Mock forum topics
      setForumTopics([
        {
          id: 1,
          title: 'How to price digital assets fairly?',
          author: 'CreativeGuru',
          replies: 23,
          lastActivity: '2 hours ago',
          category: 'Pricing'
        },
        {
          id: 2,
          title: 'Best practices for knowledge exchange',
          author: 'SkillsMaster',
          replies: 18,
          lastActivity: '4 hours ago',
          category: 'Trading'
        },
        {
          id: 3,
          title: 'New creator introduction guidelines',
          author: 'CommunityMod',
          replies: 45,
          lastActivity: '6 hours ago',
          category: 'Community'
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNavigate = (section) => {
    setActiveSection(section);
    setSidebarOpen(false); // Close mobile sidebar
  };

  const getDisplayName = () => {
    return userProfile?.displayName || user?.displayName || userProfile?.email?.split('@')[0] || 'User';
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

  const filteredProducts = products.filter(product =>
    product.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="improved-dashboard-loading">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="improved-dashboard">
      {/* Top Navigation Bar */}
      <header className="header">
        <div className="container">
          <div className="dashboard-brand">
            <div className="logo">
              <div className="logo-icon">
                <img src="src/assets/icons/icon-1.png" alt="Fairora" />
              </div>
              <span>Fairora Dashboard</span>
            </div>
          </div>
          
          <div className="dashboard-search">
            <input
              type="text"
              placeholder="Search products, creators, forums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-header"
            />
          </div>
          
          <div className="dashboard-profile-menu">
            <div className="profile-info">
              <img src="src/assets/icons/ava-1.png" alt="Profile" className="profile-avatar" />
              <span className="profile-name">{getDisplayName()}</span>
            </div>
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Mobile Sidebar Overlay */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Left Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-content">
            <nav className="sidebar-nav">
              <button 
                className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigate('dashboard')}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </button>
              
              <button 
                className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => handleNavigate('profile')}
              >
                <span className="nav-icon">👤</span>
                Profile
              </button>
              
              <button 
                className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                onClick={() => handleNavigate('settings')}
              >
                <span className="nav-icon">⚙️</span>
                Settings
              </button>
              
              {userProfile?.role === 'creator' && (
                <button 
                  className={`nav-item ${activeSection === 'creator-form' ? 'active' : ''}`}
                  onClick={() => navigate('/creator-form')}
                >
                  <span className="nav-icon">🎨</span>
                  Creator Form
                  {getCreatorFormStatus()?.show && (
                    <span 
                      className="status-indicator"
                      style={{ backgroundColor: getCreatorFormStatus().color }}
                    >
                      {getCreatorFormStatus().text}
                    </span>
                  )}
                </button>
              )}
              
              <button 
                className={`nav-item ${activeSection === 'marketplace' ? 'active' : ''}`}
                onClick={() => handleNavigate('marketplace')}
              >
                <span className="nav-icon">🛍️</span>
                Marketplace
              </button>
              
              <div className="nav-divider"></div>
              
              <button 
                className="nav-item"
                onClick={() => navigate('/')}
              >
                <span className="nav-icon">🏠</span>
                Back to Home
              </button>
              
              <button 
                className="nav-item logout-btn"
                onClick={handleLogout}
              >
                <span className="nav-icon">🚪</span>
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main">
          {activeSection === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <div className="welcome-section">
                <h1>Welcome back, {getDisplayName()}!</h1>
                <p>Here's what's happening in your Fairora marketplace today.</p>
                
                {/* Creator Status Alert */}
                {userProfile?.role === 'creator' && getCreatorFormStatus()?.show && (
                  <div className="status-alert" style={{ borderColor: getCreatorFormStatus().color }}>
                    <div className="alert-content">
                      <span className="alert-icon">⚠️</span>
                      <div>
                        <h4>Creator Form: {getCreatorFormStatus().text}</h4>
                        <p>Complete your creator form to start selling products on the marketplace.</p>
                      </div>
                      <button 
                        className="btn-secondary"
                        onClick={() => navigate('/creator-form')}
                      >
                        Complete Form
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* All Products Section */}
              <section className="dashboard-section">
                <div className="section-header">
                  <div>
                    <h2>All Products</h2>
                    <p>Discover digital products from approved creators</p>
                  </div>
                  <button className="btn-secondary">View All</button>
                </div>
                
                <div className="products-grid">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div key={product.id} className="product-card">
                        <div className="product-image">
                          <img 
                            src="src/assets/images/placeholder.jpg" 
                            alt={product.productTitle}
                            onError={(e) => {
                              e.target.src = 'src/assets/images/img-1.jpg';
                            }}
                          />
                          {product.isDemoProduct && (
                            <div className="demo-badge">Demo</div>
                          )}
                        </div>
                        <div className="product-info">
                          <h4>{product.productTitle}</h4>
                          <p className="product-creator">by {product.creatorName || 'Unknown'}</p>
                          <div className="product-category">{product.category}</div>
                          <div className="product-footer">
                            <span className="product-price">
                              {product.productPrice ? `${product.productPrice} credits` : 'Free'}
                            </span>
                            <button className="btn-primary product-btn">View</button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-products">
                      <p>No products available yet. Check back soon!</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Trending Trades Section */}
              <section className="dashboard-section">
                <div className="section-header">
                  <div>
                    <h2>Trending Trades</h2>
                    <p>Most popular trades this week</p>
                  </div>
                  <button className="btn-secondary">View All</button>
                </div>
                
                <div className="trending-scroll">
                  <div className="trending-container">
                    {trendingTrades.map((trade) => (
                      <div key={trade.id} className={`trade-card ${trade.category}`}>
                        <div className="trade-main-visual">
                          <img src={trade.image} alt={trade.title} />
                        </div>
                        <div className="trade-info">
                          <h3>{trade.title}</h3>
                          <div className="creator-info1">
                            <span>{trade.creator}</span>
                            <span className="trade-count">{trade.trades}+ trades</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Top Creators Section */}
              <section className="dashboard-section">
                <div className="section-header">
                  <div>
                    <h2>Top Creators</h2>
                    <p>Leading creators by sales and trades</p>
                  </div>
                  <button className="btn-secondary">View Rankings</button>
                </div>
                
                <div className="creators-grid">
                  {topCreators.map((creator, index) => (
                    <div key={index} className="creator-card">
                      <div className="creator-rank">{index + 1}</div>
                      <div className="creator-avatar">
                        <img src={`src/assets/icons/${creator.avatar}`} alt={creator.name} />
                      </div>
                      <div className="creator-info">
                        <h4>{creator.name}</h4>
                        <p className="creator-stats">
                          {creator.trades} trades • <strong>{creator.earnings} earned</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Creator Forums Section */}
              <section className="dashboard-section">
                <div className="section-header">
                  <div>
                    <h2>Creator Forums</h2>
                    <p>Latest discussions and community topics</p>
                  </div>
                  <button className="btn-secondary">Join Discussion</button>
                </div>
                
                <div className="forum-list">
                  {forumTopics.map((topic) => (
                    <div key={topic.id} className="forum-item">
                      <div className="forum-content">
                        <div className="forum-header">
                          <h4>{topic.title}</h4>
                          <span className="forum-category">{topic.category}</span>
                        </div>
                        <div className="forum-meta">
                          <span>by {topic.author}</span>
                          <span>•</span>
                          <span>{topic.replies} replies</span>
                          <span>•</span>
                          <span>{topic.lastActivity}</span>
                        </div>
                      </div>
                      <button className="btn-secondary forum-btn">Reply</button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Other sections placeholders */}
          {activeSection === 'profile' && (
            <section className="dashboard-section">
              <h2>Profile Settings</h2>
              <div className="profile-content">
                <div className="profile-card">
                  <img src="src/assets/icons/ava-1.png" alt="Profile" className="profile-large-avatar" />
                  <h3>{getDisplayName()}</h3>
                  <p>{userProfile?.email}</p>
                  <span className="role-badge">{userProfile?.role || 'User'}</span>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'settings' && (
            <section className="dashboard-section">
              <h2>Account Settings</h2>
              <p>Configure your account settings and preferences.</p>
            </section>
          )}

          {activeSection === 'marketplace' && (
            <section className="dashboard-section">
              <h2>Marketplace</h2>
              <p>Browse and purchase digital products.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ImprovedDashboard;