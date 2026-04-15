import React, { useEffect, useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  ChannelList,
  ChannelPreviewMessenger,
} from 'stream-chat-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserSearch from './UserSearch';
import 'stream-chat-react/dist/css/v2/index.css';
import './App.css';

const apiKey = process.env.REACT_APP_STREAM_KEY;

//Login page
function LoginPage({ onLogin, isLoading }) {
  const [hovered, setHovered] = useState(false);

  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 120 + 40,
    x: Math.random() * 100,
    delay: Math.random() * 6,
    duration: Math.random() * 8 + 10,
  }));

  return (
    <div className="login-root">
      {/* Animated background orbs */}
      <div className="login-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Floating bubbles */}
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="bubble"
          style={{ width: b.size, height: b.size, left: `${b.x}%` }}
          initial={{ y: '110vh', opacity: 0 }}
          animate={{ y: '-10vh', opacity: [0, 0.15, 0.15, 0] }}
          transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Card */}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 60, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo mark */}
        <motion.div
          className="login-logo"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.6, type: 'spring', stiffness: 200 }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M18 3C9.716 3 3 9.716 3 18s6.716 15 15 15 15-6.716 15-15S26.284 3 18 3zm0 6a3 3 0 110 6 3 3 0 010-6zm0 21c-3.75 0-7.07-1.93-9-4.86.045-2.985 6-4.635 9-4.635 2.985 0 8.955 1.65 9 4.635A10.5 10.5 0 0118 30z" fill="url(#logoGrad)"/>
            <defs>
              <linearGradient id="logoGrad" x1="3" y1="3" x2="33" y2="33" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa"/>
                <stop offset="1" stopColor="#818cf8"/>
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Sign in to continue to your conversations</p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="feature-pills"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {['💬 Real-time chat', '🔒 Secure & private', '⚡ Instant delivery'].map((f, i) => (
            <motion.span
              key={f}
              className="pill"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 + i * 0.1 }}
            >
              {f}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          className="login-btn"
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={onLogin}
          disabled={isLoading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.span
            animate={{ x: hovered ? -4 : 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {isLoading ? 'Redirecting...' : 'Continue with Auth0'}
          </motion.span>
          <motion.span
            className="btn-arrow"
            animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.6 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            →
          </motion.span>
        </motion.button>

        <motion.p
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          By continuing, you agree to our Terms of Service
        </motion.p>
      </motion.div>
    </div>
  );
}

//Empty State
function EmptyState({ userName, userImage }) {
  const timeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="empty-bg">
        <div className="empty-orb empty-orb-1" />
        <div className="empty-orb empty-orb-2" />
      </div>

      <div className="empty-content">
        {userImage && (
          <motion.div
            className="empty-avatar-wrap"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <img src={userImage} alt={userName} className="empty-avatar" />
            <div className="empty-avatar-ring" />
          </motion.div>
        )}

        <motion.h2
          className="empty-greeting"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {timeGreeting()},
          <br />
          <span className="empty-name">{userName?.split('@')[0] || 'there'} 👋</span>
        </motion.h2>

        <motion.p
          className="empty-hint"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Pick up where you left off or start a brand-new conversation.
        </motion.p>

        {/* Animated dots decoration */}
        <motion.div
          className="empty-dots"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="empty-dot"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>

        <motion.p
          className="empty-cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          Select a conversation from the sidebar ←
        </motion.p>
      </div>
    </motion.div>
  );
}

/* Main */
function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [channel, setChannel] = useState(null);
  const [clientReady, setClientReady] = useState(false);
  const chatClient = useRef(StreamChat.getInstance(apiKey));

  useEffect(() => {
    const setupClient = async () => {
      if (isAuthenticated && user) {
        const userId = user.sub.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        try {
          if (chatClient.current.userID === userId) {
            setClientReady(true);
            return;
          }
          await chatClient.current.connectUser(
            { id: userId, name: user.email || user.name || userId, image: user.picture },
            chatClient.current.devToken(userId)
          );
          setClientReady(true);
        } catch (err) {
          console.error('Connection Error', err);
        }
      }
    };
    setupClient();
    return () => {
      if (clientReady) {
        chatClient.current.disconnectUser();
        setClientReady(false);
      }
    };
  }, [isAuthenticated, user]);

  const CustomChannelPreview = (props) => {
    const { channel: previewChannel, setActiveChannel } = props;
    const onClick = () => {
      setChannel(previewChannel);
      if (setActiveChannel) setActiveChannel(previewChannel);
    };
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ x: 3 }}
        transition={{ type: 'spring', stiffness: 400 }}
        style={{ cursor: 'pointer' }}
      >
        <ChannelPreviewMessenger {...props} />
      </motion.div>
    );
  };

  /* Loading screens */
  if (isLoading) {
    return (
      <div className="splash">
        <motion.div
          className="splash-dot"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => loginWithRedirect()} isLoading={isLoading} />;
  }

  if (!clientReady) {
    return (
      <div className="splash">
        <motion.div
          className="splash-ring"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="splash-text">Connecting…</p>
      </div>
    );
  }

  return (
    <Chat client={chatClient.current} theme="messaging light">
      <motion.div
        className="app-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* ── SIDEBAR ── */}
        <motion.aside
          className="sidebar"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* User header */}
          <div className="sidebar-header">
            <div className="sidebar-user">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="sidebar-avatar" />
              ) : (
                <div className="sidebar-avatar-placeholder">
                  {(user.name || user.email || '?')[0].toUpperCase()}
                </div>
              )}
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name || user.email}</span>
                <span className="sidebar-status"><span className="status-dot" />Online</span>
              </div>
            </div>
            <motion.button
              className="logout-btn"
              onClick={() => logout()}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.15)' }}
              whileTap={{ scale: 0.95 }}
              title="Logout"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </motion.button>
          </div>

          {/* Title */}
          <div className="sidebar-title-row">
            <h2 className="sidebar-title">Messages</h2>
          </div>

          {/* Search / New conversation */}
          <UserSearch
            client={chatClient.current}
            onSelectUser={async (id) => {
              const newChannel = chatClient.current.channel('messaging', {
                members: [chatClient.current.userID, id],
              });
              await newChannel.watch();
              setChannel(newChannel);
            }}
          />

          {/* Channel list */}
          <div className="channel-list-wrap">
            <p className="section-label">Recent Chats</p>
            <ChannelList
              filters={{ members: { $in: [chatClient.current.userID] } }}
              sort={{ last_message_at: -1 }}
              Preview={CustomChannelPreview}
            />
          </div>
        </motion.aside>

        {/* MAIN PANEL */}
        <main className="main-panel">
          <AnimatePresence mode="wait">
            {channel ? (
              <motion.div
                key={channel.cid}
                className="channel-wrap"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Channel channel={channel} key={channel.cid}>
                  <Window>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput />
                  </Window>
                  <Thread />
                </Channel>
              </motion.div>
            ) : (
              <EmptyState
                key="empty"
                userName={user?.name || user?.email}
                userImage={user?.picture}
              />
            )}
          </AnimatePresence>
        </main>
      </motion.div>
    </Chat>
  );
}

export default App;