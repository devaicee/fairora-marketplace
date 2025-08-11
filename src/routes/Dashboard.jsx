import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/auth.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [creatorForm, setCreatorForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // Get user profile
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile(userData);
            
            // If user is creator, get creator form data
            if (userData.role === 'creator') {
              const creatorFormDoc = await getDoc(doc(db, 'creator_forms', `creator_${currentUser.uid}`));
              if (creatorFormDoc.exists()) {
                setCreatorForm(creatorFormDoc.data());
              }
            }
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#ffffff', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  const getCreatorStatusMessage = () => {
    if (!userProfile || userProfile.role !== 'creator') return null;
    
    if (userProfile.creatorStatus === 'incomplete') {
      return {
        type: 'warning',
        message: 'Creator form incomplete — complete to unlock creator privileges.',
        action: 'Complete Creator Form',
        actionHandler: () => navigate('/creator-form')
      };
    }
    
    if (userProfile.creatorStatus === 'draft') {
      return {
        type: 'warning',
        message: 'Creator form saved as draft — submit for review to unlock creator privileges.',
        action: 'Complete Creator Form',
        actionHandler: () => navigate('/creator-form')
      };
    }
    
    if (userProfile.creatorStatus === 'pending') {
      return {
        type: 'info',
        message: 'Your creator application is under review.',
        action: null
      };
    }
    
    if (userProfile.creatorStatus === 'approved') {
      return {
        type: 'success',
        message: 'Creator account approved! You have full creator privileges.',
        action: 'Create New Product',
        actionHandler: () => console.log('Navigate to create product')
      };
    }
    
    return null;
  };
  
  const statusMessage = getCreatorStatusMessage();

  return (
    <div className="creator-form-container">
      <button 
        className="btn-back-home"
        onClick={() => navigate('/')}
      >
        ← Back to Home
      </button>
      
      <button 
        className="btn-secondary"
        onClick={() => navigate('/user-dashboard')}
        style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px',
          width: 'auto',
          marginTop: 0,
          padding: '8px 16px',
          fontSize: '14px'
        }}
      >
        → Enhanced Dashboard
      </button>
      
      <div className="creator-form-card" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, textAlign: 'left' }}>Dashboard</h2>
          <button 
            onClick={handleLogout} 
            className="btn-secondary" 
            style={{ width: 'auto', marginTop: 0, padding: '8px 16px', fontSize: '14px' }}
          >
            Logout
          </button>
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          marginBottom: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Account Information</h3>
          <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}><strong>Email:</strong> {user.email}</p>
          <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}><strong>Role:</strong> {userProfile?.role || 'Not set'}</p>
          <p style={{ color: '#9ca3af', margin: 0 }}><strong>Member since:</strong> {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}</p>
        </div>

        {statusMessage && (
          <div style={{ 
            background: statusMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                       statusMessage.type === 'info' ? 'rgba(59, 130, 246, 0.1)' :
                       statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${
              statusMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' :
              statusMessage.type === 'info' ? 'rgba(59, 130, 246, 0.3)' :
              statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'
            }`,
            padding: '1.5rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <p style={{ 
                color: statusMessage.type === 'warning' ? '#fbbf24' :
                       statusMessage.type === 'info' ? '#60a5fa' :
                       statusMessage.type === 'success' ? '#4ade80' : '#ffffff',
                margin: 0,
                flex: 1
              }}>
                {statusMessage.message}
              </p>
              {statusMessage.action && statusMessage.actionHandler && (
                <button 
                  onClick={statusMessage.actionHandler}
                  className="btn-primary"
                  style={{ width: 'auto', marginTop: 0, padding: '8px 16px', fontSize: '14px' }}
                >
                  {statusMessage.action}
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '1.5rem', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>🎉 Welcome to Fairora Marketplace!</h3>
          <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>Your account is successfully set up and ready to use.</p>
          
          {userProfile?.role === 'buyer' && (
            <p style={{ color: '#9ca3af', margin: 0 }}>You can browse and purchase digital products from creators on our marketplace.</p>
          )}
          
          {userProfile?.role === 'creator' && userProfile.creatorStatus === 'approved' && (
            <p style={{ color: '#9ca3af', margin: 0 }}>You can create and sell digital products on our marketplace.</p>
          )}
          
          {userProfile?.role === 'creator' && userProfile.creatorStatus !== 'approved' && (
            <p style={{ color: '#9ca3af', margin: 0 }}>While your creator application is being processed, you can browse the marketplace as a buyer.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;