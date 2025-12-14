import React, { useState, Suspense, lazy, useEffect } from "react";
import MapComponent from "./MapComponent";
import Sidebar from "./Sidebar";
import api from "../api/axios";

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
}) => {
  const [friends, setFriends] = useState([]);
  const [chatTitle, setChatTitle] = useState("Chat");
  const [selectedFriend, setSelectedFriend] = useState(null);
  
  // Memory Modal State
  const [isMemoryModalOpen, setMemoryModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [memories, setMemories] = useState([]);
  const [friendsMemories, setFriendsMemories] = useState([]);
  const [showFriendsMemories, setShowFriendsMemories] = useState(false);
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState(null);

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

  // Poll for friends memories when toggle is active
  useEffect(() => {
    let interval;
    if (user && showFriendsMemories) {
        const fetchFriendsMemories = async () => {
            try {
                const res = await api.get("/memories/friends");
                // Only update if data changed to avoid unnecessary re-renders? 
                // React state updates are cheap if reference is same, but here it's new array.
                // For now, just update.
                setFriendsMemories(res.data.memories);
            } catch (error) {
                console.error("Polling friends memories failed", error);
            }
        };

        // Initial fetch immediately when toggled on
        fetchFriendsMemories();

        // Poll every 5 seconds
        interval = setInterval(fetchFriendsMemories, 5000);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [user, showFriendsMemories]);

  const switchView = (viewName) => {
    setActiveView(viewName);
  };

  const openChatWith = (friend) => {
    setChatTitle("Chat with " + friend.name);
    setSelectedFriend(friend);
    switchView("chat");
  };

  const handleOpenMemoryModal = async (lat, lng) => {
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
        setSelectedLocation(prev => ({ ...prev, name: placeName }));
      } else {
        setSelectedLocation(prev => ({ ...prev, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      setSelectedLocation(prev => ({ ...prev, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
    }
  };

  const handleViewMemory = (memory) => {
    setSelectedMemory(memory);
    setViewModalOpen(true);
  };

  const handleEditMemory = (memory) => {
    setViewModalOpen(false);
    setSelectedMemory(memory);
    setSelectedLocation(memory.location);
    setMemoryModalOpen(true);
  };

  const handleSaveMemory = async (memoryData) => {
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
            memoryData.tags.forEach(tag => formData.append("tags", tag));
        }

        // Append new image files
        if (memoryData.imageFiles && memoryData.imageFiles.length > 0) {
            memoryData.imageFiles.forEach(file => {
                formData.append("images", file);
            });
        }

        // Append existing images (URLs)
        // Filter out blob URLs (which start with blob:) as they are local previews of new files
        // We only want to keep http/https URLs which are existing images
        if (memoryData.images && memoryData.images.length > 0) {
            memoryData.images.forEach(img => {
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
            setMemories(memories.map(m => (m._id === id || m.id === id) ? res.data.memory : m));
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
        }
    } catch (error) {
        handleToast("Error", "Failed to save memory", "error");
        console.error(error);
    }
  };

  const handleDeleteMemory = (id) => {
    const memory = memories.find(m => m._id === id || m.id === id);
    setMemoryToDelete(memory);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (memoryToDelete) {
      try {
          const id = memoryToDelete._id || memoryToDelete.id;
          await api.delete(`/memories/${id}`);
          setMemories(memories.filter(m => m._id !== id && m.id !== id));
          setDeleteModalOpen(false);
          setViewModalOpen(false);
          setMemoryToDelete(null);
          handleToast("Success", "Memory deleted successfully", "success");
      } catch (error) {
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
          {["map", "calendar", "friends", "chat", "profile"].map((view) => (
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
                    : view === "calendar"
                    ? "ph-calendar-blank"
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
      )}

      {activeView === "calendar" ? (
        <Suspense fallback={<div className="loading-spinner">Loading Calendar...</div>}>
          <CalendarView 
            memories={memories} 
            friendsMemories={showFriendsMemories ? friendsMemories : []}
            onDateClick={(dateMemories) => {
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
      />

      <nav className="mobile-nav">
        {["map", "calendar", "friends", "chat", "profile"].map((view) => (
          <button
            key={view}
            className={`nav-item ${activeView === view ? "active" : ""}`}
            onClick={() => switchView(view)}
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
            <span>{view.charAt(0).toUpperCase() + view.slice(1)}</span>
          </button>
        ))}
      </nav>
    </section>
  );
};

export default Dashboard;
