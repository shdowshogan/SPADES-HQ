import React, { useMemo } from 'react';
import { useGame } from '../context/useGame';

export const Dashboard = () => {
  const { gameHistory, players, activeGame } = useGame();

  const renderAvatar = (player, className = 'dashboard-avatar') => {
    const looksLikeImage = typeof player.avatar === 'string' && (player.avatar.includes('/') || player.avatar.includes('.'));

    if (looksLikeImage) {
      return <img src={player.avatar} alt={player.name} className={className} />;
    }

    return <span className={`${className} dashboard-avatar-fallback`}>{player.avatar || '🙂'}</span>;
  };

  const playerDirectory = useMemo(() => {
    return players.reduce((accumulator, player) => {
      accumulator[player.id] = player;
      return accumulator;
    }, {});
  }, [players]);

  const dashboardData = useMemo(() => {
    const totalGames = gameHistory.length;
    const totalRounds = gameHistory.reduce(
      (accumulator, game) => accumulator + (game.rounds?.length || 0),
      0
    );
    const tieGames = gameHistory.filter((game) => game.winner === 'tie').length;
    const averageRoundsPerGame = totalGames > 0 ? (totalRounds / totalGames).toFixed(1) : '0.0';

    const stats = players
      .map((player) => {
        let wins = 0;
        let gamesPlayed = 0;
        let totalBags = 0;

        gameHistory.forEach((game) => {
          const inTeam1 = game.team1.players.includes(player.id);
          const inTeam2 = game.team2.players.includes(player.id);

          if (!inTeam1 && !inTeam2) return;

          gamesPlayed += 1;
          if ((inTeam1 && game.winner === 'team1') || (inTeam2 && game.winner === 'team2')) {
            wins += 1;
          }

          totalBags += inTeam1 ? game.team1.totalBags : game.team2.totalBags;
        });

        return {
          ...player,
          wins,
          totalBags,
          gamesPlayed,
          losses: Math.max(gamesPlayed - wins, 0),
          winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
        };
      })
      .sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.gamesPlayed - a.gamesPlayed;
      });

    const getTeamKey = (playerIds) => [...playerIds].sort().join('|');
    const teamWinMap = {};

    gameHistory.forEach((game) => {
      if (game.winner === 'tie') return;

      const winningPlayers = game.winner === 'team1' ? game.team1.players : game.team2.players;
      if (!Array.isArray(winningPlayers) || winningPlayers.length === 0) return;

      const normalizedPlayerIds = [...winningPlayers].sort();
      const key = getTeamKey(normalizedPlayerIds);

      if (!teamWinMap[key]) {
        teamWinMap[key] = {
          playerIds: normalizedPlayerIds,
          wins: 0,
        };
      }

      teamWinMap[key].wins += 1;
    });

    const mostWinningTeamOverall = Object.values(teamWinMap).reduce(
      (best, current) => (current.wins > (best?.wins || 0) ? current : best),
      null
    );

    let mostWinningTeam = mostWinningTeamOverall;

    if (activeGame?.team1?.players?.length && activeGame?.team2?.players?.length) {
      const activeTeam1Ids = [...activeGame.team1.players];
      const activeTeam2Ids = [...activeGame.team2.players];
      const activeTeam1Key = getTeamKey(activeTeam1Ids);
      const activeTeam2Key = getTeamKey(activeTeam2Ids);

      const activeTeam1Wins = teamWinMap[activeTeam1Key]?.wins || 0;
      const activeTeam2Wins = teamWinMap[activeTeam2Key]?.wins || 0;

      if (activeTeam1Wins > 0 || activeTeam2Wins > 0) {
        mostWinningTeam = activeTeam1Wins >= activeTeam2Wins
          ? { playerIds: [...activeTeam1Ids].sort(), wins: activeTeam1Wins }
          : { playerIds: [...activeTeam2Ids].sort(), wins: activeTeam2Wins };
      }
    }

    const recentGames = gameHistory.slice(0, 8).map((game) => {
      const team1Names = game.team1.players
        .map((id) => playerDirectory[id])
        .filter(Boolean)
        .map((player) => player.name)
        .join(' · ');

      const team2Names = game.team2.players
        .map((id) => playerDirectory[id])
        .filter(Boolean)
        .map((player) => player.name)
        .join(' · ');

      return {
        ...game,
        team1Names: team1Names || 'Unknown players',
        team2Names: team2Names || 'Unknown players',
        scoreGap: Math.abs((game.team1.totalScore || 0) - (game.team2.totalScore || 0)),
      };
    });

    return {
      totalGames,
      totalRounds,
      tieGames,
      averageRoundsPerGame,
      recentGames,
      playerStats: stats,
      topPlayers: stats.filter((player) => player.gamesPlayed > 0).slice(0, 5),
      mostWinningTeam,
    };
  }, [gameHistory, players, playerDirectory, activeGame]);

  const hasGames = dashboardData.totalGames > 0;
  const hasPlayerStats = dashboardData.playerStats.some((player) => player.gamesPlayed > 0);

  return (
    <div className="animate-enter dashboard-shell">
      <div className="dashboard-metrics">
        <div className="glass-panel dashboard-metric-card">
          <p className="dashboard-metric-label">Total Games</p>
          <p className="dashboard-metric-value">{dashboardData.totalGames}</p>
          <p className="dashboard-metric-note">Completed matchups tracked</p>
        </div>

        <div className="glass-panel dashboard-metric-card">
          <p className="dashboard-metric-label">Total Rounds</p>
          <p className="dashboard-metric-value" style={{ color: 'var(--neon-pink)' }}>
            {dashboardData.totalRounds}
          </p>
          <p className="dashboard-metric-note">Avg {dashboardData.averageRoundsPerGame} rounds/game</p>
        </div>

        <div className="glass-panel dashboard-metric-card">
          <p className="dashboard-metric-label">Ties</p>
          <p className="dashboard-metric-value" style={{ color: 'var(--neon-yellow)' }}>
            {dashboardData.tieGames}
          </p>
          <p className="dashboard-metric-note">Games ending level</p>
        </div>

        <div className="glass-panel dashboard-metric-card">
          <p className="dashboard-metric-label">Most Active</p>
          {dashboardData.mostWinningTeam ? (
            <div className="dashboard-most-active">
              {dashboardData.mostWinningTeam.playerIds.map((id) => {
                const player = playerDirectory[id];
                if (!player) return null;

                return (
                  <div key={id} className="dashboard-most-active-player">
                    {renderAvatar(player, 'dashboard-avatar dashboard-avatar-lg')}
                    <span className="dashboard-most-active-name">{player.name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="dashboard-metric-value" style={{ color: 'var(--neon-green)', fontSize: '2rem' }}>
              —
            </p>
          )}
          <p className="dashboard-metric-note">
            {dashboardData.mostWinningTeam ? `${dashboardData.mostWinningTeam.wins} wins together` : 'No activity yet'}
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--neon-yellow)' }}>🏆 Leaderboard</h3>
          {hasPlayerStats ? (
            <div className="dashboard-list">
              {dashboardData.topPlayers.map((player, index) => (
                <div className="dashboard-list-item" key={player.id}>
                  <div className="dashboard-list-identity">
                    <span className="badge badge-blue">#{index + 1}</span>
                    <span className="dashboard-list-identity">
                      {renderAvatar(player)}
                      <span>{player.name}</span>
                    </span>
                  </div>
                  <span className="badge badge-pink">{player.winRate}% · {player.wins}W-{player.losses}L</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Play a few games to populate the leaderboard.</p>
          )}
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--neon-blue)' }}>📈 Win Rate</h3>
          {hasPlayerStats ? (
            <div className="dashboard-chart">
              {dashboardData.playerStats
                .filter((player) => player.gamesPlayed > 0)
                .map((player) => (
                  <div key={player.id}>
                    <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        {renderAvatar(player)}
                        <span>{player.name} ({player.gamesPlayed} games)</span>
                      </span>
                      <span>{player.winRate}%</span>
                    </div>
                    <div className="dashboard-progress-track">
                      <div className="dashboard-progress-fill" style={{ width: `${player.winRate}%` }} />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No completed games yet.</p>
          )}
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.5rem' }}>📜 Recent Games</h3>
        {!hasGames ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            No games finished yet. Start one from the Play tab.
          </p>
        ) : (
          <div className="dashboard-history-list">
            {dashboardData.recentGames.map((game) => (
              <div key={game.id} className="glass-panel dashboard-history-card">
                <div
                  className="dashboard-winner-rail"
                  style={{
                    background:
                      game.winner === 'team1'
                        ? 'var(--neon-blue)'
                        : game.winner === 'team2'
                          ? 'var(--neon-pink)'
                          : 'var(--text-muted)',
                  }}
                />

                <div className="flex-between" style={{ marginBottom: '1rem', gap: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(game.endTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    {game.winner === 'tie'
                      ? 'Tie Game'
                      : game.winner === 'team1'
                        ? `${game.team1.name} won`
                        : `${game.team2.name} won`}
                  </span>
                </div>

                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="dashboard-team-block" style={{ opacity: game.winner === 'team1' || game.winner === 'tie' ? 1 : 0.65 }}>
                    <div className="flex-between">
                      <strong style={{ color: 'var(--neon-blue)' }}>{game.team1.name}</strong>
                      <strong>{game.team1.totalScore} pts</strong>
                    </div>
                    <p className="dashboard-team-meta">{game.team1.totalBags} bags · {game.team1Names}</p>
                  </div>

                  <div className="dashboard-team-block" style={{ opacity: game.winner === 'team2' || game.winner === 'tie' ? 1 : 0.65 }}>
                    <div className="flex-between">
                      <strong style={{ color: 'var(--neon-pink)' }}>{game.team2.name}</strong>
                      <strong>{game.team2.totalScore} pts</strong>
                    </div>
                    <p className="dashboard-team-meta">{game.team2.totalBags} bags · {game.team2Names}</p>
                  </div>
                </div>

                <p className="dashboard-score-gap">Score gap: {game.scoreGap} pts</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
