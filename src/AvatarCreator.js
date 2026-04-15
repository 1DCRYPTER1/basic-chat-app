import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const styles = ['adventurer', 'avataaars', 'big-smile', 'bottts', 'lorelei', 'pixel-art', 'shapes'];

const AvatarCreator = ({ user, onConfirm }) => {
  const [selectedStyle, setSelectedStyle] = useState('lorelei');
  const [seed, setSeed] = useState(user?.nickname || 'seed');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    // Generate the URL using DiceBear's HTTP API
    setAvatarUrl(`https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}`);
  }, [selectedStyle, seed]);

  const handleRandomize = () => {
    setSeed(Math.random().toString(36).substring(7));
  };

  return (
    <div className="avatar-creator-root">
      <motion.div 
        className="avatar-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="avatar-title">Create Your Avatar</h2>
        <p className="avatar-sub">This is how others will see you in the chat.</p>

        <div className="avatar-preview-wrap">
          <motion.img 
            key={avatarUrl}
            src={avatarUrl} 
            alt="Avatar Preview" 
            className="avatar-large-preview"
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
          />
        </div>

        <div className="avatar-controls">
          <div className="style-grid">
            {styles.map((s) => (
              <button 
                key={s} 
                className={`style-btn ${selectedStyle === s ? 'active' : ''}`}
                onClick={() => setSelectedStyle(s)}
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="action-buttons">
            <button className="secondary-btn" onClick={handleRandomize}>
              Randomize
            </button>
            <button className="primary-btn" onClick={() => onConfirm(avatarUrl)}>
              Create Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarCreator;