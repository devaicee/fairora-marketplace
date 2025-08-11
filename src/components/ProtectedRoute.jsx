import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const ProtectedRoute = ({ children, requireCreator = false, requireApprovedCreator = false }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
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

          // Check authorization based on requirements
          if (requireApprovedCreator) {
            // Require approved creator status
            if (userData.role === 'creator' && userData.creatorStatus === 'approved') {
              setAuthorized(true);
            } else {
              setAuthorized(false);
            }
          } else if (requireCreator) {
            // Require any creator role (including draft/pending)
            if (userData.role === 'creator') {
              setAuthorized(true);
            } else {
              setAuthorized(false);
            }
          } else {
            // No special requirements, just need to be logged in
            setAuthorized(true);
          }
        } else {
          setAuthorized(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setAuthorized(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, requireCreator, requireApprovedCreator]);

  if (loading) {
    return (
      <div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#ffffff', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="creator-form-container">
        <button 
          className="btn-back-home"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
        
        <div className="creator-form-card" style={{ maxWidth: '600px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Access Restricted</h2>
          
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '1.5rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem'
          }}>
            <p style={{ color: '#fca5a5', textAlign: 'center', margin: 0 }}>
              {requireApprovedCreator 
                ? 'You need an approved creator account to access this page. Please complete and submit your creator form for review.'
                : requireCreator 
                ? 'You need a creator account to access this page.'
                : 'You do not have permission to access this page.'
              }
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
              style={{ width: 'auto', padding: '12px 24px' }}
            >
              Go to Dashboard
            </button>
            
            {userProfile?.role === 'creator' && userProfile.creatorStatus !== 'approved' && (
              <button 
                onClick={() => navigate('/creator-form')}
                className="btn-secondary"
                style={{ width: 'auto', padding: '12px 24px' }}
              >
                Complete Creator Form
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;