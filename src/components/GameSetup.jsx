import React, { useMemo, useState } from 'react';
import { useGame } from '../context/useGame';

export const GameSetup = () => {
  const { players, startGame } = useGame();
  const [team1Name, setTeam1Name] = useState('Team Alpha');
  const [team2Name, setTeam2Name] = useState('Team Beta');
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [draggedPlayerId, setDraggedPlayerId] = useState(null);

  const playerById = useMemo(
    () => players.reduce((accumulator, player) => {
      accumulator[player.id] = player;
      return accumulator;
    }, {}),
    [players]
  );

  const availablePlayers = useMemo(
    () => players.filter((player) => !team1Players.includes(player.id) && !team2Players.includes(player.id)),
    [players, team1Players, team2Players]
  );

  const isValid = team1Players.length === 2 && team2Players.length === 2;

  const handleStart = () => {
    if (isValid) {
      startGame(
        team1Name,
        team1Players,
        team2Name,
        team2Players
      );
    }
  };

  const removeFromTeams = (playerId) => {
    setTeam1Players((previous) => previous.filter((id) => id !== playerId));
    setTeam2Players((previous) => previous.filter((id) => id !== playerId));
  };

  const handleDropToPool = () => {
    if (!draggedPlayerId) return;
    removeFromTeams(draggedPlayerId);
    setDraggedPlayerId(null);
  };

  const handleDropToTeam = (team) => {
    if (!draggedPlayerId) return;

    const playerId = draggedPlayerId;

    if (team === 'team1') {
      setTeam1Players((previous) => {
        if (previous.includes(playerId)) return previous;
        if (previous.length >= 2) return previous;
        return [...previous, playerId];
      });
      setTeam2Players((previous) => previous.filter((id) => id !== playerId));
    } else {
      setTeam2Players((previous) => {
        if (previous.includes(playerId)) return previous;
        if (previous.length >= 2) return previous;
        return [...previous, playerId];
      });
      setTeam1Players((previous) => previous.filter((id) => id !== playerId));
    }

    setDraggedPlayerId(null);
  };

  const renderAvatar = (player, className = 'setup-avatar') => {
    const looksLikeImage = typeof player.avatar === 'string' && (player.avatar.includes('/') || player.avatar.includes('.'));

    if (looksLikeImage) {
      return <img src={player.avatar} alt={player.name} className={className} />;
    }

    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {player.avatar || '🙂'}
      </span>
    );
  };

  return (
    <div className="glass-panel animate-enter game-setup-shell">
      <h2 className="title-glow">New Game Setup</h2>

      {players.length < 4 ? (
        <div className="glass-panel" style={{ textAlign: 'center', width: '100%' }}>
          <h3 style={{ color: 'var(--neon-pink)' }}>Need 4 players</h3>
          <p>Add at least four players to start.</p>
        </div>
      ) : (
        <>
          <div className="grid-2 game-setup-teams">
            <div className="glass-panel game-setup-team">
              <input
                type="text"
                className="input-glass game-setup-team-name"
                value={team1Name}
                onChange={(event) => setTeam1Name(event.target.value)}
                placeholder="Team 1 Name"
              />
              <div
                className="game-setup-selected-list game-drop-zone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDropToTeam('team1')}
              >
                {team1Players.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Drag 2 players here</p>
                ) : (
                  team1Players.map((id) => {
                    const player = playerById[id];
                    if (!player) return null;

                    return (
                      <div
                        className="game-setup-selected-player"
                        key={id}
                        draggable
                        onDragStart={() => setDraggedPlayerId(id)}
                        onDragEnd={() => setDraggedPlayerId(null)}
                      >
                        {renderAvatar(player, 'setup-avatar large')}
                        <span className="game-setup-player-name">{player.name}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="glass-panel game-setup-team">
              <input
                type="text"
                className="input-glass game-setup-team-name"
                value={team2Name}
                onChange={(event) => setTeam2Name(event.target.value)}
                placeholder="Team 2 Name"
              />
              <div
                className="game-setup-selected-list game-drop-zone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDropToTeam('team2')}
              >
                {team2Players.map((id) => {
                  const player = playerById[id];
                  if (!player) return null;

                  return (
                    <div
                      className="game-setup-selected-player"
                      key={id}
                      draggable
                      onDragStart={() => setDraggedPlayerId(id)}
                      onDragEnd={() => setDraggedPlayerId(null)}
                    >
                      {renderAvatar(player, 'setup-avatar large')}
                      <span className="game-setup-player-name">{player.name}</span>
                    </div>
                  );
                })}
                {team2Players.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Drag 2 players here</p>}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Drag players from pool or other team.
              </p>
            </div>
          </div>

          <h3 style={{ marginBottom: '0.75rem' }}>Player Pool</h3>

          <div
            className="game-setup-picker-grid game-drop-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDropToPool}
          >
            {availablePlayers.length === 0 ? (
              <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>All players assigned. Drag a player here to remove from team.</p>
              </div>
            ) : (
              availablePlayers.map((player) => (
                <div
                  key={player.id}
                  className="game-setup-player-card"
                  draggable
                  onDragStart={() => setDraggedPlayerId(player.id)}
                  onDragEnd={() => setDraggedPlayerId(null)}
                >
                  {renderAvatar(player, 'setup-avatar large')}
                  <span className="game-setup-player-name">{player.name}</span>
                </div>
              ))
            )}
          </div>

          <div className="flex-center" style={{ marginTop: '2rem' }}>
            <button
              className="btn btn-primary"
              style={{ fontSize: '1.15rem', padding: '0.9rem 2.5rem' }}
              disabled={!isValid}
              onClick={handleStart}
            >
              {isValid ? 'Start Game 🃏' : 'Drag 2 players to each team'}
            </button>
          </div>
        </>
      )}

    </div>
  );
};
