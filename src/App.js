import React, { useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { StreamChat } from "stream-chat";
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
} from "stream-chat-react";
import { motion, AnimatePresence } from "framer-motion";
import UserSearch from "./UserSearch";
import AvatarCreator from "./AvatarCreator";
import "stream-chat-react/dist/css/v2/index.css";
import "./App.css";

const apiKey = process.env.REACT_APP_STREAM_KEY;

//Login page
function LoginPage({ onLogin, isLoading }) {
  const [hovered, setHovered] = useState(false);

  const isLoggedOut = window.location.search.includes("loggedout=true");

  const handleLoginClick = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    onLogin();
  };

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="login-logo">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 20C9.33 20 6.91 18.67 5.45 16.63C5.48 14.46 9.87 13.25 12 13.25C14.12 13.25 18.51 14.46 18.55 16.63C17.09 18.67 14.67 20 12 20Z"
              fill="#60a5fa"
            />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isLoggedOut ? (
            <>
              <h1 className="login-title">Logged Out</h1>
              <p
                className="login-sub"
                style={{ color: "var(--green)", fontWeight: "600" }}
              >
                You have been logged out successfully.
              </p>
              <p className="login-sub">See you again soon!</p>
            </>
          ) : (
            <>
              <h1 className="login-title">Welcome back</h1>
              <p className="login-sub">
                Sign in to continue to your conversations
              </p>
            </>
          )}
        </motion.div>

        <motion.button
          className="login-btn"
          style={{ marginTop: "20px" }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={handleLoginClick}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>
            {isLoggedOut ? "Login back again" : "Continue with Auth0"}
          </span>
          <motion.span animate={{ x: hovered ? 4 : 0 }}>→</motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}

//Empty State
function EmptyState({ userName, userImage }) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="empty-content">
        <div className="empty-avatar-wrap">
          <img src={userImage} alt="User" className="empty-avatar" />
          <div className="empty-avatar-ring" />
        </div>
        <h2 className="empty-greeting">
          Welcome back, <br />
          <span className="empty-name">{userName?.split("@")[0]}</span> 👋
        </h2>
        <p className="empty-hint">
          Select a conversation from the sidebar to start chatting.
        </p>
      </div>
    </motion.div>
  );
}

//Main App

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0();
  const [channel, setChannel] = useState(null);
  const [clientReady, setClientReady] = useState(false);
  const [needsAvatar, setNeedsAvatar] = useState(false);

  // Mobile UI States
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [showChat, setShowChat] = useState(false);

  const chatClient = useRef(StreamChat.getInstance(apiKey));

  // Handle mobile resizing
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const setupClient = async () => {
      if (isAuthenticated && user) {
        const userId = user.sub.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

        try {
          if (chatClient.current.userID !== userId) {
            await chatClient.current.connectUser(
              { id: userId, name: user.email || user.name || userId },
              chatClient.current.devToken(userId),
            );
          }

          const streamUserImage = chatClient.current.user?.image;
          const auth0Image = user.picture;

          const hasValidStreamImage =
            streamUserImage && !streamUserImage.includes("gravatar.com");
          const hasValidAuth0Image =
            auth0Image && !auth0Image.includes("gravatar.com");

          if (hasValidStreamImage || hasValidAuth0Image) {
            setNeedsAvatar(false);
            if (!hasValidStreamImage && hasValidAuth0Image) {
              await chatClient.current.partialUpdateUser({
                id: userId,
                set: { image: auth0Image },
              });
            }
          } else {
            setNeedsAvatar(true);
          }

          setClientReady(true);
        } catch (err) {
          console.error("Connection Error", err);
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

  const handleAvatarConfirm = async (url) => {
    try {
      await chatClient.current.partialUpdateUser({
        id: chatClient.current.userID,
        set: { image: url },
      });
      setNeedsAvatar(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  const CustomChannelPreview = (props) => {
    const { channel: previewChannel, setActiveChannel } = props;
    const onClick = () => {
      setChannel(previewChannel);
      if (setActiveChannel) setActiveChannel(previewChannel);
      if (isMobileView) setShowChat(true);
    };
    return (
      <div onClick={onClick} style={{ cursor: "pointer" }}>
        <ChannelPreviewMessenger {...props} />
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="splash">
        <div className="splash-dot" />
      </div>
    );
  if (!isAuthenticated)
    return (
      <LoginPage onLogin={() => loginWithRedirect()} isLoading={isLoading} />
    );
  if (!clientReady)
    return (
      <div className="splash">
        <div className="splash-ring" />
      </div>
    );
  if (needsAvatar)
    return <AvatarCreator user={user} onConfirm={handleAvatarConfirm} />;

  return (
    <Chat client={chatClient.current} theme="messaging light">
      <div
        className={`app-root ${showChat ? "mobile-chat-active" : "mobile-list-active"}`}
      >
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-user">
              <img
                src={chatClient.current.user.image || user.picture}
                alt="Avatar"
                className="sidebar-avatar"
              />
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">
                  {user.name || user.email}
                </span>
                <span className="sidebar-status">
                  <span className="status-dot" />
                  Online
                </span>
              </div>
            </div>
            <button
              className="logout-btn"
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: window.location.origin + "?loggedout=true",
                  },
                })
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>

          <UserSearch
            client={chatClient.current}
            onSelectUser={async (id) => {
              const newChannel = chatClient.current.channel("messaging", {
                members: [chatClient.current.userID, id],
              });
              await newChannel.watch();
              setChannel(newChannel);
              if (isMobileView) setShowChat(true);
            }}
          />

          <div className="channel-list-wrap">
            <p className="section-label">Recent Chats</p>
            <ChannelList
              filters={{ members: { $in: [chatClient.current.userID] } }}
              sort={{ last_message_at: -1 }}
              Preview={CustomChannelPreview}
            />
          </div>
        </aside>

        <main className="main-panel">
          {/* Back button for mobile view */}
          {isMobileView && showChat && (
            <button
              className="mobile-back-btn"
              onClick={() => setShowChat(false)}
              aria-label="Back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          )}

          <AnimatePresence mode="wait">
            {channel ? (
              <motion.div
                key={channel.cid}
                className="channel-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                userName={user?.name || user?.email}
                userImage={chatClient.current.user.image || user?.picture}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </Chat>
  );
}

export default App;
