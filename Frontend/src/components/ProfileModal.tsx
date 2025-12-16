import { useState} from "react";
import api from "../api/axios";

const ProfileModal = ({ isOpen, onClose, user, setUser, handleToast }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || "Just a traveler exploring the world one pin at a time.");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || "#f28b50");

  const handleSave = async () => {
    try {
        const res = await api.patch("/profile", { bio, avatarColor });
        setUser(res.data.user);
        setIsEditing(false);
        handleToast("Success", "Profile updated successfully", "success");
    } catch (error: any) {
        handleToast("Error", "Failed to update profile", error.message);
    }
  };

  return (
    <div
      id="profile-modal-overlay"
      className={`modal-overlay ${isOpen ? "active" : ""}`}
      onClick={(e: any) => e.target.id === "profile-modal-overlay" && onClose()}
    >
      <div className="profile-modal-window">
        <button className="close-modal-btn" onClick={onClose}>
          <i className="ph ph-x"></i>
        </button>
        <div className="modal-header">
          <div className="avatar large-modal-avatar" style={{ background: avatarColor }}>
            <i className="ph ph-user" style={{ fontSize: "3rem" }}></i>
          </div>
          {isEditing && (
             <div style={{ margin: "10px 0" }}>
                 <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Avatar Color</label>
                 <input 
                    type="color" 
                    value={avatarColor} 
                    onChange={(e: any) => setAvatarColor(e.target.value)} 
                 />
             </div>
          )}
          <h2>{user ? user.username : "Guest User"}</h2>
          <p className="modal-email">{user ? user.email : "guest@trailtales.com"}</p>
          <div className="modal-badges">
            <span className="badge">Traveler</span>
          </div>
        </div>
        <div className="modal-stats">
          <div className="stat-box">
            <strong>{user?.pinsCount || 0}</strong>
            <span>Pins</span>
          </div>
        </div>
        <div className="modal-bio">
          <label>Bio</label>
          {isEditing ? (
            <textarea 
              value={bio} 
              onChange={(e: any) => setBio(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", color: "#000" }}
            />
          ) : (
            <p>{bio}</p>
          )}
        </div>
        {isEditing ? (
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button className="edit-profile-btn" onClick={handleSave} style={{ flex: 1 }}>Save</button>
            <button className="edit-profile-btn" onClick={() => setIsEditing(false)} style={{ flex: 1, background: "#ccc", color: "#333" }}>Cancel</button>
          </div>
        ) : (
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;

