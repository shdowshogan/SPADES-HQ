import React, { useState } from 'react';
import { useGame } from '../context/useGame';

export const ActiveGame = () => {
  const { activeGame, players, addRound, deleteRound, updateRound, endGame } = useGame();
  const [t1Points, setT1Points] = useState('');
  const [t1Bags, setT1Bags] = useState('');
  const [t2Points, setT2Points] = useState('');
  const [t2Bags, setT2Bags] = useState('');
  const [editingRoundId, setEditingRoundId] = useState(null);
  const [roundEditForm, setRoundEditForm] = useState({
    team1Points: '',
    team1Bags: '',
    team2Points: '',
    team2Bags: '',
  });

  if (!activeGame) return null;

  const handleLogRound = (e) => {
    e.preventDefault();
    if (t1Points === '' || t2Points === '') return;

    addRound(
      parseInt(t1Points, 10),
      parseInt(t1Bags, 10) || 0,
      parseInt(t2Points, 10),
      parseInt(t2Bags, 10) || 0
    );

    setT1Points('');
    setT1Bags('');
    setT2Points('');
    setT2Bags('');
  };

  const { team1, team2, rounds } = activeGame;

  const playerById = players.reduce((accumulator, player) => {
    accumulator[player.id] = player;
    return accumulator;
  }, {});

  const renderTeamAvatars = (teamPlayerIds, accentClass) => {
    return (
      <div className="active-team-avatars">
        {teamPlayerIds.map((id) => {
          const player = playerById[id];
          if (!player) return null;

          return <img key={id} src={player.avatar} alt={player.name} className={`active-team-avatar ${accentClass}`} />;
        })}
      </div>
    );
  };

  const startRoundEdit = (round) => {
    setEditingRoundId(round.id);
    setRoundEditForm({
      team1Points: String(round.team1Points),
      team1Bags: String(round.team1Bags),
      team2Points: String(round.team2Points),
      team2Bags: String(round.team2Bags),
    });
  };

  const cancelRoundEdit = () => {
    setEditingRoundId(null);
    setRoundEditForm({
      team1Points: '',
      team1Bags: '',
      team2Points: '',
      team2Bags: '',
    });
  };

  const saveRoundEdit = () => {
    if (!editingRoundId) return;
    if (roundEditForm.team1Points === '' || roundEditForm.team2Points === '') return;

    updateRound(
      editingRoundId,
      parseInt(roundEditForm.team1Points, 10),
      parseInt(roundEditForm.team1Bags, 10) || 0,
      parseInt(roundEditForm.team2Points, 10),
      parseInt(roundEditForm.team2Bags, 10) || 0
    );

    cancelRoundEdit();
  };

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
      <div className="grid-2" style={{ width: '100%', maxWidth: '1100px' }}>
        <div className="glass-panel" style={{ border: '2px solid var(--neon-blue)', textAlign: 'center' }}>
          <div className="active-team-header">
            {renderTeamAvatars(team1.players, 'blue')}
          </div>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--neon-blue)', textShadow: '0 0 20px var(--neon-blue)' }}>
            {team1.totalScore}
          </div>
          <div style={{ color: 'var(--text-muted)' }}>Bags: {team1.totalBags}</div>

          <div className="active-round-entry">
            <h4>{team1.name}</h4>
            <div className="active-round-fields">
              <label>
                <span>Points</span>
                <input
                  type="number"
                  className="input-glass no-spinner"
                  value={t1Points}
                  onChange={(event) => setT1Points(event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Bags</span>
                <input
                  type="number"
                  className="input-glass no-spinner"
                  value={t1Bags}
                  onChange={(event) => setT1Bags(event.target.value)}
                  min="0"
                  max="13"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ border: '2px solid var(--neon-pink)', textAlign: 'center' }}>
          <div className="active-team-header">
            {renderTeamAvatars(team2.players, 'pink')}
          </div>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--neon-pink)', textShadow: '0 0 20px var(--neon-pink)' }}>
            {team2.totalScore}
          </div>
          <div style={{ color: 'var(--text-muted)' }}>Bags: {team2.totalBags}</div>

          <div className="active-round-entry">
            <h4>{team2.name}</h4>
            <div className="active-round-fields">
              <label>
                <span>Points</span>
                <input
                  type="number"
                  className="input-glass no-spinner"
                  value={t2Points}
                  onChange={(event) => setT2Points(event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Bags</span>
                <input
                  type="number"
                  className="input-glass no-spinner"
                  value={t2Bags}
                  onChange={(event) => setT2Bags(event.target.value)}
                  min="0"
                  max="13"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '1100px' }}>
        <form onSubmit={handleLogRound} className="flex-center">
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 3rem', fontSize: '1.25rem' }}>
            Log Round 📝
          </button>
        </form>
      </div>

      {rounds.length > 0 && (
        <div className="glass-panel" style={{ width: '100%', maxWidth: '1100px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Round History</h3>
          <div className="round-history-list">
            {rounds.map((round, index) => (
              <div key={round.id} className="glass-panel round-history-row">
                <div className="round-history-main">
                  <span className="round-history-index">Round {index + 1}</span>

                  <div className="round-history-badges">
                    <div className="badge badge-blue round-history-stat">
                      {editingRoundId === round.id ? (
                        <div className="round-history-inline-edit">
                          <label>
                            <span>Points</span>
                            <input
                              type="number"
                              className="input-glass no-spinner"
                              value={roundEditForm.team1Points}
                              onChange={(event) => setRoundEditForm((previous) => ({ ...previous, team1Points: event.target.value }))}
                            />
                          </label>
                          <label>
                            <span>Bags</span>
                            <input
                              type="number"
                              className="input-glass no-spinner"
                              value={roundEditForm.team1Bags}
                              onChange={(event) => setRoundEditForm((previous) => ({ ...previous, team1Bags: event.target.value }))}
                            />
                          </label>
                        </div>
                      ) : (
                        `${round.team1Points} pts (${round.team1Bags} bags)`
                      )}
                    </div>
                    <div className="badge badge-pink round-history-stat">
                      {editingRoundId === round.id ? (
                        <div className="round-history-inline-edit">
                          <label>
                            <span>Points</span>
                            <input
                              type="number"
                              className="input-glass no-spinner"
                              value={roundEditForm.team2Points}
                              onChange={(event) => setRoundEditForm((previous) => ({ ...previous, team2Points: event.target.value }))}
                            />
                          </label>
                          <label>
                            <span>Bags</span>
                            <input
                              type="number"
                              className="input-glass no-spinner"
                              value={roundEditForm.team2Bags}
                              onChange={(event) => setRoundEditForm((previous) => ({ ...previous, team2Bags: event.target.value }))}
                            />
                          </label>
                        </div>
                      ) : (
                        `${round.team2Points} pts (${round.team2Bags} bags)`
                      )}
                    </div>
                  </div>
                </div>

                <div className="round-history-actions">
                  <button
                    className="btn round-history-action-btn"
                    onClick={() => {
                      if (editingRoundId === round.id) {
                        saveRoundEdit();
                      } else {
                        startRoundEdit(round);
                      }
                    }}
                    title={editingRoundId === round.id ? 'Save Round' : 'Edit Round'}
                  >
                    {editingRoundId === round.id ? 'Save' : 'Edit'}
                  </button>
                  <button
                    className="btn btn-danger round-history-action-btn"
                    onClick={() => deleteRound(round.id)}
                    title="Delete Round"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-center" style={{ marginTop: '2rem' }}>
        <button className="btn btn-danger" onClick={() => {
          if (window.confirm("Are you sure you want to finish this game?")) {
            endGame();
          }
        }}>
          Finish Game 🏁
        </button>
      </div>
    </div>
  );
};
