import { useState, useRef } from "react";

const MemoryModal = ({ isOpen, onClose, location, onSave, initialData }: any) => {
  const [title, setTitle] = useState(initialData?.title || "");
  // Use local date string YYYY-MM-DD
  const [date, setDate] = useState(() => {
    if (initialData?.date) return initialData.date;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [story, setStory] = useState(initialData?.story || "");
  const [mood, setMood] = useState(initialData?.mood || "happy");
  const [visibility, setVisibility] = useState(initialData?.visibility || "private");
  const [tags, setTags] = useState(initialData?.tags ? initialData.tags.join(", ") : "");
  const [images, setImages] = useState(initialData?.images || []); // Preview URLs
  const [imageFiles, setImageFiles] = useState<any[]>([]); // Actual File objects
  const [errors, setErrors] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: any) => {
    const files = Array.from(e.target.files);
    // Create local URLs for preview
    const newPreviews = files.map((file: any) => URL.createObjectURL(file));
    setImages([...images, ...newPreviews]);
    setImageFiles([...imageFiles, ...files]);
  };

  const handleSubmit = () => {
    const newErrors: any = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!date) newErrors.date = "Date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave({
      id: initialData?.id || initialData?._id, // Pass ID if editing
      location: location || initialData?.location,
      title,
      date,
      story,
      mood,
      visibility,
      tags: tags.split(",").map((t: any) => t.trim()).filter((t: any) => t),
      images, // These are previews/existing URLs
      imageFiles // These are new files to upload
    });
    
    onClose();
  };

  return (
    <div className="modal-overlay active" style={{ zIndex: 6000 }}>
      <div className="memory-modal-window">
        <button className="close-modal-btn" onClick={onClose}>
          <i className="ph ph-x"></i>
        </button>

        <div className="memory-header">
          <div className="location-badge">
            <i className="ph ph-map-pin"></i>
            <span>{location?.name || initialData?.location?.name || "New Memory"}</span>
          </div>
        </div>

        <div className="form-group">
          <label>
            Title 
            {errors.title && <span className="error-msg"><i className="ph ph-warning-circle"></i> {errors.title}</span>}
          </label>
          <input 
            type="text" 
            placeholder="Give this memory a name..." 
            value={title}
            onChange={(e: any) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({...errors, title: null});
            }}
            className={errors.title ? "input-error" : ""}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>
            Date
            {errors.date && <span className="error-msg"><i className="ph ph-warning-circle"></i> {errors.date}</span>}
          </label>
          <input 
            type="date" 
            value={date}
            onChange={(e: any) => {
              setDate(e.target.value);
              if (errors.date) setErrors({...errors, date: null});
            }}
            className={errors.date ? "input-error" : ""}
          />
        </div>

          <div className="form-group">
            <label>The Story</label>
            <textarea 
              placeholder="What happened here? Capture the moment..." 
              rows={4}
              value={story}
              onChange={(e: any) => setStory(e.target.value)}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Mood</label>
              <div className="mood-selector">
                {["happy", "adventurous", "peaceful", "romantic"].map((m: any) => (
                  <button 
                    key={m} 
                    className={`mood-btn ${mood === m ? "active" : ""}`}
                    onClick={() => setMood(m)}
                    title={m.charAt(0).toUpperCase() + m.slice(1)}
                  >
                    <i className={`ph ${
                      m === "happy" ? "ph-smiley" :
                      m === "adventurous" ? "ph-compass" :
                      m === "peaceful" ? "ph-coffee" : "ph-heart"
                    }`}></i>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group half">
              <label>Tags</label>
              <input 
                type="text" 
                placeholder="nature, food, hike..." 
                value={tags}
                onChange={(e: any) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <select 
              value={visibility} 
              onChange={(e: any) => setVisibility(e.target.value)}
              className="visibility-select"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #384959', background: '#1e2330', color: '#fff' }}
            >
              <option value="private">🔒 Private (Only Me)</option>
              <option value="friends">👥 Friends Only</option>
              <option value="public">🌍 Public (Everyone)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Photos</label>
            <div 
              className="image-upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              {images.length === 0 ? (
                <div className="upload-placeholder">
                  <i className="ph ph-image"></i>
                  <span>Click to upload photos</span>
                </div>
              ) : (
                <div className="image-preview-row">
                  {images.map((img: any, idx: any) => (
                    <div key={idx} className="img-preview" style={{backgroundImage: `url(${img})`}}></div>
                  ))}
                  <div className="add-more-btn">
                    <i className="ph ph-plus"></i>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                ref={fileInputRef} 
                style={{display: "none"}}
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <button className="save-memory-btn" onClick={handleSubmit}>
            <i className="ph ph-floppy-disk"></i> Save to Journal
          </button>
      </div>
    </div>
  );
};

export default MemoryModal;

