import { useState, useEffect } from 'react';

const MarketplaceFeed = ({ userProfile }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockPosts = [
    {
      id: 1,
      creatorName: 'Alex Designer',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      title: 'Modern UI Kit for Mobile Apps',
      description: 'A comprehensive set of modern UI components designed specifically for mobile applications.',
      tags: ['UI/UX', 'Mobile', 'Design'],
      price: 25,
      likes: 142,
      comments: 28,
      shares: 15,
      timestamp: '2 hours ago',
      image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=200&fit=crop'
    },
    {
      id: 2,
      creatorName: 'Sarah Chen',
      creatorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b2c6a16c?w=40&h=40&fit=crop&crop=face',
      title: 'Complete React Component Library',
      description: 'Production-ready React components with TypeScript support.',
      tags: ['React', 'TypeScript', 'Components'],
      price: 45,
      likes: 89,
      comments: 12,
      shares: 8,
      timestamp: '4 hours ago',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop'
    },
    {
      id: 3,
      creatorName: 'Marcus Johnson',
      creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      title: 'Digital Marketing Course Bundle',
      description: 'Learn the fundamentals of digital marketing with this comprehensive course bundle.',
      tags: ['Marketing', 'Education', 'Business'],
      price: 35,
      likes: 205,
      comments: 45,
      shares: 32,
      timestamp: '6 hours ago',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop'
    }
  ];

  const mockTrendingTrades = [
    { id: 1, title: 'Creative Design Assets Bundle', creator: 'PixelCraft Studio', trades: 234 },
    { id: 2, title: 'Web Development Toolkit', creator: 'CodeMaster Pro', trades: 189 },
    { id: 3, title: 'Music Production Pack', creator: 'AudioWave', trades: 167 }
  ];

  const mockTopCreators = [
    { id: 1, name: 'Emma Rodriguez', rank: 1, earnings: '12.5K credits', products: 24 },
    { id: 2, name: 'David Kim', rank: 2, earnings: '10.2K credits', products: 18 },
    { id: 3, name: 'Luna Martinez', rank: 3, earnings: '8.7K credits', products: 32 }
  ];

  const mockForumPosts = [
    { id: 1, title: 'Best practices for pricing digital products?', author: 'NewCreator123', replies: 23 },
    { id: 2, title: 'How to market your first product effectively', author: 'MarketingGuru', replies: 15 },
    { id: 3, title: 'Feedback on my UI design collection', author: 'DesignPro', replies: 8 }
  ];

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
      setLoading(false);
    };
    loadPosts();
  }, []);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const isDraftMode = userProfile?.role === 'creator' && userProfile?.creatorStatus === 'draft';

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '50vh' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: '#9ca3af' }}>Loading marketplace feed...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ flex: 1, overflowY: 'auto' }}>
      <div className="max-w-6xl mx-auto p-6 space-y-8" style={{ 
        maxWidth: '72rem',
        margin: '0 auto',
        padding: '1.5rem'
      }}>
        
        {/* Draft Mode Banner */}
        {isDraftMode && (
          <div className="glassmorphism" style={{
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', color: '#fbbf24', margin: 0 }}>You are currently in draft mode</p>
                <p style={{ fontSize: '0.875rem', color: 'rgba(251, 191, 36, 0.8)', margin: 0 }}>
                  Complete your creator form to start posting and unlock all features.
                </p>
              </div>
              <button 
                onClick={() => window.location.href = '/creator-form'}
                className="btn-primary"
                style={{ backgroundColor: '#f59e0b' }}
              >
                Complete Form
              </button>
            </div>
          </div>
        )}

        {/* Main Feed Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ 
            fontSize: '2.25rem',
            fontWeight: '700',
            marginBottom: '1rem'
          }}>
            Marketplace Feed
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#9ca3af' }}>
            Discover amazing digital products from talented creators
          </p>
        </div>

        {/* Main Posts Feed */}
        <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.map((post) => (
            <article key={post.id} className="post-card">
              {/* Post Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img 
                    src={post.creatorAvatar} 
                    alt={post.creatorName}
                    style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid rgba(255, 255, 255, 0.2)'
                    }}
                  />
                  <div>
                    <h3 style={{ fontWeight: '600', color: 'white', margin: 0 }}>{post.creatorName}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>{post.timestamp}</p>
                  </div>
                </div>
                <button style={{ 
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%'
                }}>
                  <span style={{ fontSize: '1.125rem' }}>⋯</span>
                </button>
              </div>

              {/* Post Content */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.5rem',
                  lineHeight: 1.3
                }}>
                  {post.title}
                </h4>
                <p style={{ 
                  color: '#d1d5db',
                  lineHeight: 1.5,
                  marginBottom: '1rem'
                }}>
                  {post.description}
                </p>
                
                {post.image && (
                  <div style={{ borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img 
                      src={post.image} 
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '12rem',
                        objectFit: 'cover',
                        transition: 'transform 0.3s'
                      }}
                    />
                  </div>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'rgba(168, 85, 247, 0.2)',
                        color: '#d8b4fe',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        border: '1px solid rgba(168, 85, 247, 0.3)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#9ca3af' }}>Price:</span>
                  <span style={{ fontWeight: '700', color: '#10b981', fontSize: '1.125rem' }}>
                    {post.price} credits
                  </span>
                </div>
              </div>

              {/* Post Actions */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button 
                    onClick={() => handleLike(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      transition: 'color 0.3s'
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>❤️</span>
                    <span style={{ fontWeight: '500' }}>{post.likes}</span>
                  </button>

                  <button 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>💬</span>
                    <span style={{ fontWeight: '500' }}>{post.comments}</span>
                  </button>

                  <button 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>📤</span>
                    <span style={{ fontWeight: '500' }}>{post.shares}</span>
                  </button>
                </div>

                <button className="btn-primary">
                  <span style={{ fontSize: '1.125rem' }}>🛒</span>
                  <span>Buy Now</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Additional Sections Grid */}
        <div className="grid grid-cols-3" style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth >= 1024 ? 'repeat(3, 1fr)' : '1fr',
          gap: '2rem',
          marginTop: '3rem'
        }}>
          
          {/* Trending Trades */}
          <div className="glassmorphism" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📈</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', margin: 0 }}>
                Trending Trades
              </h2>
            </div>
            
            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mockTrendingTrades.map((item, index) => (
                <div key={item.id} className="glassmorphism" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  cursor: 'pointer'
                }}>
                  <div className="gradient-bg" style={{
                    display: 'flex',
                    height: '2rem',
                    width: '2rem',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: 'white'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: '600', color: 'white', fontSize: '0.875rem', margin: 0 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
                      by {item.creator}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981', margin: 0 }}>
                      {item.trades}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>trades</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Creators */}
          <div className="glassmorphism" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🏆</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', margin: 0 }}>
                Top Creators
              </h2>
            </div>
            
            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mockTopCreators.map((creator) => (
                <div key={creator.id} className="glassmorphism" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  cursor: 'pointer'
                }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      backgroundColor: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {creator.name[0]}
                    </div>
                    <div className="gradient-bg" style={{
                      position: 'absolute',
                      top: '-0.25rem',
                      right: '-0.25rem',
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'white'
                    }}>
                      {creator.rank}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: '600', color: 'white', fontSize: '0.875rem', margin: 0 }}>
                      {creator.name}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#10b981', margin: 0 }}>
                      {creator.earnings}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#d1d5db', margin: 0 }}>
                      {creator.products}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>products</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forums */}
          <div className="glassmorphism" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>💬</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', margin: 0 }}>
                Recent Discussions
              </h2>
            </div>
            
            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mockForumPosts.map((forumPost) => (
                <div key={forumPost.id} className="glassmorphism" style={{
                  padding: '0.75rem',
                  cursor: 'pointer'
                }}>
                  <h3 style={{ 
                    fontWeight: '500', 
                    color: 'white', 
                    fontSize: '0.875rem', 
                    marginBottom: '0.5rem',
                    lineHeight: 1.2
                  }}>
                    {forumPost.title}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                  }}>
                    <span>by {forumPost.author}</span>
                    <span>{forumPost.replies} replies</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFeed;