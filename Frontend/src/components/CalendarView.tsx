import { useState, useEffect, useRef } from "react";

const CalendarView = ({ memories, friendsMemories = [], onDateClick, onSave }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDateMemories, setSelectedDateMemories] = useState<any>(null);
  const [viewingMemory, setViewingMemory] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editedStory, setEditedStory] = useState("");

  // Combine memories with a flag
  const allMemories = [
    ...memories.map((m: any) => ({ ...m, isFriend: false })),
    ...friendsMemories.map((m: any) => ({ ...m, isFriend: true }))
  ];

  const handleMemoryClick = (memory: any) => {
    setViewingMemory(memory);
    setCurrentImageIndex(0);
    setEditedStory(memory.story || "");
    setIsEditingStory(false);
  };

  const handleNextImage = () => {
    if (viewingMemory?.images?.length) {
      setCurrentImageIndex((prev: any) => (prev + 1) % viewingMemory.images.length);
    }
  };

  const handlePrevImage = () => {
    if (viewingMemory?.images?.length) {
      setCurrentImageIndex((prev: any) => (prev - 1 + viewingMemory.images.length) % viewingMemory.images.length);
    }
  };

  const handleSaveStory = async () => {
    const updatedMemory = { ...viewingMemory, story: editedStory };
    
    // Update local state immediately
    setViewingMemory(updatedMemory);
    setIsEditingStory(false);
    
    const updatedList = selectedDateMemories.map((m: any) => 
      (m.id === viewingMemory.id || m._id === viewingMemory._id) ? updatedMemory : m
    );
    setSelectedDateMemories(updatedList);

    // Save to backend
    if (onSave) {
      await onSave(updatedMemory);
    }
  };
  
  const [months] = useState(() => {
    const today = new Date();
    const initialMonths = [];
    for (let i = -12; i <= 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      initialMonths.push(d);
    }
    return initialMonths;
  });

  // Scroll to current month after render
  useEffect(() => {
    const today = new Date();
    setTimeout(() => {
      const currentMonthEl = document.getElementById(`month-${today.getFullYear()}-${today.getMonth()}`);
      if (currentMonthEl) {
        currentMonthEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, []);

  const getDaysInMonth = (date: any) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    return { days, firstDay };
  };

  const getMemoriesForDate = (dateStr: any) => {
    return allMemories.filter((m: any) => {
        if (!m.date) return false;
        // If it's an exact match (YYYY-MM-DD)
        if (m.date === dateStr) return true;
        // If it's an ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
        if (m.date.startsWith(dateStr)) return true;
        // Try parsing as date object
        try {
            const d = new Date(m.date);
            if (isNaN(d.getTime())) return false;
            const dStr = d.toISOString().split('T')[0];
            return dStr === dateStr;
        } catch {
            return false;
        }
    });
  };

  return (
    <div className="calendar-view-container" ref={containerRef}>
      <div className="calendar-header-fixed">
        <h2>Your Journey Calendar</h2>
      </div>
      
      <div className="months-scroll-container">
        {months.map((monthDate: any, index: any) => {
          const { days, firstDay } = getDaysInMonth(monthDate);
          const monthName = monthDate.toLocaleString('default', { month: 'long' });
          const year = monthDate.getFullYear();
          const monthKey = `${year}-${monthDate.getMonth()}`;

          return (
            <div key={index} id={`month-${monthKey}`} className="month-block">
              <h3 className="month-title">{monthName} <span>{year}</span></h3>
              
              <div className="days-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="day-label">{d}</div>
                ))}
                
                {/* Empty slots for start of month */}
                {Array(firstDay).fill(null).map((_: any, i: any) => (
                  <div key={`empty-${i}`} className="day-cell empty"></div>
                ))}

                {/* Days */}
                {Array(days).fill(null).map((_: any, i: any) => {
                  const dayNum = i + 1;
                  // Format date as YYYY-MM-DD to match input type="date"
                  const dateStr = `${year}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayMemories = getMemoriesForDate(dateStr);
                  // const hasImages = dayMemories.some((m: any) => m.images && m.images.length > 0);
                  
                  // Prioritize own images for cover, then friends
                  const ownMemoryWithImage = dayMemories.find((m: any) => !m.isFriend && m.images && m.images.length > 0);
                  const friendMemoryWithImage = dayMemories.find((m: any) => m.isFriend && m.images && m.images.length > 0);
                  const coverImage = ownMemoryWithImage ? ownMemoryWithImage.images[0] : (friendMemoryWithImage ? friendMemoryWithImage.images[0] : null);
                  
                  const hasFriendMemory = dayMemories.some((m: any) => m.isFriend);
                  const hasOwnMemory = dayMemories.some((m: any) => !m.isFriend);

                  return (
                    <div 
                      key={dayNum} 
                      className={`day-cell ${dayMemories.length > 0 ? 'has-memory' : ''} ${hasFriendMemory && !hasOwnMemory ? 'friend-memory-only' : ''}`}
                      onClick={() => {
                        if (dayMemories.length > 0) {
                          setSelectedDateMemories(dayMemories);
                          onDateClick(dayMemories);
                        }
                      }}
                      style={coverImage ? { 
                          backgroundImage: `url(${coverImage})`,
                          border: friendMemoryWithImage && !ownMemoryWithImage ? '2px solid #3b82f6' : undefined
                      } : {}}
                    >
                      <span className="day-number">{dayNum}</span>
                      {dayMemories.length > 0 && !coverImage && (
                        <div className="memory-dot" style={{ backgroundColor: hasFriendMemory && !hasOwnMemory ? '#3b82f6' : undefined }}></div>
                      )}
                      {dayMemories.length > 0 && (
                        <div className="memory-count-badge">{dayMemories.length}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDateMemories && !viewingMemory && (
        <div className="calendar-entries-panel">
          <div className="entries-header">
            <h3>Entries</h3>
            <button className="close-entries-btn" onClick={() => setSelectedDateMemories(null)}>
              <i className="ph ph-x"></i>
            </button>
          </div>
          <div className="entries-list">
            {selectedDateMemories.map((memory: any) => (
              <div key={memory.id || memory._id} className={`entry-item ${memory.isFriend ? 'friend-entry' : ''}`} onClick={() => handleMemoryClick(memory)}>
                <div className="entry-info">
                  <h4 className="entry-date">
                    {new Date(memory.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {memory.isFriend && <span style={{fontSize: '0.8em', color: '#3b82f6', marginLeft: '8px'}}>(Friend)</span>}
                    {memory.id && !isNaN(new Date(memory.id).getTime()) && (
                      <> at {new Date(memory.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                    )}
                  </h4>
                  <p className="entry-text">{memory.story || memory.title}</p>
                </div>
                {memory.images && memory.images.length > 0 && (
                  <div className="entry-thumbnail">
                    <img src={memory.images[0]} alt="Memory" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewingMemory && (
        <div className="memory-detail-overlay">
          <div className="memory-detail-window">
            <button className="back-btn" onClick={() => setViewingMemory(null)}>
              <i className="ph ph-arrow-left"></i> Back to Entries
            </button>
            
            <div className="detail-content">
              <div className="detail-left">
                {viewingMemory.images && viewingMemory.images.length > 0 ? (
                  <div className="detail-carousel">
                    <div className="carousel-image" style={{ backgroundImage: `url(${viewingMemory.images[currentImageIndex]})` }}></div>
                    {viewingMemory.images.length > 1 && (
                      <>
                        <button className="carousel-nav prev" onClick={handlePrevImage}>
                          <i className="ph ph-caret-left"></i>
                        </button>
                        <button className="carousel-nav next" onClick={handleNextImage}>
                          <i className="ph ph-caret-right"></i>
                        </button>
                        <div className="carousel-dots">
                          {viewingMemory.images.map((_: any, idx: any) => (
                            <span key={idx} className={`dot ${idx === currentImageIndex ? 'active' : ''}`}></span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="no-images-placeholder">
                    <i className="ph ph-image"></i>
                    <p>No photos in this memory</p>
                  </div>
                )}
              </div>
              
              <div className="detail-right">
                <div className="detail-header">
                  <h3>{viewingMemory.title}</h3>
                  <span className="detail-date">{viewingMemory.date}</span>
                </div>
                
                <div className="story-container">
                  {isEditingStory ? (
                    <textarea 
                      value={editedStory} 
                      onChange={(e: any) => setEditedStory(e.target.value)}
                      className="story-editor"
                      autoFocus
                    />
                  ) : (
                    <p className="story-text">{viewingMemory.story || "No story written yet..."}</p>
                  )}
                </div>

                <div className="detail-actions">
                  {isEditingStory ? (
                    <>
                      <button className="save-story-btn" onClick={handleSaveStory}>
                        <i className="ph ph-check"></i> Save
                      </button>
                      <button className="cancel-edit-btn" onClick={() => setIsEditingStory(false)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="edit-story-btn" onClick={() => setIsEditingStory(true)}>
                      <i className="ph ph-pencil-simple"></i> Edit Story
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;

