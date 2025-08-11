import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../styles/refactored-dashboard.css';

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      allowMessages: true
    },
    preferences: {
      theme: 'dark',
      language: 'en'
    }
  });
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
          
          // Load user settings if they exist
          if (userData.settings) {
            setSettings(prev => ({
              ...prev,
              ...userData.settings
            }));
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        settings: settings,
        updatedAt: new Date().toISOString()
      });
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    return userProfile?.displayName || user?.displayName || userProfile?.email?.split('@')[0] || 'User';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="section-content">
      <div className="settings-page">
        <div className="section-header">
          <h2>Settings</h2>
          <p>Configure your account settings and preferences</p>
        </div>

        <div className="settings-sections">
          {/* Account Information */}
          <div className="settings-section">
            <h3>Account Information</h3>
            <div className="account-info">
              <div className="info-item">
                <label>Display Name:</label>
                <span>{getDisplayName()}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span className="role-badge">{userProfile?.role || 'User'}</span>
              </div>
              <div className="info-item">
                <label>Member Since:</label>
                <span>
                  {userProfile?.createdAt 
                    ? new Date(userProfile.createdAt).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h3>Notification Preferences</h3>
            <div className="settings-options">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Notifications</h4>
                  <p>Receive notifications via email</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Push Notifications</h4>
                  <p>Receive push notifications in your browser</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Marketing Emails</h4>
                  <p>Receive promotional emails and updates</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.marketing}
                    onChange={(e) => handleSettingChange('notifications', 'marketing', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="settings-section">
            <h3>Privacy Settings</h3>
            <div className="settings-options">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Profile Visibility</h4>
                  <p>Make your profile visible to other users</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.privacy.profileVisible}
                    onChange={(e) => handleSettingChange('privacy', 'profileVisible', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Show Email Address</h4>
                  <p>Display your email on your public profile</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showEmail}
                    onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Allow Messages</h4>
                  <p>Allow other users to send you messages</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.privacy.allowMessages}
                    onChange={(e) => handleSettingChange('privacy', 'allowMessages', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="settings-section">
            <h3>Preferences</h3>
            <div className="settings-options">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Theme</h4>
                  <p>Choose your preferred theme</p>
                </div>
                <select
                  value={settings.preferences.theme}
                  onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                  className="setting-select"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Language</h4>
                  <p>Choose your preferred language</p>
                </div>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                  className="setting-select"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button 
            className="btn-primary"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;