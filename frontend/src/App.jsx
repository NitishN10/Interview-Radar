import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ProblemDetail from './components/ProblemDetail';

function App() {
  const [user, setUser] = useState(null);
  const [activeProblemId, setActiveProblemId] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Restore session and theme on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('synapse_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedTheme = localStorage.getItem('synapse_theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  // Sync theme with body class list
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('synapse_theme', nextTheme);
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('synapse_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('synapse_user');
    setUser(null);
    setActiveProblemId(null);
  };

  return (
    <div className="app-container">
      {/* Floating theme toggle for non-authenticated pages */}
      {!user && (
        <button 
          className="floating-theme-btn" 
          onClick={toggleTheme}
          title="Toggle Light/Dark Mode"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      )}

      {/* Premium Header Bar */}
      {user && (
        <header className="header">
          <div className="logo-container" onClick={() => setActiveProblemId(null)}>
            <div className="logo-icon">&lt;/&gt;</div>
            <span className="logo-text">INTERVIEW RADAR</span>
          </div>

          <div className="header-user-section">
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme}
              style={{ marginRight: '8px' }}
              title="Toggle Light/Dark Mode"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <div className="user-badge">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user.name}</span>
            </div>
            
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
      )}

      {/* View router */}
      {!user ? (
        <Auth onLoginSuccess={handleLoginSuccess} />
      ) : activeProblemId ? (
        <ProblemDetail
          problemId={activeProblemId}
          userId={user.id}
          onBack={() => setActiveProblemId(null)}
        />
      ) : (
        <Dashboard
          user={user}
          onSelectProblem={(id) => setActiveProblemId(id)}
        />
      )}
    </div>
  );
}

export default App;
