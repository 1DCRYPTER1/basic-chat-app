import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UserSearch = ({ client, onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);

  const searchUsers = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!client.userID || value.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await client.queryUsers({ id: { $ne: client.userID } });
      setResults(response.users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (userId) => {
    onSelectUser(userId);
    setQuery('');
    setResults([]);
  };

  const showDropdown = (results.length > 0 || (query.length >= 2 && !searching)) && focused;

  return (
    <div className="usersearch-wrap">
      <p className="usersearch-label">New Conversation</p>

      <div className={`usersearch-input-wrap ${focused ? 'focused' : ''}`}>
        {/* Search icon */}
        <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>

        <input
          className="usersearch-input"
          placeholder={client.userID ? 'Search by name or email…' : 'Connecting…'}
          disabled={!client.userID}
          value={query}
          onChange={searchUsers}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />

        {/* Spinner */}
        <AnimatePresence>
          {searching && (
            <motion.div
              className="search-spinner"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="usersearch-dropdown"
            initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
          >
            {results.length > 0 ? (
              results.map((u, i) => (
                <motion.div
                  key={u.id}
                  className="usersearch-result"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleSelect(u.id)}
                  whileHover={{ backgroundColor: 'rgba(96,165,250,0.12)', x: 3 }}
                >
                  <div className="result-avatar">
                    {u.image ? (
                      <img src={u.image} alt={u.name} />
                    ) : (
                      <span>{(u.name || u.id || '?')[0].toUpperCase()}</span>
                    )}
                    <div className={`result-status-dot ${u.online ? 'online' : 'offline'}`} />
                  </div>
                  <div className="result-info">
                    <span className="result-name">{u.name || 'Unknown User'}</span>
                    <span className="result-id">{u.id}</span>
                  </div>
                  <svg className="result-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="usersearch-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span>😕</span> No users found for "{query}"
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSearch;