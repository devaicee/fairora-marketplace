import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import '../App.css';
import '../styles/refactored-dashboard.css';

const RefactoredDashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [creatorPosts, setCreatorPosts] = useState([]);
  const [suggestedCreators, setSuggestedCreators] = useState([]);
  const [forumTopics, setForumTopics] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();

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

  // Set active section based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('trending')) setActiveSection('trending');
    else if (path.includes('rankings')) setActiveSection('rankings');
    else if (path.includes('wallet')) setActiveSection('wallet');
    else if (path.includes('messages')) setActiveSection('messages');
    else setActiveSection('home');
  }, [location]);

  const loadDashboardData = async () => {
    try {
      // Load creator forms as posts
      const postsQuery = query(
        collection(db, 'creator_forms'),
        orderBy('updatedAt', 'desc'),
        limit(20)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: new Date(doc.data().updatedAt || doc.data().createdAt).toLocaleDateString(),
        timeAgo: getTimeAgo(new Date(doc.data().updatedAt || doc.data().createdAt)),
        likes: Math.floor(Math.random() * 50) + 5,
        comments: Math.floor(Math.random() * 20) + 2
      }));
      
      setCreatorPosts(postsData);

      // Mock suggested creators
      setSuggestedCreators([
        { name: "Alex Rivera", speciality: "UI/UX Design", avatar: "ava-1.png", followers: "2.4k" },
        { name: "Sarah Kim", speciality: "Digital Art", avatar: "ava-2.png", followers: "1.8k" },
        { name: "Marcus Chen", speciality: "Web Development", avatar: "ava-3.png", followers: "3.2k" },
        { name: "Elena Rodriguez", speciality: "Photography", avatar: "ava-4.png", followers: "1.5k" }
      ]);

      // Mock recent forum topics
      setForumTopics([
        { title: "Best practices for pricing digital assets", replies: 23, category: "Pricing" },
        { title: "How to build your creator portfolio", replies: 18, category: "Career" },
        { title: "Digital art licensing guide", replies: 15, category: "Legal" }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getDisplayName = () => {
    return userProfile?.displayName || user?.displayName || userProfile?.email?.split('@')[0] || 'User';
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Navigate to different routes
    const routes = {
      home: '/dashboard',
      trending: '/dashboard/trending',
      rankings: '/dashboard/rankings',
      wallet: '/wallet',
      messages: '/messages'
    };
    
    if (routes[section]) {
      navigate(routes[section]);
    }
  };

  const filteredPosts = creatorPosts.filter(post =>
    post.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="refactored-dashboard">
      {/* Top Navigation Bar */}
      <header className="top-nav">
        <div className="nav-container">
          {/* Left - Logo/Title */}
          <div className="nav-left">
            <div className="logo">
              <div className="logo-icon">
                <img src="src/assets/icons/icon-1.png" alt="Fairora" />
              </div>
              <span>Fairora Marketplace</span>
            </div>
          </div>
          
          {/* Center - Search Bar */}
          <div className="nav-center">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search posts, creators, topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
          
          {/* Right - Profile Menu */}
          <div className="nav-right">
            <div 
              className="profile-menu"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              onBlur={() => setTimeout(() => setProfileDropdownOpen(false), 200)}
            >
              <img 
                src="src/assets/icons/ava-1.png" 
                alt={getDisplayName()} 
                className="profile-avatar"
              />
              <span className="profile-name">{getDisplayName()}</span>
              <span className="dropdown-arrow">▼</span>
              
              {/* Dropdown Menu */}
              <div className={`profile-dropdown ${profileDropdownOpen ? 'open' : ''}`}>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/profile');
                  }}
                >
                  <span className="dropdown-icon">👤</span>
                  Edit Profile
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings');
                  }}
                >
                  <span className="dropdown-icon">⚙️</span>
                  Settings
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <span className="dropdown-icon">🚪</span>
                  Logout
                </button>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="dashboard-layout">
        {/* Sidebar Navigation */}
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}
              onClick={() => handleSectionChange('home')}
            >
              <span className="nav-icon">🏪</span>
              <span className="nav-label">Marketplace</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'trending' ? 'active' : ''}`}
              onClick={() => handleSectionChange('trending')}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-label">Trending</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'rankings' ? 'active' : ''}`}
              onClick={() => handleSectionChange('rankings')}
            >
              <span className="nav-icon">🏆</span>
              <span className="nav-label">Rankings</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'wallet' ? 'active' : ''}`}
              onClick={() => handleSectionChange('wallet')}
            >
              <span className="nav-icon">💳</span>
              <span className="nav-label">Wallet</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'messages' ? 'active' : ''}`}
              onClick={() => handleSectionChange('messages')}
            >
              <span className="nav-icon">💬</span>
              <span className="nav-label">Messages</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          <div className="content-layout">
            {/* Left - Main Feed */}
            <div className="main-feed">
              {activeSection === 'home' && (
                <>
                  <div className="feed-header">
                    <h2>Creator Posts</h2>
                    <p>Latest updates from our creative community</p>
                  </div>
                  
                  <div className="posts-feed">
                    {filteredPosts.length > 0 ? (
                      filteredPosts.map((post) => (
                        <article key={post.id} className="post-card">
                          <div className="post-header">
                            <img 
                              src="src/assets/icons/ava-2.png" 
                              alt={post.creatorName || 'Creator'} 
                              className="creator-avatar"
                            />
                            <div className="creator-info">
                              <h4 className="creator-name">
                                {post.creatorName || post.creatorEmail?.split('@')[0] || 'Anonymous Creator'}
                              </h4>
                              <span className="post-timestamp">{post.timeAgo}</span>
                            </div>
                          </div>
                          
                          <div className="post-content">
                            <h3 className="post-title">{post.productTitle}</h3>
                            <p className="post-description">
                              {post.description?.substring(0, 200)}
                              {post.description?.length > 200 ? '...' : ''}
                            </p>
                            
                            <div className="post-tags">
                              {post.category && (
                                <span className="category-badge">{post.category}</span>
                              )}
                              {post.tags && Array.isArray(post.tags) && post.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="tag-badge">#{tag}</span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="post-actions">
                            <button className="action-btn">
                              <span className="action-icon">❤️</span>
                              <span>{post.likes} likes</span>
                            </button>
                            <button className="action-btn">
                              <span className="action-icon">💬</span>
                              <span>{post.comments} comments</span>
                            </button>
                            <button className="action-btn">
                              <span className="action-icon">🔗</span>
                              <span>Share</span>
                            </button>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="no-posts">
                        <p>{searchTerm ? 'No posts found matching your search.' : 'No creator posts available yet.'}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeSection === 'trending' && (
                <div className="section-content">
                  <h2>Trending</h2>
                  <p>Most popular content this week</p>
                </div>
              )}

              {activeSection === 'rankings' && (
                <div className="section-content">
                  <h2>Creator Rankings</h2>
                  <p>Top performers in the community</p>
                </div>
              )}

              {activeSection === 'wallet' && (
                <div className="section-content">
                  <h2>Your Wallet</h2>
                  <p>Manage your credits and transactions</p>
                </div>
              )}

              {activeSection === 'messages' && (
                <div className="section-content">
                  <h2>Messages</h2>
                  <p>Connect with other creators</p>
                </div>
              )}
            </div>
            
            {/* Right Sidebar */}
            <div className="right-sidebar">
              <div className="sidebar-section">
                <h3>Suggested Creators</h3>
                <div className="suggested-creators">
                  {suggestedCreators.map((creator, index) => (
                    <div key={index} className="suggested-creator">
                      <img 
                        src={`src/assets/icons/${creator.avatar}`} 
                        alt={creator.name}
                        className="suggested-avatar"
                      />
                      <div className="suggested-info">
                        <h4>{creator.name}</h4>
                        <p>{creator.speciality}</p>
                        <span className="follower-count">{creator.followers} followers</span>
                      </div>
                      <button className="follow-btn">Follow</button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="sidebar-section">
                <h3>Recent Forum Topics</h3>
                <div className="forum-topics">
                  {forumTopics.map((topic, index) => (
                    <div key={index} className="forum-topic">
                      <h4>{topic.title}</h4>
                      <div className="topic-meta">
                        <span className="topic-category">{topic.category}</span>
                        <span className="topic-replies">{topic.replies} replies</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RefactoredDashboard;