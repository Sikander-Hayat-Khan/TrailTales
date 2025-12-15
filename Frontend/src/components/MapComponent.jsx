import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import api from "../api/axios";

const MapComponent = ({ onMapClick, isDashboardOpen, activeView, onOpenMemory, onMemoryClick, memories, user, showFriendsMemories, setShowFriendsMemories }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const activeViewRef = useRef(activeView);
  const onOpenMemoryRef = useRef(onOpenMemory);
  const onMemoryClickRef = useRef(onMemoryClick);
  const markersRef = useRef([]);
  const friendLocationMarkersRef = useRef([]); // New ref for friend location markers
  const userRef = useRef(user);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [friendsLocations, setFriendsLocations] = useState([]); // State for friends' live locations

  // Poll for friends' locations if toggle is on
  useEffect(() => {
      let interval;
      if (showFriendsMemories && user) {
          const fetchLocations = async () => {
              try {
                  const res = await api.get("/friends");
                  // Filter friends who are sharing location and have a valid location
                  const locations = res.data.friends
                      .filter(f => f.isLocationShared && f.lastLocation && f.lastLocation.lat)
                      .map(f => ({
                          id: f._id,
                          username: f.username,
                          avatarColor: f.avatarColor,
                          lat: f.lastLocation.lat,
                          lng: f.lastLocation.lng,
                          timestamp: f.lastLocation.timestamp
                      }));
                  setFriendsLocations(locations);
              } catch (error) {
                  console.error("Failed to fetch friend locations", error);
              }
          };
          
          fetchLocations();
          interval = setInterval(fetchLocations, 10000); // Poll every 10s
      } else {
          setFriendsLocations([]);
      }
      return () => clearInterval(interval);
  }, [showFriendsMemories, user]);

  // Render Friend Location Markers
  useEffect(() => {
      if (!mapInstanceRef.current) return;

      // Clear existing location markers
      friendLocationMarkersRef.current.forEach(marker => marker.remove());
      friendLocationMarkersRef.current = [];

      friendsLocations.forEach(friend => {
          const icon = L.divIcon({
              className: "friend-location-pin",
              html: `
                <div style="
                    background-color: ${friend.avatarColor || '#3498db'};
                    width: 30px; height: 30px; border-radius: 50%; border: 2px solid white;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    color: white; font-weight: bold; font-size: 12px;
                ">
                    ${friend.username.charAt(0).toUpperCase()}
                </div>
                <div style="
                    position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%);
                    width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent;
                    border-top: 6px solid white;
                "></div>
              `,
              iconSize: [30, 36],
              iconAnchor: [15, 36],
              popupAnchor: [0, -36]
          });

          const marker = L.marker([friend.lat, friend.lng], { icon })
              .addTo(mapInstanceRef.current)
              .bindPopup(`<b>${friend.username}</b><br>Last seen: ${new Date(friend.timestamp).toLocaleTimeString()}`);
          
          friendLocationMarkersRef.current.push(marker);
      });

  }, [friendsLocations]);

  // Keep refs in sync with props
  useEffect(() => {
    activeViewRef.current = activeView;
  }, [activeView]);

  useEffect(() => {
    onOpenMemoryRef.current = onOpenMemory;
  }, [onOpenMemory]);

  useEffect(() => {
    onMemoryClickRef.current = onMemoryClick;
  }, [onMemoryClick]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Effect to handle map clicks and reset view
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const clickHandler = () => {
      if (onMapClick) onMapClick();
    };

    map.on("click", clickHandler);

    return () => {
      map.off("click", clickHandler);
    };
  }, [onMapClick]);

  // Effect to close popup when dashboard is closed
  useEffect(() => {
    if (!isDashboardOpen && mapInstanceRef.current) {
      mapInstanceRef.current.closePopup();
    }
  }, [isDashboardOpen]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Init Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      minZoom: 3,
      maxZoom: 18,
    }).setView([40.4168, -3.7038], 6);

    // Option 1: MapTiler with 2x scaling for larger labels
    L.tileLayer(
      "https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.jpg?key=v4vwdmxWVeQdVFt5xcEl",
      {
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 20,
        tileSize: 512, // Scale up tiles to increase label size (2x magnification)
        zoomOffset: -1, 
      }
    ).addTo(map);

    // Option 2: CartoDB Voyager (Alternative provider with clear labels)
    // L.tileLayer(
    //   "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    //   {
    //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    //     subdomains: 'abcd',
    //     maxZoom: 20
    //   }
    // ).addTo(map);

    // Custom Icon
    const pinIcon = L.divIcon({
      className: "custom-pin-container",
      html: `
        <div class="pin-pulse"></div>
        <div class="pin-core"></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
    });

    // Store icon in map instance for reuse
    map.pinIcon = pinIcon;

    // Handle Map Clicks (New Pin)
    map.on("click", function (e) {
      // If a panel is open (activeView is not 'map'), don't open popup
      if (activeViewRef.current !== "map") return;

      const { lat, lng } = e.latlng;
      
      // Open the Memory Modal instead of Leaflet popup
      if (onOpenMemoryRef.current) {
        onOpenMemoryRef.current(lat, lng);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when memories change
  useEffect(() => {
    if (!mapInstanceRef.current || !memories) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const pinIcon = mapInstanceRef.current.pinIcon;

    // Define Friend Pin Icon
    const friendPinIcon = L.divIcon({
      className: "custom-pin-container",
      html: `
        <div class="friend-pin-pulse"></div>
        <div class="friend-pin-core"></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
    });

    memories.forEach((memory) => {
      // Handle both old format (coords array) and new format (location object)
      let lat, lng;
      if (memory.location && typeof memory.location === 'object') {
        lat = memory.location.lat;
        lng = memory.location.lng;
      } else if (memory.coords) {
        [lat, lng] = memory.coords;
      } else {
        return; // Skip invalid memory
      }

      // Determine if it's a friend's memory
      const memoryUserId = typeof memory.userId === 'object' ? memory.userId._id : memory.userId;
      const currentUserId = userRef.current?._id || userRef.current?.id;
      
      // Robust comparison using String() to handle ObjectId vs String mismatches
      const isFriendMemory = memoryUserId && currentUserId && String(memoryUserId) !== String(currentUserId);
      
      const iconToUse = isFriendMemory ? friendPinIcon : pinIcon;

      const marker = L.marker([lat, lng], { icon: iconToUse })
        .addTo(mapInstanceRef.current);
      
      // Add click handler to open view modal
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e); // Prevent map click
        if (onMemoryClickRef.current) {
          onMemoryClickRef.current(memory);
        }
      });
      
      markersRef.current.push(marker);
    });
  }, [memories, user]);

  // Current Location Logic

  // Current Location Logic
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // If user has location sharing on, update backend
        if (userRef.current?.isLocationShared) {
            try {
                await api.patch("/profile", { 
                    location: { lat: latitude, lng: longitude } 
                });
            } catch (e) {
                console.error("Failed to update live location", e);
            }
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, {
            duration: 2,
          });
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  // Search Logic
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
        const apiKey = "v4vwdmxWVeQdVFt5xcEl";
        const response = await fetch(
            `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${apiKey}&limit=5`
        );
        const data = await response.json();
        setSearchResults(data.features || []);
    } catch (error) {
        console.error("Search error:", error);
    } finally {
        setIsSearching(false);
    }
  };

  const handleSelectResult = (result) => {
      const [lng, lat] = result.center;
      if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 14, {
              duration: 2
          });
      }
      setSearchResults([]);
      setSearchQuery(""); 
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div 
            className={`map-search-container ${activeView !== 'map' ? 'hidden' : ''}`}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <form onSubmit={handleSearch} role="search">
                <button 
                    type="button" 
                    className="location-btn"
                    onClick={handleCurrentLocation}
                    disabled={isLocating}
                    title="Go to my location"
                    aria-label="Go to my current location"
                >
                    <i className={`ph ${isLocating ? "ph-spinner" : "ph-crosshair"}`}></i>
                </button>
                <input 
                    type="text" 
                    placeholder={isSearching ? "Searching..." : "Search places..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSearching}
                    aria-label="Search places"
                />
                {searchQuery && !isSearching && (
                    <button 
                        type="button" 
                        className="clear-search" 
                        onClick={() => {setSearchQuery(''); setSearchResults([])}}
                        aria-label="Clear search"
                    >
                        <i className="ph ph-x"></i>
                    </button>
                )}
                
                <div style={{ width: '1px', height: '24px', background: '#e0e0e0', margin: '0 10px' }}></div>
                
                <button
                    type="button"
                    className={`friends-toggle-btn ${showFriendsMemories ? 'active' : ''}`}
                    onClick={() => setShowFriendsMemories(!showFriendsMemories)}
                    title={showFriendsMemories ? "Hide Friends' Memories" : "Show Friends' Memories"}
                    aria-label="Toggle friends memories"
                >
                    <i className="ph ph-users"></i>
                </button>
            </form>
            {searchResults.length > 0 && (
                <div className="search-results" role="listbox">
                    {searchResults.map(result => (
                        <div 
                            key={result.id} 
                            className="search-result-item" 
                            onClick={() => handleSelectResult(result)}
                            role="option"
                            tabIndex="0"
                            onKeyPress={(e) => e.key === 'Enter' && handleSelectResult(result)}
                        >
                            <i className="ph ph-map-pin"></i>
                            <span>{result.place_name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
        <div id="map" ref={mapContainerRef}></div>
    </div>
  );
};

export default MapComponent;
