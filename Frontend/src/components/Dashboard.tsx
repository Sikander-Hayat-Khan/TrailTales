import { useState, Suspense, lazy, useEffect } from "react";
import MapComponent from "./MapComponent";
import Sidebar from "./Sidebar";
import api from "../api/axios";
import "./NotificationStyles.css";

const MemoryModal = lazy(() => import("./MemoryModal"));
const MemoryViewModal = lazy(() => import("./MemoryViewModal"));
const DeleteConfirmationModal = lazy(() => import("./DeleteConfirmationModal"));
const CalendarView = lazy(() => import("./CalendarView"));

const Dashboard = ({
  isDashboardOpen,
  setDashboardOpen,
  activeView,
  setActiveView,
  handleToast,
  user
}: any) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [chatTitle, setChatTitle] = useState("Chat");
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  
  // Memory Modal State
  const [isMemoryModalOpen, setMemoryModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [friendsMemories, setFriendsMemories] = useState<any[]>([]);
  const [showFriendsMemories, setShowFriendsMemories] = useState(false);
  
  // Notification Counts
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<any>(null);

  // Fetch Memories on Mount or User Change
  useEffect(() => {
    if (user) {
      const fetchMemories = async () => {
        try {
          const [myMemoriesRes, friendsMemoriesRes] = await Promise.all([
            api.get("/memories"),
            api.get("/memories/friends")
          ]);
          setMemories(myMemoriesRes.data.memories);
          setFriendsMemories(friendsMemoriesRes.data.memories);
        } catch {
          console.error("Failed to fetch memories");
        }
      };
      fetchMemories();
    } 
    return () => {
      setMemories([]);
      setFriendsMemories([]);
    };
  }, [user]);

  // Poll for friends memories and notifications
  useEffect(() => {
    let interval: any;
    if (user) {
        const fetchData = async () => {
            try {
                // Fetch notifications (always)
                const notifRes = await api.get("/notifications/unread-counts");
                setUnreadMessagesCount(notifRes.data.unreadMessages);
                setPendingRequestsCount(notifRes.data.pendingRequests);

                // Fetch friends memories (only if toggle is on)
                if (showFriendsMemories) {
                    const res = await api.get("/memories/friends");
                    setFriendsMemories(res.data.memories);
                }
            } catch (error: any) {
                console.error("Polling failed", error);
            }
        };

        // Initial fetch
        fetchData();

        // Poll every 5 seconds
        interval = setInterval(fetchData, 5000);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [user, showFriendsMemories]);

  const switchView = (viewName: any) => {
    setActiveView(viewName);
  };

  const openChatWith = async (friend: any) => {
    setChatTitle("Chat with " + friend.name);
    setSelectedFriend(friend);
    switchView("chat");
    
    // Optimistically update friends list to remove badge
    setFriends(prevFriends => prevFriends.map((f: any) => 
        (f.id === friend.id || f._id === friend.id) ? { ...f, unreadCount: 0 } : f
    ));
    
    // Mark messages as read when opening chat
    try {
        await api.post("/messages/read", { friendId: friend._id || friend.id });
        // Optimistically update count (though polling will fix it eventually)
        // We don't know exactly how many unread from THIS friend, but we can trigger a refetch
        const notifRes = await api.get("/notifications/unread-counts");
        setUnreadMessagesCount(notifRes.data.unreadMessages);
    } catch (error: any) {
        console.error("Failed to mark messages as read", error);
    }
  };

  const handleOpenMemoryModal = async (lat: any, lng: any) => {
    if (!user) {
        handleToast("Info", "Please login to save memories.", "info");
        return;
    }
    // Reset selected memory for new entry
    setSelectedMemory(null);
    // Set initial state with coordinates and loading text
    setSelectedLocation({ lat, lng, name: "Fetching location..." });
    setMemoryModalOpen(true);

    try {
      const apiKey = "v4vwdmxWVeQdVFt5xcEl";
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${apiKey}`
      );
      const data = await response.json();
      
      if (data && data.features && data.features.length > 0) {
        // Get the most relevant place name
        const placeName = data.features[0].place_name;
        setSelectedLocation((prev: any) => ({ ...prev, name: placeName }));
      } else {
        setSelectedLocation((prev: any) => ({ ...prev, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
      }
    } catch (error: any) {
      console.error("Error fetching location name:", error);
      setSelectedLocation((prev: any) => ({ ...prev, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
    }
  };

  const handleViewMemory = (memory: any) => {
    setSelectedMemory(memory);
    setViewModalOpen(true);
  };

  const handleEditMemory = (memory: any) => {
    setViewModalOpen(false);
    setSelectedMemory(memory);
    setSelectedLocation(memory.location);
    setMemoryModalOpen(true);
  };

  const handleSaveMemory = async (memoryData: any) => {
    try {
        const formData = new FormData();
        
        // Append basic fields
        formData.append("title", memoryData.title);
        formData.append("date", memoryData.date);
        formData.append("story", memoryData.story);
        formData.append("mood", memoryData.mood);
        formData.append("visibility", memoryData.visibility || "private");
        
        // Append location (as JSON string for backend parsing)
        formData.append("location", JSON.stringify(memoryData.location));
        
        // Append tags
        if (memoryData.tags && memoryData.tags.length > 0) {
            memoryData.tags.forEach((tag: any) => formData.append("tags", tag));
        }

        // Append new image files
        if (memoryData.imageFiles && memoryData.imageFiles.length > 0) {
            memoryData.imageFiles.forEach((file: any) => {
                formData.append("images", file);
            });
        }

        // Append existing images (URLs)
        // Filter out blob URLs (which start with blob:) as they are local previews of new files
        // We only want to keep http/https URLs which are existing images
        if (memoryData.images && memoryData.images.length > 0) {
            memoryData.images.forEach((img: any) => {
                if (!img.startsWith("blob:")) {
                    formData.append("existingImages", img);
                }
            });
        }

        if (memoryData.id || memoryData._id) {
            // Update existing memory
            const id = memoryData.id || memoryData._id;
            const res = await api.patch(`/memories/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMemories(memories.map((m: any) => (m._id === id || m.id === id) ? res.data.memory : m));
            handleToast("Success", "Memory updated successfully!", "success");
            
            // If we were editing, show the view modal again with updated data
            if (selectedMemory) {
                setSelectedMemory(res.data.memory);
                setViewModalOpen(true);
            }
        } else {
            // Create new memory
            const res = await api.post("/memories", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMemories([res.data.memory, ...memories]);
            handleToast("Success", "Memory saved to your journal!", "success");
            
            // Refresh user profile to update stats in App.js (if user prop is passed down from App)
            // Since we can't easily update App.js state from here without a prop, 
            // we rely on the fact that Sidebar uses 'stats' prop which is calculated from 'memories'.
            // However, ProfileModal uses 'user' object. We should ideally update the user object in App.js.
            // For now, let's just rely on the next page refresh or profile open to fetch fresh stats.
        }
    } catch (error: any) {
        handleToast("Error", "Failed to save memory", "error");
        console.error(error);
    }
  };

  const handleDeleteMemory = (id: any) => {
    const memory = memories.find((m: any) => m._id === id || m.id === id);
    setMemoryToDelete(memory);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (memoryToDelete) {
      try {
          const id = memoryToDelete._id || memoryToDelete.id;
          await api.delete(`/memories/${id}`);
          setMemories(memories.filter((m: any) => m._id !== id && m.id !== id));
          setDeleteModalOpen(false);
          setViewModalOpen(false);
          setMemoryToDelete(null);
          handleToast("Success", "Memory deleted successfully", "success");
      } catch (error: any) {
          handleToast("Error", "Failed to delete memory", error.message);
      }
    }
  };

  return (
    <section id="dashboard-view" className={isDashboardOpen ? "active" : ""}>
      <Suspense fallback={null}>
        {isMemoryModalOpen && (
          <MemoryModal 
            isOpen={isMemoryModalOpen}
            onClose={() => {
              setMemoryModalOpen(false);
              setSelectedMemory(null);
            }}
            location={selectedLocation}
            onSave={handleSaveMemory}
            initialData={selectedMemory}
          />
        )}

        {isViewModalOpen && (
          <MemoryViewModal
            isOpen={isViewModalOpen}
            onClose={() => setViewModalOpen(false)}
            memory={selectedMemory}
            onEdit={handleEditMemory}
            onDelete={handleDeleteMemory}
            currentUser={user}
          />
        )}

        {isDeleteModalOpen && (
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={executeDelete}
            memoryTitle={memoryToDelete?.title}
          />
        )}
      </Suspense>

      <button
        className="back-home-btn"
        onClick={() => {
          if (activeView === "calendar") {
            setActiveView("map");
          } else {
            setDashboardOpen(false);
            setActiveView("map");
            setMemoryModalOpen(false);
          }
        }}
      >
        <i className={`ph ${activeView === "calendar" ? "ph-arrow-left" : "ph-arrow-down"}`}></i> Back
      </button>

      {/* Desktop Nav Rail */}
      {activeView !== "calendar" && (
        <div className="desktop-nav-rail">
          {["map", "calendar", "friends", "chat", "profile"].map((view: any) => (
            <button
              key={view}
              className={`desk-nav-item ${activeView === view ? "active" : ""}`}
              onClick={() => switchView(view)}
              data-tooltip={view.charAt(0).toUpperCase() + view.slice(1)}
              style={{ position: 'relative' }}
            >
              <i
                className={`ph ${
                  view === "map"
                    ? "ph-map-trifold"
                    : view === "calendar"
                    ? "ph-calendar-blank"
                    : view === "friends"
                    ? "ph-users"
                    : view === "chat"
                    ? "ph-chat-circle-text"
                    : "ph-user"
                }`}
              ></i>
              {view === "friends" && pendingRequestsCount > 0 && (
                <span className="notification-dot"></span>
              )}
              {view === "chat" && unreadMessagesCount > 0 && (
                <span className="notification-dot"></span>
              )}
            </button>
          ))}
        </div>
      )}

      {activeView === "calendar" ? (
        <Suspense fallback={<div className="loading-spinner">Loading Calendar...</div>}>
          <CalendarView 
            memories={memories} 
            friendsMemories={friendsMemories}
            onDateClick={(dateMemories: any) => {
              handleToast("Memories", `Found ${dateMemories.length} memories on this date`, "info");
            }}
            onSave={handleSaveMemory}
          />
        </Suspense>
      ) : (
        <MapComponent
          activeView={activeView}
          onMapClick={() => setActiveView("map")}
          isDashboardOpen={isDashboardOpen}
          onOpenMemory={handleOpenMemoryModal}
          onMemoryClick={handleViewMemory}
          memories={showFriendsMemories ? [...memories, ...friendsMemories] : memories}
          user={user}
          showFriendsMemories={showFriendsMemories}
          setShowFriendsMemories={setShowFriendsMemories}
        />
      )}

      <Sidebar
        activeView={activeView}
        friends={friends}
        setFriends={setFriends}
        chatTitle={chatTitle}
        openChatWith={openChatWith}
        handleToast={handleToast}
        user={user}
        selectedFriend={selectedFriend}
        stats={{
            pins: memories.length
        }}
      />

      <nav className="mobile-nav">
        {["map", "calendar", "friends", "chat", "profile"].map((view: any) => (
          <button
            key={view}
            className={`nav-item ${activeView === view ? "active" : ""}`}
            onClick={() => switchView(view)}
            style={{ position: 'relative' }}
          >
            <i
              className={`ph ${
                view === "map"
                  ? "ph-map-trifold"
                  : view === "calendar"
                  ? "ph-calendar-blank"
                  : view === "friends"
                  ? "ph-users"
                  : view === "chat"
                  ? "ph-chat-circle-text"
                  : "ph-user"
              }`}
            ></i>
            {view === "friends" && pendingRequestsCount > 0 && (
              <span className="notification-dot" style={{top: '5px', right: '25%'}}></span>
            )}
            {view === "chat" && unreadMessagesCount > 0 && (
              <span className="notification-dot" style={{top: '5px', right: '25%'}}></span>
            )}
            <span>{view.charAt(0).toUpperCase() + view.slice(1)}</span>
          </button>
        ))}
      </nav>
    </section>
  );
};

export default Dashboard;

