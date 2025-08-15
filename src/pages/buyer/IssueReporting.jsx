import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import '../../styles/issue-reporting.css';

const IssueReporting = () => {
  const [issueType, setIssueType] = useState('product');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userIssues, setUserIssues] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadUserData();
    loadUserIssues();
  }, []);

  const loadUserData = async () => {
    if (auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPurchaseHistory(userData.purchaseHistory || []);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  };

  const loadUserIssues = async () => {
    if (auth.currentUser) {
      try {
        const issuesQuery = query(
          collection(db, 'issues'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc')
        );
        const issuesSnapshot = await getDocs(issuesQuery);
        const issuesData = issuesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserIssues(issuesData);
      } catch (error) {
        console.error('Error loading user issues:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      setMessage({ text: 'Please fill in all required fields', type: 'error' });
      return;
    }

    if (issueType === 'product' && !productId.trim()) {
      setMessage({ text: 'Please select a product for product-related issues', type: 'error' });
      return;
    }

    if (issueType === 'transaction' && !transactionId.trim()) {
      setMessage({ text: 'Please provide a transaction ID for transaction-related issues', type: 'error' });
      return;
    }

    setSubmitting(true);

    try {
      const issueDoc = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || 'Anonymous User',
        type: issueType,
        subject: subject.trim(),
        description: description.trim(),
        productId: issueType === 'product' ? productId.trim() : null,
        transactionId: issueType === 'transaction' ? transactionId.trim() : null,
        priority: priority,
        status: 'open',
        timestamp: new Date().toISOString(),
        adminResponse: null,
        lastUpdated: new Date().toISOString()
      };

      await addDoc(collection(db, 'issues'), issueDoc);
      
      setMessage({ text: 'Issue reported successfully! Our team will review it shortly.', type: 'success' });
      
      setSubject('');
      setDescription('');
      setProductId('');
      setTransactionId('');
      setPriority('medium');
      setIssueType('product');
      
      await loadUserIssues();

    } catch (error) {
      console.error('Error submitting issue:', error);
      setMessage({ text: 'Error submitting issue. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': '#f59e0b',
      'in-progress': '#3b82f6',
      'resolved': '#10b981',
      'closed': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444',
      'urgent': '#dc2626'
    };
    return colors[priority] || '#6b7280';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const issueTypes = [
    { value: 'product', label: 'Product Issue' },
    { value: 'transaction', label: 'Transaction Issue' },
    { value: 'technical', label: 'Technical Problem' },
    { value: 'account', label: 'Account Issue' },
    { value: 'billing', label: 'Billing/Credits Issue' },
    { value: 'abuse', label: 'Report Abuse' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <div className="issue-reporting">
      <div className="issue-header">
        <h1>Report an Issue</h1>
        <p>Having trouble? Let us know and we'll help you resolve it.</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="issue-content">
        <div className="issue-form-section">
          <form onSubmit={handleSubmit} className="issue-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="issueType">Issue Type *</label>
                <select
                  id="issueType"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="form-select"
                  required
                >
                  {issueTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-select"
                >
                  {priorities.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {issueType === 'product' && (
              <div className="form-group">
                <label htmlFor="productId">Related Product</label>
                <div className="product-select-wrapper">
                  <select
                    id="productId"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="form-select"
                    required={issueType === 'product'}
                  >
                    <option value="">Select a product you purchased</option>
                    {purchaseHistory.map((purchase, index) => (
                      <option key={index} value={purchase.productId}>
                        {purchase.productTitle} - {new Date(purchase.timestamp).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="view-history-btn"
                  >
                    {showHistory ? 'Hide' : 'View'} Purchase History
                  </button>
                </div>
                
                {showHistory && purchaseHistory.length > 0 && (
                  <div className="purchase-history">
                    <h4>Your Purchase History:</h4>
                    <div className="purchase-list">
                      {purchaseHistory.map((purchase, index) => (
                        <div key={index} className="purchase-item">
                          <span className="purchase-title">{purchase.productTitle}</span>
                          <span className="purchase-date">
                            {new Date(purchase.timestamp).toLocaleDateString()}
                          </span>
                          <span className="purchase-price">
                            {purchase.price > 0 ? `${purchase.price} credits` : 'Free'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {issueType === 'transaction' && (
              <div className="form-group">
                <label htmlFor="transactionId">Transaction ID</label>
                <input
                  type="text"
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID or reference number"
                  className="form-input"
                  required={issueType === 'transaction'}
                />
                <small className="form-hint">
                  You can find the transaction ID in your transaction history
                </small>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Detailed Description *</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide as much detail as possible about the issue, including steps to reproduce if applicable..."
                className="form-textarea"
                rows="6"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="submit-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </form>
        </div>

        <div className="issue-history-section">
          <h3>Your Recent Issues</h3>
          {userIssues.length > 0 ? (
            <div className="issues-list">
              {userIssues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="issue-item">
                  <div className="issue-header-item">
                    <h4>{issue.subject}</h4>
                    <div className="issue-badges">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(issue.status) }}
                      >
                        {issue.status.toUpperCase()}
                      </span>
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(issue.priority) }}
                      >
                        {issue.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="issue-details">
                    <p className="issue-type">Type: {issue.type}</p>
                    <p className="issue-date">Submitted: {formatDate(issue.timestamp)}</p>
                    {issue.lastUpdated !== issue.timestamp && (
                      <p className="issue-updated">Updated: {formatDate(issue.lastUpdated)}</p>
                    )}
                  </div>

                  {issue.adminResponse && (
                    <div className="admin-response">
                      <h5>Admin Response:</h5>
                      <p>{issue.adminResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-issues">
              <p>No issues reported yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="help-section">
        <h3>Before Reporting an Issue</h3>
        <div className="help-tips">
          <div className="help-tip">
            <h4>🔍 Check Common Issues</h4>
            <p>Many issues have simple solutions. Check our FAQ or try refreshing the page.</p>
          </div>
          <div className="help-tip">
            <h4>📧 Provide Details</h4>
            <p>The more information you provide, the faster we can help you resolve the issue.</p>
          </div>
          <div className="help-tip">
            <h4>⚡ Response Times</h4>
            <p>We typically respond within 24-48 hours. Urgent issues are prioritized.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueReporting;