import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!userType) {
      setError('Please select Creator or Buyer');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        userType: userType,
        createdAt: new Date().toISOString(),
        profileComplete: userType === 'buyer' ? true : false
      });

      if (userType === 'creator') {
        navigate('/creator-form');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'auth/configuration-not-found') {
        setError('Firebase Authentication is not properly configured. Please enable Email/Password authentication in Firebase Console.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button 
        className="btn-back-home"
        onClick={() => navigate('/')}
      >
        ← Back to Home
      </button>
      <div className="auth-card">
        <h2>Create Your Account</h2>
        <p>Join Fairora marketplace</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>I want to join as:</label>
            <div className="user-type-options">
              <div 
                className={`user-type-card ${userType === 'creator' ? 'selected' : ''}`}
                onClick={() => setUserType('creator')}
              >
                <div className="user-type-icon">🎨</div>
                <h3>Creator</h3>
                <p>Sell your digital products and services</p>
              </div>
              
              <div 
                className={`user-type-card ${userType === 'buyer' ? 'selected' : ''}`}
                onClick={() => setUserType('buyer')}
              >
                <div className="user-type-icon">🛒</div>
                <h3>Buyer</h3>
                <p>Discover and purchase digital assets</p>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-links">
          <p>Already have an account? <a href="/login">Sign In</a></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;