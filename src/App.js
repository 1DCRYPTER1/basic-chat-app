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
  ChannelPreviewMessenger, // Import the default preview to wrap it
} from 'stream-chat-react';
import UserSearch from './UserSearch';
import 'stream-chat-react/dist/css/v2/index.css';

const apiKey = process.env.REACT_APP_STREAM_KEY;

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

  // THIS IS THE FIX: A custom preview that FORCES the state change
  const CustomChannelPreview = (props) => {
    const { channel: previewChannel, setActiveChannel } = props;
    
    const onClick = () => {
      console.log("Forcing channel change to:", previewChannel.cid);
      setChannel(previewChannel); // Update our App.js state
      if (setActiveChannel) setActiveChannel(previewChannel); // Update Stream's internal state
    };

    return (
      <div onClick={onClick} style={{ cursor: 'pointer' }}>
        <ChannelPreviewMessenger {...props} />
      </div>
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <button onClick={() => loginWithRedirect()}>Login</button>;
  if (!clientReady) return <div>Connecting...</div>;

  return (
    <Chat client={chatClient.current} theme="messaging light">
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <div style={{ width: '350px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
          <header style={{ padding: '10px', background: '#005fff', color: '#white' }}>
            <button onClick={() => logout()}>Logout</button>
          </header>
          
          <UserSearch 
            client={chatClient.current} 
            onSelectUser={async (id) => {
              const newChannel = chatClient.current.channel('messaging', { members: [chatClient.current.userID, id] });
              await newChannel.watch(); 
              setChannel(newChannel);
            }} 
          />

          <ChannelList 
            filters={{ members: { $in: [chatClient.current.userID] } }} 
            sort={{ last_message_at: -1 }}
            Preview={CustomChannelPreview} // USE OUR CUSTOM CLICK HANDLER
          />
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {channel ? (
            <Channel channel={channel} key={channel.cid}>
              <Window><ChannelHeader /><MessageList /><MessageInput /></Window>
              <Thread />
            </Channel>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <h3>Select a user to chat</h3>
            </div>
          )}
        </div>
      </div>
    </Chat>
  );
}

export default App;