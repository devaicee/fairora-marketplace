import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './components/HomePage'
import Signup from './routes/Signup'
import Login from './routes/Login'
import CreatorForm from './routes/CreatorForm'
import Dashboard from './routes/Dashboard'
import EnhancedDashboard from './routes/EnhancedDashboard'
import UserDashboard from './routes/UserDashboard'
import ImprovedDashboard from './routes/ImprovedDashboard'
import RefactoredDashboard from './routes/RefactoredDashboard'
import ProfilePage from './routes/ProfilePage'
import SettingsPage from './routes/SettingsPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/creator-form" element={
            <ProtectedRoute requireCreator={true}>
              <CreatorForm />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <EnhancedDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard" element={
            <ProtectedRoute>
              <ImprovedDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <EnhancedDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/trending" element={
            <ProtectedRoute>
              <EnhancedDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/rankings" element={
            <ProtectedRoute>
              <EnhancedDashboard />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/wallet" element={
            <ProtectedRoute>
              <EnhancedDashboard />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <EnhancedDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
