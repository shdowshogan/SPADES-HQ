import React, { useState, useEffect } from 'react';
import { GameContext } from './GameStore';
import { PROFILE_TEMPLATES } from '../data/profileTemplates';

const isImageAvatar = (avatar) => {
  return typeof avatar === 'string' && (avatar.includes('/') || avatar.includes('.'));
};

const getTemplateAvatarByIndex = (index) => {
  if (PROFILE_TEMPLATES.length === 0) return '';
  return PROFILE_TEMPLATES[index % PROFILE_TEMPLATES.length].avatar;
};

const normalizePlayers = (rawPlayers) => {
  if (!Array.isArray(rawPlayers)) return [];

  return rawPlayers.map((player, index) => ({
    ...player,
    avatar: isImageAvatar(player.avatar) ? player.avatar : getTemplateAvatarByIndex(index),
  }));
};

const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
};

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

export const GameProvider = ({ children }) => {
  // --- Persistent State hooks ---
  // If data exists in localStorage, initialize with it
  
  // Players array: { id, name, avatar }
  const [players, setPlayers] = useState(() => {
    const savedPlayers = readStorage('spades_players', null);
    if (Array.isArray(savedPlayers) && savedPlayers.length > 0) {
      return normalizePlayers(savedPlayers);
    }

    return PROFILE_TEMPLATES.map((profile) => ({
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
    }));
  });

  // Active game setup: { id, team1: { name, players: [id1, id2], totalScore }, team2: { name, players: [id3, id4], totalScore }, rounds: [] }
  const [activeGame, setActiveGame] = useState(() => {
    return readStorage('spades_active_game', null);
  });

  // Game History log
  const [gameHistory, setGameHistory] = useState(() => {
    return readStorage('spades_history', []);
  });

  // --- Effects to save state ---
  useEffect(() => {
    writeStorage('spades_players', players);
  }, [players]);

  useEffect(() => {
    writeStorage('spades_active_game', activeGame);
  }, [activeGame]);

  useEffect(() => {
    writeStorage('spades_history', gameHistory);
  }, [gameHistory]);

  // --- Actions ---

  // Profiles
  const addPlayer = (name, avatar) => {
    const normalizedName = name.trim();
    if (!normalizedName) return;

    setPlayers((prev) => {
      const resolvedAvatar = isImageAvatar(avatar) ? avatar : getTemplateAvatarByIndex(prev.length);
      return [...prev, { id: createId(), name: normalizedName, avatar: resolvedAvatar }];
    });
  };

  const deletePlayer = (id) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const updateTeamNames = (team1Name, team2Name) => {
    setActiveGame((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        team1: {
          ...prev.team1,
          name: team1Name.trim() || prev.team1.name,
        },
        team2: {
          ...prev.team2,
          name: team2Name.trim() || prev.team2.name,
        },
      };
    });
  };

  // Game Setup
  const startGame = (team1Name, team1Players, team2Name, team2Players) => {
    const cleanedTeam1Name = team1Name.trim() || 'Team 1';
    const cleanedTeam2Name = team2Name.trim() || 'Team 2';

    const newGame = {
      id: createId(),
      team1: { name: cleanedTeam1Name, players: team1Players, totalScore: 0, totalBags: 0 },
      team2: { name: cleanedTeam2Name, players: team2Players, totalScore: 0, totalBags: 0 },
      rounds: [],
      startTime: new Date().toISOString()
    };
    setActiveGame(newGame);
  };

  const endGame = () => {
    if (!activeGame) return;
    const finishedGame = {
      ...activeGame,
      endTime: new Date().toISOString(),
      winner: activeGame.team1.totalScore > activeGame.team2.totalScore ? 'team1' : 
             (activeGame.team2.totalScore > activeGame.team1.totalScore ? 'team2' : 'tie')
    };
    
    setGameHistory(prev => [finishedGame, ...prev]);
    setActiveGame(null);
  };

  // Round Logging
  const addRound = (team1Points, team1Bags, team2Points, team2Bags) => {
    if (!activeGame) return;
    setActiveGame(prev => {
      const newRound = {
        id: createId(),
        team1Points, team1Bags,
        team2Points, team2Bags
      };
      
      const newRounds = [...prev.rounds, newRound];
      
      return {
        ...prev,
        rounds: newRounds,
        team1: { 
          ...prev.team1, 
          totalScore: prev.team1.totalScore + team1Points,
          totalBags: prev.team1.totalBags + team1Bags
        },
        team2: { 
          ...prev.team2, 
          totalScore: prev.team2.totalScore + team2Points,
          totalBags: prev.team2.totalBags + team2Bags
        }
      };
    });
  };

  const deleteRound = (roundId) => {
    if (!activeGame) return;
    setActiveGame(prev => {
      const roundToRemove = prev.rounds.find(r => r.id === roundId);
      if (!roundToRemove) return prev;
      
      const newRounds = prev.rounds.filter(r => r.id !== roundId);
      
      return {
        ...prev,
        rounds: newRounds,
        team1: {
          ...prev.team1,
          totalScore: prev.team1.totalScore - roundToRemove.team1Points,
          totalBags: prev.team1.totalBags - roundToRemove.team1Bags
        },
        team2: {
          ...prev.team2,
          totalScore: prev.team2.totalScore - roundToRemove.team2Points,
          totalBags: prev.team2.totalBags - roundToRemove.team2Bags
        }
      };
    });
  };

  const updateRound = (roundId, team1Points, team1Bags, team2Points, team2Bags) => {
    if (!activeGame) return;

    setActiveGame((prev) => {
      const roundToEdit = prev.rounds.find((round) => round.id === roundId);
      if (!roundToEdit) return prev;

      const updatedRounds = prev.rounds.map((round) => {
        if (round.id !== roundId) return round;

        return {
          ...round,
          team1Points,
          team1Bags,
          team2Points,
          team2Bags,
        };
      });

      return {
        ...prev,
        rounds: updatedRounds,
        team1: {
          ...prev.team1,
          totalScore: prev.team1.totalScore - roundToEdit.team1Points + team1Points,
          totalBags: prev.team1.totalBags - roundToEdit.team1Bags + team1Bags,
        },
        team2: {
          ...prev.team2,
          totalScore: prev.team2.totalScore - roundToEdit.team2Points + team2Points,
          totalBags: prev.team2.totalBags - roundToEdit.team2Bags + team2Bags,
        },
      };
    });
  };

  const value = {
    players, addPlayer, deletePlayer,
    activeGame, startGame, endGame, addRound, deleteRound, updateRound, updateTeamNames,
    gameHistory
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
