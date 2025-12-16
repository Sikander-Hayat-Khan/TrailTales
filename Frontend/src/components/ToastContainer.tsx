

const ToastContainer = ({ toasts }: any) => {
  return (
    <div id="toast-container">
      {toasts.map((toast: any) => (
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
  );
};

export default ToastContainer;

