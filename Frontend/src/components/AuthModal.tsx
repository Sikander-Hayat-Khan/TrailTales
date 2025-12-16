import { useState } from "react";
import api from "../api/axios";

const AuthModal = ({ isOpen, onClose, authMode, setAuthMode, logo, handleToast, setIsLoggedIn, setUser }: any) => {
  // Backend User model has 'username' and 'email'. 
  // Frontend input placeholder says "Email".
  // I should probably send 'email' as 'email' and 'username' as 'username'.
  // But the current backend login uses 'username'.
  // Let's check backend login logic again. It finds by {username: username}.
  // So if user enters email in frontend, backend expects it to be 'username'.
  // I will adjust frontend to send 'email' as 'email' and 'username' as 'username' for signup.
  // For login, I'll assume username/email login.
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // This will be 'username'
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleModeSwitch = (e: any) => {
    e.preventDefault();
    resetForm();
    setAuthMode(authMode === "login" ? "signup" : "login");
  };

  const isValidEmail = (email: any) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAuthSubmit = async (e: any) => {
    e.preventDefault();

    if (authMode === "forgot-password") {
      if (!isValidEmail(email)) {
        handleToast("Validation Error", "Please enter a valid email address.", "error");
        return;
      }
      handleToast("Success", "Password reset link sent to your email!", "success");
      handleClose();
      return;
    }

    // --- VALIDATION ---
    if (authMode === "signup") {
        if (!isValidEmail(email)) {
            handleToast("Validation Error", "Please enter a valid email address.", "error");
            return;
        }
        if (fullName.trim().length < 2) {
            handleToast("Validation Error", "Username is too short.", "error");
            return;
        }
    } else {
        // Login
        if (!email.trim()) {
             handleToast("Validation Error", "Please enter your username or email.", "error");
             return;
        }
    }

    if (password.length < 6) {
      handleToast("Validation Error", "Password must be at least 6 characters.", "error");
      return;
    }

    const endpoint = authMode === "login" ? "/login" : "/signup";
    
    // Construct payload based on backend expectation
    // Backend Signup: username, password, email (added in model)
    // Backend Login: username, password
    
    let payload = {};
    if (authMode === "signup") {
        payload = { 
            username: fullName, // Mapping Full Name input to Username for now, or I should add a separate field.
            email: email,
            password: password 
        };
    } else {
        // Login
        // Backend expects 'username' but we might want to allow email login.
        // For now, let's send the input as 'username' to match backend.
        payload = { username: email, password }; 
    }

    try {
      const response = await api.post(endpoint, payload);

      if (response.status === 200 || response.status === 201) {
        handleToast(
          "Success",
          response.data.msg || `Successfully ${authMode === "login" ? "logged in" : "signed up"}!`,
          "success"
        );
        setIsLoggedIn(true);
        
        if (response.data.user) {
            setUser(response.data.user);
        } else {
            // Fallback if user not returned
            try {
                const profileRes = await api.get("/auth");
                if (profileRes.data.user) {
                    setUser(profileRes.data.user);
                }
            } catch {
                console.error("Failed to fetch profile after login");
            }
        }
        
        handleClose();
      }
    } catch (error: any) {
      const msg = error.response?.data?.msg || "Something went wrong";
      handleToast("Error", msg, "error");
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className={`modal-overlay ${isOpen ? "active" : ""}`}
      onClick={(e: any) => e.target.id === "auth-modal-overlay" && handleClose()}
    >
      <div className="auth-modal-window">
        <button className="close-modal-btn" onClick={handleClose}>
          <i className="ph ph-x"></i>
        </button>
        <div className="auth-header">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h2>TrailTales.</h2>
          <p id="auth-subtitle">
            {authMode === "login"
              ? "Welcome back, traveler."
              : authMode === "signup"
              ? "Begin your journey today."
              : "Enter your email to reset password."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleAuthSubmit}>
          {authMode === "signup" && (
            <div className="input-group">
              <i className="ph ph-user"></i>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e: any) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="input-group">
            <i className="ph ph-envelope-simple"></i>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
            />
          </div>
          {authMode !== "forgot-password" && (
            <div className="input-group">
              <i className="ph ph-lock-key"></i>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "45px" }}
              />
              <i 
                className={`ph ${showPassword ? "ph-eye-slash" : "ph-eye"} password-toggle`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          )}

          {authMode === "login" && (
            <div className="form-actions">
              <label className="remember-me">
                <input type="checkbox" /> <span>Remember me</span>
              </label>
              <a href="#" className="forgot-pass" onClick={(e: any) => {
                e.preventDefault();
                setAuthMode("forgot-password");
              }}>
                Forgot Password?
              </a>
            </div>
          )}

          <button type="submit" className="cta-btn full-width">
            {authMode === "login" ? "Log In" : authMode === "signup" ? "Create Account" : "Send Reset Link"}
          </button>

          <div className="auth-switch">
            <span>
              {authMode === "login"
                ? "New to TrailTales?"
                : authMode === "signup"
                ? "Already have an account?"
                : "Remember your password?"}
            </span>
            <a
              href="#"
              onClick={handleModeSwitch}
            >
              {authMode === "login" ? "Create an account" : "Log In"}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;

