import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Welcome to your Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      
      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h3>User Information</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.uid}</p>
      </div>

      <div style={{ background: '#e7f3ff', padding: '1.5rem', borderRadius: '8px' }}>
        <h3>🎉 Authentication Setup Complete!</h3>
        <p>Your Firebase Authentication is now working. This dashboard confirms successful login.</p>
        <p>Next steps would be to implement user profile management, product listings, and marketplace features.</p>
      </div>
    </div>
  );
};

export default Dashboard;