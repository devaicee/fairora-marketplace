import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Search, User, Settings, LogOut, AlertTriangle, ChevronDown } from 'lucide-react';

const TopNavigation = ({ user, userProfile }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Search for:', searchQuery);
    }
  };

  const isDraftMode = userProfile?.role === 'creator' && userProfile?.creatorStatus === 'draft';

  // Dropdown animation variants (simulating framer-motion)
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <nav className="top-navigation">
      <div className="flex h-16 items-center justify-between px-4" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
        {/* Left - Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer transition-colors"
          onClick={() => navigate('/')}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#c084fc'}
          onMouseLeave={(e) => e.target.style.color = 'white'}
        >
          <div className="gradient-bg" style={{
            display: 'flex',
            height: '2.25rem',
            width: '2.25rem',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.5rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'white'
          }}>
            ⚡
          </div>
          <span style={{ 
            display: window.innerWidth >= 640 ? 'block' : 'none',
            fontWeight: '700',
            color: 'white',
            fontSize: '1.25rem'
          }}>Fairora</span>
        </div>

        {/* Center - Search */}
        <div style={{ 
          display: window.innerWidth >= 768 ? 'block' : 'none',
          flex: 1,
          maxWidth: '32rem',
          margin: '0 2rem'
        }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search creators, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '2.5rem',
                  paddingLeft: '1rem',
                  paddingRight: '3rem',
                  fontSize: '0.875rem',
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '9999px',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#a855f7';
                  e.target.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.1)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '0.5rem',
                  color: '#9ca3af',
                  borderRadius: '50%',
                  transition: 'all 0.3s',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#c084fc';
                  e.target.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#9ca3af';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '0.875rem' }}>🔍</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right - User Menu */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => setShowDropdown(!showDropdown)}
            onMouseEnter={(e) => {
              setShowDropdown(true);
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.target.style.borderColor = 'rgba(168, 85, 247, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <div 
              className="gradient-bg" 
              style={{
                display: 'flex',
                height: '2rem',
                width: '2rem',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/profile')}
              title="Go to Profile"
            >
              {getUserInitials()}
            </div>
            <span style={{ 
              display: window.innerWidth >= 640 ? 'block' : 'none',
              fontWeight: '500'
            }}>{getDisplayName()}</span>
            <span style={{
              fontSize: '0.75rem',
              opacity: 0.7,
              transition: 'transform 0.3s',
              transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>▼</span>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="glassmorphism animate-slideIn"
              style={{ 
                position: 'absolute',
                right: 0,
                marginTop: '0.5rem',
                width: '14rem',
                padding: '0.5rem 0',
                backgroundColor: 'rgba(26, 26, 26, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                zIndex: 1001,
                transformOrigin: 'top right'
              }}
              onMouseLeave={() => setShowDropdown(false)}
            >
              {isDraftMode && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      margin: '0.5rem',
                      marginBottom: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#fbbf24',
                      backgroundColor: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onClick={() => navigate('/creator-form')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(251, 191, 36, 0.2)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(251, 191, 36, 0.1)'}
                  >
                    <span style={{ fontSize: '1rem' }}>⚠</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '500' }}>Complete Creator Form</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Draft status</span>
                    </div>
                  </div>
                  <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0.5rem' }}></div>
                </>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: '#d1d5db',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onClick={() => navigate('/profile')}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.color = '#c084fc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#d1d5db';
                }}
              >
                <span style={{ fontSize: '1rem' }}>👤</span>
                <span>Edit Profile</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: '#d1d5db',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onClick={() => navigate('/settings')}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.color = '#c084fc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#d1d5db';
                }}
              >
                <span style={{ fontSize: '1rem' }}>⚙️</span>
                <span>Settings</span>
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0.5rem' }}></div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: '#ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onClick={handleLogout}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '1rem' }}>🚪</span>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </nav>
  );
};

export default TopNavigation;