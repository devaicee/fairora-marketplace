import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where, limit, runTransaction } from 'firebase/firestore';
import { initializeUserProfile } from '../../utils/userSetup';
import '../../App.css';
import '../../styles/improved-dashboard.css';

const BuyerDashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [products, setProducts] = useState([]);
  const [trendingTrades, setTrendingTrades] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [forumTopics, setForumTopics] = useState([]);
  
  // Buyer feature states
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientUserId, setRecipientUserId] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.profile-dropdown-wrapper')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser);
      
      try {
        // Get user profile and initialize buyer features
        const userData = await initializeUserProfile(currentUser.uid);
        if (userData) {
          setUserProfile(userData);
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

  const isNewUser = () => {
    if (!userProfile?.firstVisit) return false;
    const firstVisitDate = new Date(userProfile.firstVisit);
    const now = new Date();
    const hoursDiff = (now - firstVisitDate) / (1000 * 60 * 60);
    return hoursDiff < 24; // Consider user "new" for first 24 hours
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

  const handleCreditTransfer = async (e) => {
    e.preventDefault();
    
    if (!transferAmount || !recipientUserId) {
      setMessage({ text: 'Please fill in all fields', type: 'error' });
      return;
    }

    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }

    const userCredits = userProfile?.credits || 0;
    if (amount > userCredits) {
      setMessage({ text: 'Insufficient credits', type: 'error' });
      return;
    }

    if (recipientUserId === auth.currentUser.uid) {
      setMessage({ text: 'Cannot transfer credits to yourself', type: 'error' });
      return;
    }

    setTransferLoading(true);

    try {
      await runTransaction(db, async (transaction) => {
        const senderRef = doc(db, 'users', auth.currentUser.uid);
        const recipientRef = doc(db, 'users', recipientUserId);
        
        const senderDoc = await transaction.get(senderRef);
        const recipientDoc = await transaction.get(recipientRef);
        
        if (!senderDoc.exists() || !recipientDoc.exists()) {
          throw new Error('User documents do not exist');
        }
        
        const senderData = senderDoc.data();
        const recipientData = recipientDoc.data();
        
        if ((senderData.credits || 0) < amount) {
          throw new Error('Insufficient credits');
        }
        
        const newSenderCredits = (senderData.credits || 0) - amount;
        const newRecipientCredits = (recipientData.credits || 0) + amount;
        
        const transactionRecord = {
          id: Date.now().toString(),
          type: 'transfer',
          amount: amount,
          fromUserId: auth.currentUser.uid,
          toUserId: recipientUserId,
          timestamp: new Date().toISOString(),
          description: `Credit transfer to ${recipientUserId}`
        };

        const recipientTransaction = {
          id: Date.now().toString() + '_received',
          type: 'received',
          amount: amount,
          fromUserId: auth.currentUser.uid,
          toUserId: recipientUserId,
          timestamp: new Date().toISOString(),
          description: `Credits received from ${auth.currentUser.uid}`
        };
        
        transaction.update(senderRef, {
          credits: newSenderCredits,
          transactionHistory: [...(senderData.transactionHistory || []), transactionRecord]
        });
        
        transaction.update(recipientRef, {
          credits: newRecipientCredits,
          transactionHistory: [...(recipientData.transactionHistory || []), recipientTransaction]
        });
      });
      
      // Update local state
      setUserProfile(prev => ({ ...prev, credits: (prev.credits || 0) - amount }));
      setTransferAmount('');
      setRecipientUserId('');
      setMessage({ text: 'Credits transferred successfully!', type: 'success' });
      
    } catch (error) {
      console.error('Transfer error:', error);
      setMessage({ text: error.message || 'Transfer failed', type: 'error' });
    } finally {
      setTransferLoading(false);
    }
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
      <header className="header" style={{ position: 'sticky', top: '0', zIndex: '1000', backgroundColor: 'rgba(26, 26, 26, 0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="container">
          <div className="dashboard-brand">
            <div className="logo">
              <div className="logo-icon">
                <img src="src/assets/icons/icon-1.png" alt="Fairora" />
              </div>
              <span>Fairora</span>
            </div>
          </div>
          
          <div className="dashboard-profile-menu">
            <div className="dashboard-search">
              <div className="search-input-container">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search products, creators, forums..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-header"
                />
              </div>
            </div>
            <div className="profile-dropdown-wrapper">
              <button 
                className="profile-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                onMouseEnter={() => setDropdownOpen(true)}
              >
                <img src="src/assets/icons/ava-1.png" alt="Profile" className="profile-avatar-btn" />
                <span>▼</span>
              </button>
              
              {dropdownOpen && (
                <div 
                  className="profile-dropdown-menu"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="dropdown-user-section">
                    <img src="src/assets/icons/ava-1.png" alt="Profile" />
                    <div>
                      <div className="user-name">{getDisplayName()}</div>
                      <div className="user-email">{userProfile?.email}</div>
                      <div className="user-credits">{userProfile?.credits || 0} credits</div>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <button onClick={() => { handleNavigate('profile'); setDropdownOpen(false); }}>
                    👤 View Profile
                  </button>
                  
                  <button onClick={() => { handleNavigate('settings'); setDropdownOpen(false); }}>
                    ⚙️ Settings
                  </button>
                  
                  <button onClick={() => { handleNavigate('credits'); setDropdownOpen(false); }}>
                    💰 Credits
                  </button>
                  
                  <hr />
                  
                  <button onClick={() => { navigate('/'); setDropdownOpen(false); }}>
                    🏠 Home
                  </button>
                  
                  <button 
                    onClick={() => { handleLogout(); setDropdownOpen(false); }}
                    style={{ color: '#ef4444' }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
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
            <nav className="sidebar-nav" style={{ display: 'flex', gap: '1rem', width: '230px' }}>
              <button 
                className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigate('dashboard')}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </button>
              
              <button 
                className={`nav-item ${activeSection === 'marketplace' ? 'active' : ''}`}
                onClick={() => handleNavigate('marketplace')}
              >
                <span className="nav-icon">🛍️</span>
                Marketplace
              </button>
              
              <button 
                className={`nav-item ${activeSection === 'forums' ? 'active' : ''}`}
                onClick={() => handleNavigate('forums')}
              >
                <span className="nav-icon">💬</span>
                Creator Forums
              </button>

              <button 
                className={`nav-item ${activeSection === 'referrals' ? 'active' : ''}`}
                onClick={() => handleNavigate('referrals')}
              >
                <span className="nav-icon">👥</span>
                Referrals
              </button>

              <button 
                className={`nav-item ${activeSection === 'support' ? 'active' : ''}`}
                onClick={() => handleNavigate('support')}
              >
                <span className="nav-icon">🎧</span>
                Support
              </button>

              {userProfile?.role !== 'creator' && (
                <button 
                  className={`nav-item ${activeSection === 'become-creator' ? 'active' : ''}`}
                  onClick={() => handleNavigate('become-creator')}
                >
                  <span className="nav-icon">🎨</span>
                  Become Creator
                </button>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main hide-scrollbar" style={{ height: 'calc(100vh - 4rem)' }}>
          {activeSection === 'dashboard' && (
            <div style={{ display: 'flex', gap: '1rem', minHeight: '100%', padding: '1rem', position: 'relative' }}>
              {/* Main Content */}
              <div style={{ flex: 1, paddingRight: '340px' }}>
                {/* Welcome Section */}
                <div className="welcome-section">
                  <h1>{isNewUser() ? `Hello, ${getDisplayName()}!` : `Welcome back, ${getDisplayName()}!`}</h1>
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

                {/* Featured Products Section */}
                <section className="dashboard-section">
                  <div className="section-header">
                    <div>
                      <h2>Featured Products</h2>
                      <p>Discover the best digital products from talented creators</p>
                    </div>
                    <button className="btn-secondary">View All</button>
                  </div>

                  <div className="products-grid">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
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
                
                {/* Recently Added Products */}
                <section className="dashboard-section">
                  <div className="section-header">
                    <div>
                      <h2>Recently Added</h2>
                      <p>Latest products from our creator community</p>
                    </div>
                    <button className="btn-secondary">View All Recent</button>
                  </div>
                  
                  <div className="products-grid">
                    {products.slice(0, 6).map((product) => (
                      <div key={`recent-${product.id}`} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
                        <div className="product-image">
                          <img 
                            src="src/assets/images/placeholder.jpg" 
                            alt={product.productTitle}
                            onError={(e) => {
                              e.target.src = 'src/assets/images/img-1.jpg';
                            }}
                          />
                          {product.isDemoProduct && (
                            <div className="demo-badge">New</div>
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
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Sidebar */}
              <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'absolute', right: '0', top: '0', paddingBottom: '2rem' }}>
                {/* Trending Trades Section */}
                <section style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', flex: '0 0 auto' }}>
                  <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h3 style={{ color: '#ffffff', fontSize: '1.1rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📈 Trending Trades</h3>
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem' }}>Most popular this week</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {trendingTrades.slice(0, 3).map((trade, index) => (
                      <div key={trade.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}>
                        <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                          {index + 1}
                        </div>
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={trade.image} alt={trade.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.2rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trade.title}</h4>
                          <p style={{ color: '#9ca3af', fontSize: '0.7rem', margin: 0 }}>by {trade.creator}</p>
                        </div>
                        <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 500 }}>
                          {trade.trades}+ trades
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem' }}>View All Trades</button>
                </section>

                {/* Top Creators Section */}
                <section style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', flex: '0 0 auto' }}>
                  <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h3 style={{ color: '#ffffff', fontSize: '1.1rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🏆 Top Creators</h3>
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem' }}>Leading by sales and trades</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {topCreators.slice(0, 3).map((creator, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}>
                        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                          {index + 1}
                        </div>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                          <img src={`src/assets/icons/${creator.avatar}`} alt={creator.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.2rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{creator.name}</h4>
                          <p style={{ color: '#9ca3af', fontSize: '0.7rem', margin: 0 }}>{creator.trades} trades</p>
                        </div>
                        <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 500 }}>
                          {creator.earnings} earned
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem' }}>View Rankings</button>
                </section>

                {/* Creator Forums Section */}
                <section style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
                  <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h3 style={{ color: '#ffffff', fontSize: '1.1rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>💬 Creator Forums</h3>
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem' }}>Community discussions and support</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}>
                      <div style={{ fontSize: '1.5rem', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.3)', flexShrink: 0 }}>
                        💡
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>Ideas & Feedback</h4>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, lineHeight: 1.3 }}>Share ideas and get feedback</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}>
                      <div style={{ fontSize: '1.5rem', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.3)', flexShrink: 0 }}>
                        🎨
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>Creator Showcase</h4>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, lineHeight: 1.3 }}>Show your work and get discovered</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}>
                      <div style={{ fontSize: '1.5rem', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.3)', flexShrink: 0 }}>
                        ❓
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>Help & Support</h4>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, lineHeight: 1.3 }}>Get help with platform features</p>
                      </div>
                    </div>
                  </div>
                  <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem' }}>Browse All Categories</button>
                </section>
              </div>
            </div>
          )}


          {/* Other sections using improved dashboard styling */}
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

          {activeSection === 'forums' && (
            <div className="forums-main-content">
              <section className="dashboard-section">
                <div className="section-header">
                  <div>
                    <h2>Creator Forums</h2>
                    <p>Connect with fellow creators, share knowledge, and grow together</p>
                  </div>
                  <button className="btn-primary">Start New Topic</button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '2rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', borderRadius: '12px', flexShrink: 0 }}>
                        💡
                      </div>
                      <div>
                        <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Ideas & Feedback</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0, lineHeight: 1.4 }}>Share your ideas and get feedback from the community</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#6b7280', fontSize: '0.875rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span>124 topics</span>
                      <span>1.2k posts</span>
                      <span>Last: 2h ago</span>
                    </div>
                  </div>
                  
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '2rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', borderRadius: '12px', flexShrink: 0 }}>
                        🎨
                      </div>
                      <div>
                        <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Creator Showcase</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0, lineHeight: 1.4 }}>Show off your latest work and get discovered</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#6b7280', fontSize: '0.875rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span>89 topics</span>
                      <span>756 posts</span>
                      <span>Last: 4h ago</span>
                    </div>
                  </div>
                  
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '2rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', borderRadius: '12px', flexShrink: 0 }}>
                        🤝
                      </div>
                      <div>
                        <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Collaboration</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0, lineHeight: 1.4 }}>Find partners and collaborate on projects</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#6b7280', fontSize: '0.875rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span>67 topics</span>
                      <span>423 posts</span>
                      <span>Last: 1h ago</span>
                    </div>
                  </div>
                  
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '2rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', borderRadius: '12px', flexShrink: 0 }}>
                        ❓
                      </div>
                      <div>
                        <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Help & Support</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0, lineHeight: 1.4 }}>Get help with platform features and policies</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#6b7280', fontSize: '0.875rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span>156 topics</span>
                      <span>892 posts</span>
                      <span>Last: 30m ago</span>
                    </div>
                  </div>
                </div>
                
                <section style={{ marginTop: '2rem' }}>
                  <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem 0' }}>Recent Discussions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {forumTopics.map((topic) => (
                      <div key={topic.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                            {topic.title}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                            <span>by {topic.author}</span>
                            <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: 500 }}>{topic.category}</span>
                            <span>{topic.lastActivity}</span>
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.25rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 500 }}>{topic.replies} replies</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </section>
            </div>
          )}

          {/* Buyer-specific sections using improved dashboard styling */}
          {activeSection === 'credits' && (
            <section className="dashboard-section">
              <div className="section-header">
                <div>
                  <h2>Credit Management</h2>
                  <p>Manage your credit balance and transfers</p>
                </div>
                <div className="credit-balance">
                  <span className="balance-label">Current Balance:</span>
                  <span className="balance-amount">{userProfile?.credits || 0} Credits</span>
                </div>
              </div>

              {message.text && (
                <div className={`message ${message.type}`} style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  backgroundColor: message.type === 'success' ? '#dcfce7' : '#fef2f2',
                  color: message.type === 'success' ? '#166534' : '#dc2626',
                  border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                  {message.text}
                </div>
              )}

              <div className="credit-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="transfer-section" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#ffffff' }}>Transfer Credits</h3>
                  <form onSubmit={handleCreditTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#9ca3af' }}>Recipient User ID:</label>
                      <input
                        type="text"
                        value={recipientUserId}
                        onChange={(e) => setRecipientUserId(e.target.value)}
                        placeholder="Enter recipient's user ID"
                        required
                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#ffffff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#9ca3af' }}>Amount:</label>
                      <input
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="Enter amount to transfer"
                        min="1"
                        max={userProfile?.credits || 0}
                        required
                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#ffffff' }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={transferLoading}
                      className="btn-primary"
                      style={{ 
                        padding: '1rem', 
                        opacity: transferLoading ? 0.6 : 1,
                        cursor: transferLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {transferLoading ? 'Transferring...' : 'Transfer Credits'}
                    </button>
                  </form>
                </div>

                <div className="credit-info" style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#a855f7' }}>Credit System</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ padding: '0.5rem 0', color: '#9ca3af' }}>💰 Purchase digital products with credits</li>
                    <li style={{ padding: '0.5rem 0', color: '#9ca3af' }}>🔄 Transfer credits to other users</li>
                    <li style={{ padding: '0.5rem 0', color: '#9ca3af' }}>🎁 Earn credits through referrals</li>
                    <li style={{ padding: '0.5rem 0', color: '#9ca3af' }}>📊 All transactions are logged</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'referrals' && (
            <section className="dashboard-section">
              <div className="section-header">
                <div>
                  <h2>Referral Program</h2>
                  <p>Earn credits by referring friends to Fairora</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{userProfile?.totalReferrals || 0}</div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af', textTransform: 'uppercase' }}>Total Referrals</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{userProfile?.creditsFromReferrals || 0}</div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af', textTransform: 'uppercase' }}>Credits Earned</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{userProfile?.pendingReferralCredits || 0}</div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af', textTransform: 'uppercase' }}>Pending Credits</div>
                </div>
              </div>

              <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.2)', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#a855f7' }}>Your Referral Code</h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', background: 'rgba(255, 255, 255, 0.1)', padding: '0.5rem 1rem', borderRadius: '6px', display: 'inline-block', marginBottom: '1rem', color: '#ffffff' }}>
                  {userProfile?.referralCode || 'GENERATING...'}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#a855f7' }}>How it works:</h4>
                  <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto', color: '#9ca3af', listStyle: 'none', padding: 0 }}>
                    <li style={{ padding: '0.25rem 0' }}>Share your referral code with friends</li>
                    <li style={{ padding: '0.25rem 0' }}>They get 25 credits when they sign up</li>
                    <li style={{ padding: '0.25rem 0' }}>You get 50 credits when they make their first purchase</li>
                    <li style={{ padding: '0.25rem 0' }}>No limit on the number of referrals!</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'support' && (
            <section className="dashboard-section">
              <div className="section-header">
                <div>
                  <h2>Support Center</h2>
                  <p>Get help with your account and report issues</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="creator-card" style={{ textAlign: 'center', cursor: 'default' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎧</div>
                  <h3>Contact Support</h3>
                  <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Get help with your account, purchases, or technical issues.</p>
                  <button className="btn-primary">Open Support Ticket</button>
                </div>

                <div className="creator-card" style={{ textAlign: 'center', cursor: 'default' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❓</div>
                  <h3>FAQ</h3>
                  <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Find answers to common questions about credits, purchases, and more.</p>
                  <button className="btn-secondary">View FAQ</button>
                </div>

                <div className="creator-card" style={{ textAlign: 'center', cursor: 'default' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>
                  <h3>Report Issue</h3>
                  <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Report problems with products, transactions, or user behavior.</p>
                  <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>Report Issue</button>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'become-creator' && (
            <section className="dashboard-section">
              <div className="section-header">
                <div>
                  <h2>Become a Creator</h2>
                  <p>Apply to start selling your digital products on Fairora</p>
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</div>
                <h3 style={{ margin: '0 0 1rem 0', color: '#ffffff', fontSize: '2rem' }}>Join Our Creator Community</h3>
                <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '1.1rem' }}>Start earning by selling your digital products to thousands of buyers</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffffff' }}>Earn Credits</h4>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Get paid for every sale</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛍️</div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffffff' }}>Global Market</h4>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Reach buyers worldwide</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffffff' }}>Easy Setup</h4>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Simple application process</p>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/creator-application')}
                  className="btn-primary"
                  style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                >
                  Apply to Become Creator
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default BuyerDashboard;