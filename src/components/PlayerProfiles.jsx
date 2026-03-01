import React, { useState } from 'react';
import { useGame } from '../context/useGame';
import { PROFILE_TEMPLATES } from '../data/profileTemplates';

export const PlayerProfiles = () => {
  const { players, addPlayer, deletePlayer } = useGame();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const updateAvatarFromFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !avatar) return;
    addPlayer(name, avatar);
    setName('');
    setAvatar('');
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    updateAvatarFromFile(file);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    updateAvatarFromFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const renderAvatar = (player) => {
    const looksLikeImage = typeof player.avatar === 'string' && (player.avatar.includes('/') || player.avatar.includes('.'));
    const fallbackPhoto = PROFILE_TEMPLATES[0]?.avatar || '';
    const avatarSrc = looksLikeImage ? player.avatar : fallbackPhoto;

    return <img src={avatarSrc} alt={player.name} className="player-photo-large" />;
  };

  return (
    <div className="glass-panel animate-enter" style={{ textAlign: 'center' }}>
      <h2 className="title-glow" style={{ fontSize: '2rem' }}>Players</h2>
      
      <form onSubmit={handleSubmit} className="player-upload-section">
        <label
          className={`player-upload-preview-wrap player-upload-trigger ${isDragActive ? 'dragging' : ''}`}
          htmlFor="player-photo-upload"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {avatar ? (
            <>
              <img src={avatar} alt="New player preview" className="player-upload-preview" />
              <span className="player-upload-overlay">Change Photo</span>
            </>
          ) : (
            <div className="player-upload-placeholder">
              <strong>Upload Photo</strong>
              <span>Click to choose image</span>
            </div>
          )}
        </label>
        <input
          id="player-photo-upload"
          type="file"
          className="player-upload-input"
          accept="image/*"
          onChange={handlePhotoUpload}
        />

        <input 
          type="text" 
          className="input-glass" 
          placeholder="Type player name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
        />
        <button type="submit" className="btn btn-primary" disabled={!name.trim() || !avatar}>Add Player</button>
      </form>

      <div className="grid-2" style={{ placeItems: 'center' }}>
        {players.map(player => (
          <div key={player.id} className="glass-panel player-card-vertical" style={{ width: '100%', maxWidth: '420px' }}>
            <div className="flex-center" style={{ gap: '0.75rem', flexDirection: 'column' }}>
              {renderAvatar(player)}
              <span className="player-name-below">{player.name}</span>
            </div>
            <button 
              className="btn btn-danger btn-icon player-delete-btn" 
              onClick={() => deletePlayer(player.id)}
              title="Delete Player"
            >
              ✕
            </button>
          </div>
        ))}
        {players.length === 0 && (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
            No players added yet. Add some friends to start!
          </p>
        )}
      </div>
    </div>
  );
};
