import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { useGame } from './context/useGame';
import { PlayerProfiles } from './components/PlayerProfiles';
import { GameSetup } from './components/GameSetup';
import { ActiveGame } from './components/ActiveGame';
import { Dashboard } from './components/Dashboard';

const MainApp = () => {
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

function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}

export default App;
