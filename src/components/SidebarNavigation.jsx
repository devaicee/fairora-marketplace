import { useNavigate, useLocation } from 'react-router-dom';
// import { Store, TrendingUp, Trophy, Wallet, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const SidebarNavigation = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: '🏪', // Store icon
      path: '/dashboard',
      isActive: location.pathname === '/dashboard'
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: '📈', // TrendingUp icon
      path: '/dashboard/trending',
      isActive: location.pathname === '/dashboard/trending'
    },
    {
      id: 'rankings',
      label: 'Rankings',
      icon: '🏆', // Trophy icon
      path: '/dashboard/rankings',
      isActive: location.pathname === '/dashboard/rankings'
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: '💰', // Wallet icon
      path: '/wallet',
      isActive: location.pathname === '/wallet'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: '💬', // MessageCircle icon
      path: '/messages',
      isActive: location.pathname === '/messages'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <>
      <aside className={`sidebar-nav ${collapsed ? 'sidebar-collapsed' : ''}`}>
        
        <div className="flex h-full flex-col p-4" style={{ 
          display: 'flex',
          height: '100%',
          flexDirection: 'column',
          padding: '1rem'
        }}>
          {/* Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              height: '2.25rem',
              width: '2.25rem',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              border: 'none',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
              e.target.style.color = '#c084fc';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.target.style.color = 'white';
            }}
          >
            <span style={{ fontSize: '0.875rem' }}>{collapsed ? '→' : '←'}</span>
          </button>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                title={collapsed ? item.label : ''}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  item.isActive
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:bg-white/8 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="text-lg flex-shrink-0">
                  {item.icon}
                  {/* Uncomment when lucide-react is available:
                  {item.id === 'marketplace' && <Store size={18} />}
                  {item.id === 'trending' && <TrendingUp size={18} />}
                  {item.id === 'rankings' && <Trophy size={18} />}
                  {item.id === 'wallet' && <Wallet size={18} />}
                  {item.id === 'messages' && <MessageCircle size={18} />}
                  */}
                </span>
                
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {!collapsed && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
};

export default SidebarNavigation;