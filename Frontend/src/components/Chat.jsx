import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";

const Chat = ({ user, selectedFriend }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatBoxRef = useRef(null);
  const shouldScrollRef = useRef(true);

  // Reset scroll behavior when friend changes
  useEffect(() => {
    shouldScrollRef.current = true;
  }, [selectedFriend]);

  // Initial fetch and polling
  useEffect(() => {
    let isMounted = true;
    // Fetch messages
    const fetchMessages = async () => {
      if (!selectedFriend || !selectedFriend.id) return;
      try {
        const res = await api.get(`/messages/${selectedFriend.id}`);
        if (isMounted) {
            setMessages(res.data.messages);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => {
        isMounted = false;
        clearInterval(interval);
    };
  }, [selectedFriend]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatBoxRef.current && shouldScrollRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (chatBoxRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
      // If user is close to bottom (within 100px), enable auto-scroll
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      shouldScrollRef.current = isAtBottom;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;

    try {
      const res = await api.post("/messages", {
        receiverId: selectedFriend.id,
        content: newMessage
      });
      
      // Optimistically add message or wait for poll? 
      // Let's append immediately for better UX
      setMessages([...messages, res.data.message]);
      setNewMessage("");
      shouldScrollRef.current = true; // Force scroll to bottom when sending
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  if (!selectedFriend) {
    return (
      <div className="chat-placeholder">
        <p>Select a friend to start chatting</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h4 id="chat-header-title">Chat with {selectedFriend.name}</h4>
      
      <div 
        className="chat-messages" 
        id="chat-box" 
        ref={chatBoxRef} 
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', padding: '10px' }}
      >
        {messages.map((msg, index) => {
          const senderId = msg.sender?._id || msg.sender;
          const currentUserId = user?._id || user?.id;
          const isMe = String(senderId) === String(currentUserId);
          
          return (
            <div 
              key={msg._id || index} 
              className={`message ${isMe ? 'sent' : 'received'}`}
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                backgroundColor: isMe ? '#f28b50' : '#2a2f3d',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '12px',
                marginBottom: '8px',
                maxWidth: '70%',
                wordWrap: 'break-word'
              }}
            >
              {msg.content}
            </div>
          );
        })}
      </div>

      <div className="chat-input-area" style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          style={{ flex: 1, padding: '8px', borderRadius: '20px', border: '1px solid #ccc' }}
        />
        <button 
          className="send-btn" 
          onClick={handleSendMessage}
          style={{ background: '#f28b50', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <i className="ph ph-paper-plane-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Chat;
