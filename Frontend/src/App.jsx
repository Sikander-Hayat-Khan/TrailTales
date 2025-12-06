import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "@phosphor-icons/web/regular"; // Import icons
import "./App.css"; // Or index.css

// Images (Assumed to be in public/assets or src/assets)
// If in src/assets, import them: import bookLogo from './assets/book.png';
const bookLogo = "src\\assets\\book.png";

function App() {
  // --- STATE MANAGEMENT ---
  const [isDashboardOpen, setDashboardOpen] = useState(false);
  const [activeView, setActiveView] = useState("map"); // map, friends, chat, profile

  // Auth & Profile Modals
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Carousel State
  const [currentCard, setCurrentCard] = useState(0);

  // Map & Chat State
  const [chatTitle, setChatTitle] = useState("Group Chat: Spain Trip");
  const [toasts, setToasts] = useState([]);

  // 1. DYNAMIC FRIENDS LIST STATE
  const [friends, setFriends] = useState([
    {
      id: 1,
      name: "Alice",
      status: "Pinned a location",
      avatarColor: "#f28b50",
    },
    { id: 2, name: "Bob", status: "Online", avatarColor: "#384959" },
  ]);

  // 2. ADD FRIEND INPUT STATE
  const [showAddFriendInput, setShowAddFriendInput] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");

  // Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Data
  const cards = [
    {
      country: "Spain",
      img: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=2070&auto=format&fit=crop",
    },
    {
      country: "Switzerland",
      img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2070&auto=format&fit=crop",
    },
    {
      country: "Bali",
      img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop",
    },
  ];

  // --- EFFECTS ---

  // 1. Handle Body Class for Mobile Nav visibility
  useEffect(() => {
    if (isDashboardOpen) {
      document.body.classList.add("dashboard-open");
      // Map resize hack from original JS
      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 1000);
    } else {
      document.body.classList.remove("dashboard-open");
    }
  }, [isDashboardOpen]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Init Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      minZoom: 3,
      maxZoom: 18,
    }).setView([40.4168, -3.7038], 6);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    // Custom Icon
    const pinIcon = L.divIcon({
      className: "custom-pin",
      html: `<div style="background-color: #F28B50; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #F28B50;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
    });

    // Mock Pins
    const pins = [
      { coords: [40.4168, -3.7038], title: "Madrid Night Out" },
      { coords: [41.3851, 2.1734], title: "Barcelona Beach" },
    ];

    pins.forEach((pin) => {
      L.marker(pin.coords, { icon: pinIcon })
        .addTo(map)
        .bindPopup(
          `<b style="color:#151925; font-family:'Nunito'">${pin.title}</b>`
        );
    });

    // Handle Map Clicks (New Pin)
    map.on("click", function (e) {
      const { lat, lng } = e.latlng;
      const popupContent = `
        <div class="new-pin-form">
            <h4>New Memory</h4>
            <input type="text" id="new-memory-text" placeholder="What happened here?">
            <button onclick="window.saveNewPin(${lat}, ${lng})">Save Pin</button>
        </div>
      `;
      L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(map);
    });

    mapInstanceRef.current = map;

    // GLOBAL FUNCTION for Leaflet Popup (React workaround)
    window.saveNewPin = (lat, lng) => {
      const text = document.getElementById("new-memory-text").value;
      if (text) {
        L.marker([lat, lng], { icon: pinIcon })
          .addTo(map)
          .bindPopup(
            `<b style="color:#151925; font-family:'Nunito'">${text}</b>`
          );
        map.closePopup();
        console.log("Saving to backend:", { lat, lng, text });
      } else {
        alert("Please write a memory!");
      }
    };

    return () => {
      // Cleanup global function on unmount
      window.saveNewPin = null;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 3. HANDLER: ADD NEW FRIEND
  const handleAddFriend = () => {
    if (!newFriendName.trim()) return;

    const newFriend = {
      id: Date.now(), // <--- Safe because this only runs on Click
      name: newFriendName,
      status: "Just joined",
      avatarColor: "#f28b50",
    };

    setFriends([...friends, newFriend]);
    setNewFriendName("");
    setShowAddFriendInput(false);
  };

  // 3. Typing Animation
  const [typingText, setTypingText] = useState("");
  useEffect(() => {
    const word = "TrailTales";
    // let timeout;

    const animate = () => {
      // We render spans in the JSX, this effectively triggers a re-render loop conceptually
      // but simpler: we just map the letters in JSX with animation delays.
      // To strictly follow original logic of clearing and refilling:
      setTypingText("");
      setTimeout(() => setTypingText(word), 100); // Small delay to force re-render
    };

    animate();
    const interval = setInterval(animate, word.length * 200 + 2000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---

  const handleToast = (title, message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto remove after 3.5s (3s wait + 0.5s fade)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthModalOpen(false);
    if (authMode === "login") {
      const email = e.target.querySelector('input[type="email"]').value;
      handleToast(
        "Welcome Back!",
        `Successfully logged in as ${email}`,
        "success"
      );
    } else {
      const name = e.target.querySelector('input[type="text"]').value;
      handleToast(
        "Account Created",
        `Welcome to the journey, ${name}!`,
        "success"
      );
    }
  };

  const nextCard = () => setCurrentCard((prev) => (prev + 1) % cards.length);
  const prevCard = () =>
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);

  const switchView = (viewName) => {
    setActiveView(viewName);
  };

  const openChatWith = (friendName) => {
    setChatTitle("Chat with " + friendName);
    switchView("chat");
  };

  // --- RENDER HELPERS ---

  // Render Typing Spans
  const renderTypingText = () => {
    if (!typingText) return null;
    return typingText.split("").map((letter, idx) => (
      <span
        key={idx}
        className="trail-letter"
        style={{ animationDelay: `${idx * 0.2}s` }}
      >
        {letter}
      </span>
    ));
  };

  // --- COMPONENT RETURN ---
  return (
    <>
      {/* --- LANDING SECTION --- */}
      <section id="landing-view">
        <nav>
          <div className="logo">
            <img src={bookLogo} alt="Logo" className="logo-img" />
            <span>TrailTales.</span>
          </div>

          <div className="nav-links">
            <a
              href="#"
              className="btn-login"
              onClick={() => {
                setAuthMode("login");
                setAuthModalOpen(true);
              }}
            >
              Login
            </a>
            <a
              href="#"
              className="btn-signup"
              onClick={() => {
                setAuthMode("signup");
                setAuthModalOpen(true);
              }}
            >
              Sign Up
            </a>

            <div className="profile-menu-container">
              <button
                className="btn-profile-header"
                onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                JM
              </button>
              <div
                id="profile-dropdown"
                className={`profile-dropdown ${
                  isProfileDropdownOpen ? "active" : ""
                }`}
              >
                <div className="dropdown-info">
                  <span className="user-name">John M.</span>
                  <span className="user-email">john@trailtales.com</span>
                </div>
                <hr />
                <a
                  href="#"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setProfileModalOpen(true);
                  }}
                >
                  <i className="ph ph-user"></i> My Profile
                </a>
                <a href="#">
                  <i className="ph ph-gear"></i> Settings
                </a>
                <hr />
                <a href="#" className="logout-link">
                  <i className="ph ph-sign-out"></i> Log Out
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Profile Modal */}
        <div
          id="profile-modal-overlay"
          className={`modal-overlay ${isProfileModalOpen ? "active" : ""}`}
          onClick={(e) =>
            e.target.id === "profile-modal-overlay" &&
            setProfileModalOpen(false)
          }
        >
          <div className="profile-modal-window">
            <button
              className="close-modal-btn"
              onClick={() => setProfileModalOpen(false)}
            >
              <i className="ph ph-x"></i>
            </button>
            <div className="modal-header">
              <div className="avatar large-modal-avatar">JM</div>
              <h2>John Doe</h2>
              <p className="modal-email">john@trailtales.com</p>
              <div className="modal-badges">
                <span className="badge">Traveler</span>
                <span className="badge">Pro Member</span>
              </div>
            </div>
            <div className="modal-stats">
              <div className="stat-box">
                <strong>12</strong>
                <span>Trips</span>
              </div>
              <div className="stat-box">
                <strong>45</strong>
                <span>Pins</span>
              </div>
              <div className="stat-box">
                <strong>8</strong>
                <span>Countries</span>
              </div>
            </div>
            <div className="modal-bio">
              <label>Bio</label>
              <p>
                Digital nomad exploring the world one coffee shop at a time.
                Currently wandering through Europe.
              </p>
            </div>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
        </div>

        {/* Auth Modal */}
        <div
          id="auth-modal-overlay"
          className={`modal-overlay ${isAuthModalOpen ? "active" : ""}`}
          onClick={(e) =>
            e.target.id === "auth-modal-overlay" && setAuthModalOpen(false)
          }
        >
          <div className="auth-modal-window">
            <button
              className="close-modal-btn"
              onClick={() => setAuthModalOpen(false)}
            >
              <i className="ph ph-x"></i>
            </button>
            <div className="auth-header">
              <img src={bookLogo} alt="Logo" className="auth-logo" />
              <h2>TrailTales.</h2>
              <p id="auth-subtitle">
                {authMode === "login"
                  ? "Welcome back, traveler."
                  : "Begin your journey today."}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <div className="input-group">
                  <i className="ph ph-user"></i>
                  <input type="text" placeholder="Full Name" required />
                </div>
              )}
              <div className="input-group">
                <i className="ph ph-envelope-simple"></i>
                <input type="email" placeholder="Email Address" required />
              </div>
              <div className="input-group">
                <i className="ph ph-lock-key"></i>
                <input type="password" placeholder="Password" required />
              </div>

              {authMode === "login" && (
                <div className="form-actions">
                  <label className="remember-me">
                    <input type="checkbox" /> <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-pass">
                    Forgot Password?
                  </a>
                </div>
              )}

              <button type="submit" className="cta-btn full-width">
                {authMode === "login" ? "Log In" : "Create Account"}
              </button>

              <div className="auth-switch">
                <span>
                  {authMode === "login"
                    ? "New to TrailTales?"
                    : "Already have an account?"}
                </span>
                <a
                  href="#"
                  onClick={() =>
                    setAuthMode(authMode === "login" ? "signup" : "login")
                  }
                >
                  {authMode === "login" ? "Create an account" : "Log In"}
                </a>
              </div>
            </form>
          </div>
        </div>

        <main className="hero-section">
          <div className="content-box">
            <h4>Start your journey</h4>
            <div className="title-container">
              <h1>
                Welcome to{" "}
                <span className="typing-text">{renderTypingText()}</span>
                <span className="cursor"></span>
              </h1>
            </div>
            <p>
              Pin your moments, share your adventures, and turn your travels
              into a timeless journal.
            </p>
            <button className="cta-btn" onClick={() => setDashboardOpen(true)}>
              Start Journaling
            </button>
          </div>

          <div className="carousel-container">
            <button id="prevBtn" className="nav-arrow" onClick={prevCard}>
              &#10094;
            </button>
            <div className="card-stack">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className={`card ${index === currentCard ? "active" : ""}`}
                  style={{ backgroundImage: `url('${card.img}')` }}
                >
                  <div className="card-info">{card.country}</div>
                </div>
              ))}
            </div>
            <button id="nextBtn" className="nav-arrow" onClick={nextCard}>
              &#10095;
            </button>
          </div>
        </main>
      </section>

      {/* --- DASHBOARD SECTION --- */}
      <section id="dashboard-view" className={isDashboardOpen ? "active" : ""}>
        <button
          className="back-home-btn"
          onClick={() => setDashboardOpen(false)}
        >
          <i className="ph ph-arrow-down"></i> Back
        </button>

        {/* Desktop Nav Rail */}
        <div className="desktop-nav-rail">
          {["map", "friends", "chat", "profile"].map((view) => (
            <button
              key={view}
              className={`desk-nav-item ${activeView === view ? "active" : ""}`}
              onClick={() => switchView(view)}
              data-tooltip={view.charAt(0).toUpperCase() + view.slice(1)}
            >
              <i
                className={`ph ${
                  view === "map"
                    ? "ph-map-trifold"
                    : view === "friends"
                    ? "ph-users"
                    : view === "chat"
                    ? "ph-chat-circle-text"
                    : "ph-user"
                }`}
              ></i>
            </button>
          ))}
        </div>

        <div id="map" ref={mapContainerRef}></div>

        <aside
          className={`sidebar-glass ${
            activeView !== "map" ? "panel-open mobile-visible" : ""
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
              <div className="avatar large">JM</div>
              <h3>John M.</h3>
              <span className="status">Traveling in Spain</span>
            </div>
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
          {/* Friends Panel */}
          <div
            id="friends-panel"
            className={`panel-section ${
              activeView === "friends" ? "active-section" : ""
            }`}
          >
            {/* Header with Add Button */}
            <div className="panel-header-row">
              <h4>Friends Online</h4>
              <button
                className="add-friend-btn"
                onClick={() => setShowAddFriendInput(!showAddFriendInput)}
                title="Add Friend"
              >
                <i
                  className={`ph ${
                    showAddFriendInput ? "ph-minus" : "ph-plus"
                  }`}
                ></i>
              </button>
            </div>

            {/* Inline Add Friend Form */}
            {showAddFriendInput && (
              <div className="add-friend-form">
                <input
                  type="text"
                  placeholder="Enter friend's name..."
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddFriend()}
                />
                <button onClick={handleAddFriend}>
                  <i className="ph ph-check"></i>
                </button>
              </div>
            )}

            {/* Dynamic Friends List */}
            {/* Dynamic Friends List */}
            <div className="friends-list-container">
              {friends.length === 0 ? (
                <p className="no-friends-msg">No friends yet. Add one!</p>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="friend-item">
                    {/* 👇 THIS SECTION WAS MISSING 👇 */}
                    <div className="friend-left">
                      <div
                        className="friend-avatar"
                        style={{ background: friend.avatarColor }}
                      >
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="friend-details">
                        <p>{friend.name}</p>
                        <small>{friend.status}</small>
                      </div>
                    </div>
                    {/* 👆 END OF MISSING SECTION 👆 */}

                    <button
                      className="msg-icon-btn"
                      onClick={() => openChatWith(friend.name)}
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
              <div className="msg received">
                <p>Check out this view! 📸</p>
              </div>
              <div className="msg sent">
                <p>That looks amazing!</p>
              </div>
            </div>
            <div className="chat-input-area">
              <input type="text" placeholder="Type a message..." />
              <button className="send-btn">
                <i className="ph ph-paper-plane-right"></i>
              </button>
            </div>
          </div>
        </aside>

        <nav className="mobile-nav">
          {["map", "friends", "chat", "profile"].map((view) => (
            <button
              key={view}
              className={`nav-item ${activeView === view ? "active" : ""}`}
              onClick={() => switchView(view)}
            >
              <i
                className={`ph ${
                  view === "map"
                    ? "ph-map-trifold"
                    : view === "friends"
                    ? "ph-users"
                    : view === "chat"
                    ? "ph-chat-circle-text"
                    : "ph-user"
                }`}
              ></i>
              <span>{view.charAt(0).toUpperCase() + view.slice(1)}</span>
            </button>
          ))}
        </nav>
      </section>

      {/* Toast Container */}
      <div id="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <i
              className={`ph ${
                toast.type === "success"
                  ? "ph-check-circle"
                  : "ph-warning-circle"
              }`}
            ></i>
            <div className="toast-content">
              <span className="toast-title">{toast.title}</span>
              <span className="toast-msg">{toast.message}</span>
            </div>
            <div className="toast-progress"></div>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
