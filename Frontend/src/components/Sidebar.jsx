import React, { useState, useEffect } from "react";
import api from "../api/axios";
import "./FriendRequests.css";

const Sidebar = ({
  activeView,
  friends,
  setFriends,
  chatTitle,
  openChatWith,
  handleToast,
  user
}) => {
  const [showAddFriendInput, setShowAddFriendInput] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);

  // Fetch friends and requests on mount or user change
  useEffect(() => {
    if (user) {
        const fetchData = async () => {
            try {
                // Fetch Friends
                const friendsRes = await api.get("/friends");
                setFriends(friendsRes.data.friends.map(f => ({
                    id: f._id,
                    name: f.username,
                    status: f.bio || "Just joined",
                    avatarColor: f.avatarColor || "#f28b50"
                })));

                // Fetch Requests
                const requestsRes = await api.get("/friends/requests");
                setFriendRequests(requestsRes.data.requests);
            } catch (error) {
                console.error("Failed to fetch friends data", error);
            }
        };
        fetchData();
    } else {
        setFriends([]);
        setFriendRequests([]);
    }
  }, [user, setFriends]);

  const handleAddFriend = async () => {
    const trimmedName = newFriendName.trim();
    if (!trimmedName) return;

    try {
        // 1. Search for user
        const searchRes = await api.get(`/friends/search?query=${trimmedName}`);
        const users = searchRes.data.users;
        
        // Case-insensitive match or pick the first one if exact match fails
        const targetUser = users.find(u => u.username.toLowerCase() === trimmedName.toLowerCase()) || users[0];
        
        if (!targetUser) {
             handleToast("Error", "User not found", "error");
             return;
        }

        // 2. Send Request
        await api.post("/friends/request", { receiverId: targetUser._id });
        
        handleToast("Success", `Friend request sent to ${targetUser.username}!`, "success");
        setNewFriendName("");
        setShowAddFriendInput(false);
    } catch (error) {
        const msg = error.response?.data?.msg || "Failed to send request";
        handleToast("Error", msg, "error");
    }
  };

  const handleAcceptRequest = async (requestId) => {
      try {
          await api.post("/friends/accept", { requestId });
          handleToast("Success", "Friend request accepted!", "success");
          
          // Refresh data
          const friendsRes = await api.get("/friends");
          setFriends(friendsRes.data.friends.map(f => ({
              id: f._id,
              name: f.username,
              status: f.bio || "Just joined",
              avatarColor: f.avatarColor || "#f28b50"
          })));
          
          setFriendRequests(friendRequests.filter(r => r._id !== requestId));
      } catch (error) {
          handleToast("Error", "Failed to accept request", "error");
      }
  };

  const handleRejectRequest = async (requestId) => {
      try {
          await api.post("/friends/reject", { requestId });
          handleToast("Info", "Friend request rejected", "info");
          setFriendRequests(friendRequests.filter(r => r._id !== requestId));
      } catch (error) {
          handleToast("Error", "Failed to reject request", "error");
      }
  };

  return (
    <aside
      className={`sidebar-glass ${
        ["friends", "chat", "profile"].includes(activeView) ? "panel-open mobile-visible" : ""
      }`}
      id="mainSidebar"
    >
      {/* Profile Panel */}
      <div
        id="profile-panel"
        className={`panel-section ${
          activeView === "profile" ? "active-section" : ""
        }`}
      >
        <div className="profile-header">
          <div className="avatar large-modal-avatar" style={{ background: user?.avatarColor || "#f28b50" }}>
            <i className="ph ph-user" style={{ fontSize: "3rem" }}></i>
          </div>
          <h3>{user ? user.username : "Guest User"}</h3>
          <p className="modal-email">{user ? user.email : "guest@trailtales.com"}</p>
          <div className="modal-badges" style={{ justifyContent: "center" }}>
            <span className="badge">Traveler</span>
          </div>
        </div>

        <div className="modal-stats" style={{ marginTop: "20px", marginBottom: "20px" }}>
          <div className="stat-box">
            <strong>0</strong>
            <span>Trips</span>
          </div>
          <div className="stat-box">
            <strong>0</strong>
            <span>Pins</span>
          </div>
          <div className="stat-box">
            <strong>0</strong>
            <span>Countries</span>
          </div>
        </div>

        <div className="modal-bio">
          <label>Bio</label>
          <p>
            {user?.bio || "Just a traveler exploring the world one pin at a time."}
          </p>
        </div>

        {/* <button className="edit-profile-btn" style={{ width: "100%", marginTop: "10px" }}>Edit Profile</button> */}

        <div className="divider"></div>
        <div className="privacy-control">
          <span>Location Visibility</span>
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      {/* Friends Panel */}
      <div
        id="friends-panel"
        className={`panel-section ${
          activeView === "friends" ? "active-section" : ""
        }`}
      >
        <div className="panel-header-row">
          <h4>Friends</h4>
          <button
            className="add-friend-btn"
            onClick={() => setShowAddFriendInput(!showAddFriendInput)}
            title="Add Friend"
            aria-label={showAddFriendInput ? "Cancel adding friend" : "Add a new friend"}
          >
            <i
              className={`ph ${showAddFriendInput ? "ph-minus" : "ph-plus"}`}
            ></i>
          </button>
        </div>

        {showAddFriendInput && (
          <div className="add-friend-form">
            <input
              type="text"
              placeholder="Enter friend's name..."
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddFriend()}
              aria-label="Friend's name"
            />
            <button onClick={handleAddFriend} aria-label="Confirm add friend">
              <i className="ph ph-check"></i>
            </button>
          </div>
        )}

        {friendRequests.length > 0 && (
            <div className="friend-requests-section">
                <h5>Friend Requests</h5>
                {friendRequests.map(req => (
                    <div key={req._id} className="friend-request-item">
                        <div className="req-info">
                            <div className="friend-avatar small" style={{ background: req.sender.avatarColor }}>
                                {req.sender.username.charAt(0).toUpperCase()}
                            </div>
                            <span>{req.sender.username}</span>
                        </div>
                        <div className="req-actions">
                            <button className="accept-btn" onClick={() => handleAcceptRequest(req._id)}>
                                <i className="ph ph-check"></i>
                            </button>
                            <button className="reject-btn" onClick={() => handleRejectRequest(req._id)}>
                                <i className="ph ph-x"></i>
                            </button>
                        </div>
                    </div>
                ))}
                <div className="divider"></div>
            </div>
        )}

        <div className="friends-list-container">
          {friends.length === 0 ? (
            <p className="no-friends-msg">No friends yet. Add one!</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="friend-item">
                <div className="friend-left">
                  <div
                    className="friend-avatar"
                    style={{ background: friend.avatarColor }}
                    aria-hidden="true"
                  >
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="friend-details">
                    <p>{friend.name}</p>
                    <small>{friend.status}</small>
                  </div>
                </div>

                <button
                  className="msg-icon-btn"
                  onClick={() => openChatWith(friend.name)}
                  aria-label={`Chat with ${friend.name}`}
                >
                  <i className="ph ph-chat-circle-dots"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div
        id="chat-panel"
        className={`panel-section ${
          activeView === "chat" ? "active-section" : ""
        }`}
      >
        <h4 id="chat-header-title">{chatTitle}</h4>
        <div className="chat-messages" id="chat-box">
          {/* Messages will appear here */}
        </div>
        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder="Type a message..." 
            aria-label="Type a message"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const msg = e.target.value;
                if (msg.trim()) {
                  const chatBox = document.getElementById('chat-box');
                  const msgDiv = document.createElement('div');
                  msgDiv.className = 'message sent';
                  msgDiv.textContent = msg;
                  msgDiv.style.alignSelf = 'flex-end';
                  msgDiv.style.background = '#f28b50';
                  msgDiv.style.color = 'white';
                  msgDiv.style.padding = '8px 12px';
                  msgDiv.style.borderRadius = '12px';
                  msgDiv.style.marginBottom = '8px';
                  msgDiv.style.maxWidth = '70%';
                  chatBox.appendChild(msgDiv);
                  e.target.value = '';
                  chatBox.scrollTop = chatBox.scrollHeight;
                }
              }
            }}
          />
          <button 
            className="send-btn" 
            aria-label="Send message"
            onClick={() => {
            const input = document.querySelector('.chat-input-area input');
            const msg = input.value;
            if (msg.trim()) {
              const chatBox = document.getElementById('chat-box');
              const msgDiv = document.createElement('div');
              msgDiv.className = 'message sent';
              msgDiv.textContent = msg;
              msgDiv.style.alignSelf = 'flex-end';
              msgDiv.style.background = '#f28b50';
              msgDiv.style.color = 'white';
              msgDiv.style.padding = '8px 12px';
              msgDiv.style.borderRadius = '12px';
              msgDiv.style.marginBottom = '8px';
              msgDiv.style.maxWidth = '70%';
              chatBox.appendChild(msgDiv);
              input.value = '';
              chatBox.scrollTop = chatBox.scrollHeight;
            }
          }}>
            <i className="ph ph-paper-plane-right"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
