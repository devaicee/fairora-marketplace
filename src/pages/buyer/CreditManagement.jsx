import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import '../../styles/credit-management.css';

const CreditManagement = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientUserId, setRecipientUserId] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [transactionHistory, setTransactionHistory] = useState([]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile(userData);
            setCredits(userData.credits || 0);
            await loadTransactionHistory();
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setMessage({ text: 'Error loading profile', type: 'error' });
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserProfile();
  }, []);

  const loadTransactionHistory = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setTransactionHistory(userData.transactionHistory || []);
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
    }
  };

  const validateRecipient = async (userId) => {
    try {
      const recipientDoc = await getDoc(doc(db, 'users', userId));
      return recipientDoc.exists();
    } catch (error) {
      return false;
    }
  };

  const handleCreditTransfer = async (e) => {
    e.preventDefault();
    
    if (!transferAmount || !recipientUserId) {
      setMessage({ text: 'Please fill in all fields', type: 'error' });
      return;
    }

    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }

    if (amount > credits) {
      setMessage({ text: 'Insufficient credits', type: 'error' });
      return;
    }

    if (recipientUserId === auth.currentUser.uid) {
      setMessage({ text: 'Cannot transfer credits to yourself', type: 'error' });
      return;
    }

    setTransferLoading(true);

    try {
      const recipientExists = await validateRecipient(recipientUserId);
      if (!recipientExists) {
        setMessage({ text: 'Recipient user not found', type: 'error' });
        setTransferLoading(false);
        return;
      }

      await runTransaction(db, async (transaction) => {
        const senderRef = doc(db, 'users', auth.currentUser.uid);
        const recipientRef = doc(db, 'users', recipientUserId);
        
        const senderDoc = await transaction.get(senderRef);
        const recipientDoc = await transaction.get(recipientRef);
        
        if (!senderDoc.exists() || !recipientDoc.exists()) {
          throw new Error('User documents do not exist');
        }
        
        const senderData = senderDoc.data();
        const recipientData = recipientDoc.data();
        
        if ((senderData.credits || 0) < amount) {
          throw new Error('Insufficient credits');
        }
        
        const newSenderCredits = (senderData.credits || 0) - amount;
        const newRecipientCredits = (recipientData.credits || 0) + amount;
        
        const transactionRecord = {
          id: Date.now().toString(),
          type: 'transfer',
          amount: amount,
          fromUserId: auth.currentUser.uid,
          toUserId: recipientUserId,
          timestamp: new Date().toISOString(),
          description: `Credit transfer to ${recipientUserId}`
        };

        const recipientTransaction = {
          id: Date.now().toString() + '_received',
          type: 'received',
          amount: amount,
          fromUserId: auth.currentUser.uid,
          toUserId: recipientUserId,
          timestamp: new Date().toISOString(),
          description: `Credits received from ${auth.currentUser.uid}`
        };
        
        transaction.update(senderRef, {
          credits: newSenderCredits,
          transactionHistory: [...(senderData.transactionHistory || []), transactionRecord]
        });
        
        transaction.update(recipientRef, {
          credits: newRecipientCredits,
          transactionHistory: [...(recipientData.transactionHistory || []), recipientTransaction]
        });
      });
      
      setCredits(credits - amount);
      setTransferAmount('');
      setRecipientUserId('');
      setMessage({ text: 'Credits transferred successfully!', type: 'success' });
      await loadTransactionHistory();
      
    } catch (error) {
      console.error('Transfer error:', error);
      setMessage({ text: error.message || 'Transfer failed', type: 'error' });
    } finally {
      setTransferLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="credit-loading">Loading credit information...</div>;
  }

  return (
    <div className="credit-management">
      <div className="credit-header">
        <h2>Credit Management</h2>
        <div className="current-balance">
          <span className="balance-label">Current Balance:</span>
          <span className="balance-amount">{credits} Credits</span>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="credit-sections">
        <div className="transfer-section">
          <h3>Transfer Credits</h3>
          <form onSubmit={handleCreditTransfer} className="transfer-form">
            <div className="form-group">
              <label htmlFor="recipientId">Recipient User ID:</label>
              <input
                type="text"
                id="recipientId"
                value={recipientUserId}
                onChange={(e) => setRecipientUserId(e.target.value)}
                placeholder="Enter recipient's user ID"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount:</label>
              <input
                type="number"
                id="amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount to transfer"
                min="1"
                max={credits}
                required
              />
            </div>
            <button 
              type="submit" 
              className="transfer-btn"
              disabled={transferLoading}
            >
              {transferLoading ? 'Transferring...' : 'Transfer Credits'}
            </button>
          </form>
        </div>

        <div className="history-section">
          <h3>Transaction History</h3>
          {transactionHistory.length > 0 ? (
            <div className="transaction-list">
              {transactionHistory.slice(-10).reverse().map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className={`transaction-type ${transaction.type}`}>
                      {transaction.type === 'transfer' ? '↗️ Sent' : 
                       transaction.type === 'received' ? '↙️ Received' : 
                       transaction.type === 'purchase' ? '🛒 Purchase' :
                       transaction.type === 'refund' ? '↩️ Refund' : '💰 Earned'}
                    </span>
                    <span className="transaction-amount">
                      {transaction.type === 'transfer' || transaction.type === 'purchase' ? '-' : '+'}
                      {transaction.amount} credits
                    </span>
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-description">{transaction.description}</div>
                    <div className="transaction-date">{formatDate(transaction.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-transactions">
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditManagement;