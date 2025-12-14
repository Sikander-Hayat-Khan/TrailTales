import React from "react";

const MemoryViewModal = ({ isOpen, onClose, memory, onEdit, onDelete, currentUser }) => {
  if (!isOpen || !memory) return null;

  const memoryOwnerId = typeof memory.userId === 'object' ? memory.userId._id : memory.userId;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwner = memoryOwnerId === currentUserId;
  
  const author = typeof memory.userId === 'object' ? memory.userId : null;

  return (
    <div className="modal-overlay active" style={{ zIndex: 6000 }}>
      <div className="memory-view-window">
        <button className="close-modal-btn" onClick={onClose}>
          <i className="ph ph-x"></i>
        </button>

        <div className="view-header">
          <div className="view-date-badge">
            <i className="ph ph-calendar-blank"></i>
            <span>{memory.date || "Unknown Date"}</span>
          </div>
          
          {isOwner ? (
            <div className="view-actions">
                <button className="delete-btn" onClick={() => onDelete(memory._id || memory.id)} title="Delete Memory">
                <i className="ph ph-trash"></i>
                </button>
                <button className="edit-btn" onClick={() => onEdit(memory)}>
                <i className="ph ph-pencil-simple"></i> Edit
                </button>
            </div>
          ) : (
             author && (
                <div className="view-author-badge">
                    <div className="author-avatar" style={{ backgroundColor: author.avatarColor || '#f28b50' }}>
                        {author.username?.charAt(0).toUpperCase()}
                    </div>
                    <span>{author.username}</span>
                </div>
             )
          )}
        </div>

        <div className="view-content">
          <h2 className="view-title">{memory.title}</h2>
          
          <div className="view-location">
            <i className="ph ph-map-pin"></i>
            <span>{memory.location?.name || "Unknown Location"}</span>
          </div>

          {memory.images && memory.images.length > 0 && (
            <div className="view-gallery">
              {memory.images.map((img, index) => (
                <div key={index} className="view-image-container">
                  <img src={img} alt={`Memory ${index + 1}`} />
                </div>
              ))}
            </div>
          )}

          <div className="view-body">
            <div className="view-mood">
              <span className="mood-label">Mood:</span>
              <span className={`mood-tag ${memory.mood}`}>
                {memory.mood === "happy" && <i className="ph ph-smiley"></i>}
                {memory.mood === "adventurous" && <i className="ph ph-compass"></i>}
                {memory.mood === "peaceful" && <i className="ph ph-coffee"></i>}
                {memory.mood === "romantic" && <i className="ph ph-heart"></i>}
                {memory.mood?.charAt(0).toUpperCase() + memory.mood?.slice(1)}
              </span>
            </div>

            <div className="view-story">
              <p>{memory.story}</p>
            </div>

            {memory.tags && memory.tags.length > 0 && (
              <div className="view-tags">
                {memory.tags.map((tag, i) => (
                  <span key={i} className="tag-pill">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryViewModal;
