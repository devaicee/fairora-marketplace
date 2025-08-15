import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { initializeUserProfile } from '../utils/userSetup';

const DashboardRouter = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        // Get user profile and initialize buyer features
        const userData = await initializeUserProfile(currentUser.uid);
        
        if (userData) {
          // Determine which dashboard to show based on role and creator status
          const shouldUseBuyerDashboard = (
            // All buyers go to buyer dashboard
            !userData.role || userData.role === 'buyer' ||
            // Creators who haven't been approved yet also use buyer dashboard
            (userData.role === 'creator' && userData.creatorStatus !== 'approved')
          );
          
          if (shouldUseBuyerDashboard) {
            navigate('/buyer-dashboard', { replace: true });
          } else {
            // Approved creators go to the full creator dashboard
            navigate('/user-dashboard', { replace: true });
          }
        } else {
          // If no user data, default to buyer dashboard
          navigate('/buyer-dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error determining dashboard route:', error);
        navigate('/buyer-dashboard', { replace: true });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{
          fontSize: '1.2rem',
          color: '#6b7280'
        }}>
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return null; // Component handles navigation, doesn't render anything
};

export default DashboardRouter;