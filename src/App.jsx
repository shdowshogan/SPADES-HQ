import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { useGame } from './context/useGame';
import { PlayerProfiles } from './components/PlayerProfiles';
import { GameSetup } from './components/GameSetup';
import { ActiveGame } from './components/ActiveGame';
import { Dashboard } from './components/Dashboard';

const AUTH_STORAGE_KEY = 'spades_admin_authenticated';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

const MainApp = ({ onLogout }) => {
  const { activeGame } = useGame();
  
  // Tabs: 'dashboard', 'play', 'players'
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Header / Navigation */}
      <header className="glass-panel" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        padding: '1rem 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🃏</span>
          <h1 className="title-glow" style={{ margin: 0, fontSize: '2rem' }}>Spades HQ</h1>
        </div>
        
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          
          <button 
            className={`btn ${activeTab === 'play' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('play')}
          >
            {activeGame ? '⚔️ Active Game' : '🎮 New Game'}
          </button>
          
          <button 
            className={`btn ${activeTab === 'players' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            👥 Players
          </button>

          <button className="btn btn-danger" onClick={onLogout}>
            🚪 Logout
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'play' && (activeGame ? <ActiveGame /> : <GameSetup />)}
        {activeTab === 'players' && <PlayerProfiles />}
      </main>

    </div>
  );
};

const AdminLogin = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      onAuthenticated();
      return;
    }

    setError('Invalid admin password');
  };

  return (
    <div className="auth-shell">
      <div className="glass-panel auth-card animate-enter">
        <h1 className="title-glow" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Spades HQ</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Admin access required</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            className="input-glass"
            placeholder="Enter admin password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError('');
            }}
          />

          {error && <p style={{ color: '#ff6b8a', fontSize: '0.85rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary">Unlock Portal</button>
        </form>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <GameProvider>
      <MainApp onLogout={handleLogout} />
    </GameProvider>
  );
}

export default App;
