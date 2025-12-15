import React, { useState, useEffect, Suspense, lazy } from "react";
import "@phosphor-icons/web/regular";
import "./App.css";
import api from "./api/axios";

// Components
import Navbar from "./components/Navbar";
import LandingSection from "./components/LandingSection";
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal";
import ToastContainer from "./components/ToastContainer";

// Lazy Load Dashboard
const Dashboard = lazy(() => import("./components/Dashboard"));

// Images
import bookLogo from "./assets/book.png";

function App() {
  // --- STATE MANAGEMENT ---
  const [isDashboardOpen, setDashboardOpen] = useState(false);
  const [activeView, setActiveView] = useState("map");

  // Auth & Profile Modals
  const [authMode, setAuthMode] = useState("login");
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // --- EFFECTS ---
  useEffect(() => {
    if (isDashboardOpen) {
      document.body.classList.add("dashboard-open");
    } else {
      document.body.classList.remove("dashboard-open");
    }
  }, [isDashboardOpen]);

  // Check Auth Status on Mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth");
        if (res.status === 200) {
          setIsLoggedIn(true);
          // Fetch full profile to get stats
          try {
              const profileRes = await api.get("/profile");
              setUser(profileRes.data.user);
          } catch (e) {
              // Fallback to basic user info if profile fetch fails
              setUser(res.data.user);
          }
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  // --- HANDLERS ---
  const handleToast = (title, message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleLogout = async () => {
    try {
      await api.get("/logout");
      setIsLoggedIn(false);
      setUser(null);
      setProfileDropdownOpen(false);
      handleToast("Success", "Logged out successfully", "success");
    } catch (error) {
      handleToast("Error", "Logout failed", "error");
    }
  };

  return (
    <>
      <section id="landing-view">
        <Navbar
          logo={bookLogo}
          setAuthMode={setAuthMode}
          setAuthModalOpen={setAuthModalOpen}
          isProfileDropdownOpen={isProfileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          setProfileModalOpen={setProfileModalOpen}
          isLoggedIn={isLoggedIn}
          handleLogout={handleLogout}
          user={user}
        />

        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={user}
          setUser={setUser}
          handleToast={handleToast}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setAuthModalOpen(false)}
          authMode={authMode}
          setAuthMode={setAuthMode}
          logo={bookLogo}
          handleToast={handleToast}
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />

        <LandingSection setDashboardOpen={setDashboardOpen} />
      </section>

      <Suspense fallback={<div className="loading-screen">Loading Dashboard...</div>}>
        <Dashboard
          isDashboardOpen={isDashboardOpen}
          setDashboardOpen={setDashboardOpen}
          activeView={activeView}
          setActiveView={setActiveView}
          handleToast={handleToast}
          user={user}
        />
      </Suspense>

      <ToastContainer toasts={toasts} />
    </>
  );
}

export default App;