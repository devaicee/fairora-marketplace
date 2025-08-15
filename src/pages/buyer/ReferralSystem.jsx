import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import '../../styles/referral-system.css';

const ReferralSystem = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    creditsEarned: 0,
    pendingCredits: 0,
    referralHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [contributionHistory, setContributionHistory] = useState([]);

  const REFERRAL_REWARD = 50;
  const SIGNUP_BONUS = 25;

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    if (auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          
          const userReferralCode = userData.referralCode || generateReferralCode();
          setReferralCode(userReferralCode);
          
          if (!userData.referralCode) {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              referralCode: userReferralCode
            });
          }
          
          setReferralStats({
            totalReferrals: userData.totalReferrals || 0,
            creditsEarned: userData.creditsFromReferrals || 0,
            pendingCredits: userData.pendingReferralCredits || 0,
            referralHistory: userData.referralHistory || []
          });
          
          setContributionHistory(userData.contributionHistory || []);
        }
      } catch (error) {
        console.error('Error loading referral data:', error);
        setMessage({ text: 'Error loading referral data', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setMessage({ text: 'Referral code copied to clipboard!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }).catch(() => {
      setMessage({ text: 'Failed to copy referral code', type: 'error' });
    });
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink).then(() => {
      setMessage({ text: 'Referral link copied to clipboard!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }).catch(() => {
      setMessage({ text: 'Failed to copy referral link', type: 'error' });
    });
  };

  const submitFeedback = async () => {
    try {
      const feedbackDoc = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        type: 'platform_feedback',
        timestamp: new Date().toISOString(),
        status: 'pending_review',
        creditReward: 10
      };
      
      await addDoc(collection(db, 'contributions'), feedbackDoc);
      
      const contributionRecord = {
        type: 'feedback',
        credits: 10,
        timestamp: new Date().toISOString(),
        status: 'pending',
        description: 'Platform feedback submission'
      };
      
      const updatedHistory = [...contributionHistory, contributionRecord];
      setContributionHistory(updatedHistory);
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        contributionHistory: updatedHistory
      });
      
      setMessage({ text: 'Feedback submitted! You\'ll earn 10 credits once reviewed.', type: 'success' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage({ text: 'Error submitting feedback', type: 'error' });
    }
  };

  const participateInSurvey = async () => {
    try {
      const surveyDoc = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        type: 'survey_participation',
        timestamp: new Date().toISOString(),
        status: 'completed',
        creditReward: 25
      };
      
      await addDoc(collection(db, 'contributions'), surveyDoc);
      
      const contributionRecord = {
        type: 'survey',
        credits: 25,
        timestamp: new Date().toISOString(),
        status: 'completed',
        description: 'Survey participation'
      };
      
      const updatedHistory = [...contributionHistory, contributionRecord];
      const updatedCredits = (userProfile.credits || 0) + 25;
      
      setContributionHistory(updatedHistory);
      setUserProfile(prev => ({ ...prev, credits: updatedCredits }));
      
      const transactionRecord = {
        id: Date.now().toString(),
        type: 'earned',
        amount: 25,
        timestamp: new Date().toISOString(),
        description: 'Credits earned from survey participation'
      };
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        contributionHistory: updatedHistory,
        credits: updatedCredits,
        transactionHistory: [...(userProfile.transactionHistory || []), transactionRecord]
      });
      
      setMessage({ text: 'Thank you for participating! 25 credits added to your account.', type: 'success' });
    } catch (error) {
      console.error('Error participating in survey:', error);
      setMessage({ text: 'Error participating in survey', type: 'error' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': '#10b981',
      'pending': '#f59e0b',
      'pending_review': '#3b82f6',
      'rejected': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return <div className="referral-loading">Loading referral information...</div>;
  }

  return (
    <div className="referral-system">
      <div className="referral-header">
        <h1>Referral Program & Earnings</h1>
        <p>Earn credits by referring friends and contributing to the platform</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="referral-content">
        <div className="referral-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{referralStats.totalReferrals}</div>
                <div className="stat-label">Total Referrals</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <div className="stat-value">{referralStats.creditsEarned}</div>
                <div className="stat-label">Credits Earned</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <div className="stat-value">{referralStats.pendingCredits}</div>
                <div className="stat-label">Pending Credits</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <div className="stat-value">{userProfile?.credits || 0}</div>
                <div className="stat-label">Current Balance</div>
              </div>
            </div>
          </div>
        </div>

        <div className="referral-actions">
          <div className="referral-code-section">
            <h3>Your Referral Code</h3>
            <div className="code-display">
              <div className="referral-code">{referralCode}</div>
              <div className="code-actions">
                <button onClick={copyReferralCode} className="copy-btn">
                  Copy Code
                </button>
                <button onClick={copyReferralLink} className="copy-btn">
                  Copy Link
                </button>
              </div>
            </div>
            <div className="referral-info">
              <h4>How it works:</h4>
              <ul>
                <li>Share your referral code or link with friends</li>
                <li>They get {SIGNUP_BONUS} credits when they sign up</li>
                <li>You get {REFERRAL_REWARD} credits when they make their first purchase</li>
                <li>No limit on the number of referrals!</li>
              </ul>
            </div>
          </div>

          <div className="contribution-section">
            <h3>Earn Credits Through Contributions</h3>
            <div className="contribution-options">
              <div className="contribution-option">
                <div className="option-info">
                  <h4>📝 Submit Feedback</h4>
                  <p>Help us improve the platform with your valuable feedback</p>
                  <div className="reward">+10 Credits</div>
                </div>
                <button onClick={submitFeedback} className="contribute-btn">
                  Submit Feedback
                </button>
              </div>
              
              <div className="contribution-option">
                <div className="option-info">
                  <h4>📊 Take Survey</h4>
                  <p>Participate in our monthly user experience survey</p>
                  <div className="reward">+25 Credits</div>
                </div>
                <button onClick={participateInSurvey} className="contribute-btn">
                  Take Survey
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="history-section">
          <div className="referral-history">
            <h3>Referral History</h3>
            {referralStats.referralHistory.length > 0 ? (
              <div className="history-list">
                {referralStats.referralHistory.map((referral, index) => (
                  <div key={index} className="history-item">
                    <div className="referral-info">
                      <span className="referral-user">User #{referral.referredUserId.substring(0, 8)}</span>
                      <span className="referral-status">
                        {referral.credited ? 'Credited' : 'Pending'}
                      </span>
                    </div>
                    <div className="referral-details">
                      <span className="referral-date">{formatDate(referral.timestamp)}</span>
                      <span className="referral-credits">
                        {referral.credited ? `+${REFERRAL_REWARD}` : '+0'} credits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-history">
                <p>No referrals yet. Start sharing your code to earn credits!</p>
              </div>
            )}
          </div>

          <div className="contribution-history">
            <h3>Contribution History</h3>
            {contributionHistory.length > 0 ? (
              <div className="history-list">
                {contributionHistory.slice(-10).reverse().map((contribution, index) => (
                  <div key={index} className="history-item">
                    <div className="contribution-info">
                      <span className="contribution-type">
                        {contribution.type === 'feedback' ? '📝 Feedback' :
                         contribution.type === 'survey' ? '📊 Survey' : contribution.type}
                      </span>
                      <span
                        className="contribution-status"
                        style={{ color: getStatusColor(contribution.status) }}
                      >
                        {contribution.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="contribution-details">
                      <span className="contribution-date">{formatDate(contribution.timestamp)}</span>
                      <span className="contribution-credits">
                        +{contribution.credits} credits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-history">
                <p>No contributions yet. Start participating to earn credits!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="referral-tips">
        <h3>Maximizing Your Earnings</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h4>Target Active Users</h4>
            <p>Refer friends who are likely to make purchases for faster credit earnings</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">💬</div>
            <h4>Share on Social Media</h4>
            <p>Post your referral link on social platforms to reach more potential users</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔄</div>
            <h4>Stay Active</h4>
            <p>Regular participation in surveys and feedback helps you earn consistent credits</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem;