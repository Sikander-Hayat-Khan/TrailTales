

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, memoryTitle }: any) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" style={{ zIndex: 7000 }}>
      <div className="delete-confirm-window">
        <div className="delete-icon-wrapper">
          <i className="ph ph-trash"></i>
        </div>
        <h3>Delete Memory?</h3>
        <p>
          Are you sure you want to delete <strong>"{memoryTitle}"</strong>? 
          This action cannot be undone.
        </p>
        <div className="delete-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-delete-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

