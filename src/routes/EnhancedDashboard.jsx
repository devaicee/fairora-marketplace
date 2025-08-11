import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import TopNavigation from '../components/TopNavigation';
import SidebarNavigation from '../components/SidebarNavigation';
import MarketplaceFeed from '../components/MarketplaceFeed';
import '../styles/enhanced-dashboard.css';

const EnhancedDashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile(userData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        
        setLoading(false);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading || !user) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <div style={{ fontSize: '1.125rem', color: '#9ca3af' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard">
      <TopNavigation user={user} userProfile={userProfile} />
      
      <div style={{ display: 'flex', height: 'calc(100vh - 4rem)' }}>
        <SidebarNavigation 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />
        
        <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <MarketplaceFeed userProfile={userProfile} />
        </main>
      </div>
    </div>
  );
};

export default EnhancedDashboard;