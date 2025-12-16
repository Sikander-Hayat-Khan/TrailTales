

const Navbar = ({
  logo,
  setAuthMode,
  setAuthModalOpen,
  isProfileDropdownOpen,
  setProfileDropdownOpen,
  setProfileModalOpen,
  isLoggedIn,
  handleLogout,
  user,
}: any) => {
  return (
    <nav>
      <div className="logo">
        <img src={logo} alt="Logo" className="logo-img" />
        <span>TrailTales.</span>
      </div>

      <div className="nav-links">
        {!isLoggedIn && (
          <>
            <button
              className="btn-login"
              onClick={() => {
                setAuthMode("login");
                setAuthModalOpen(true);
              }}
              aria-label="Login"
            >
              Login
            </button>
            <button
              className="btn-signup"
              onClick={() => {
                setAuthMode("signup");
                setAuthModalOpen(true);
              }}
              aria-label="Sign Up"
            >
              Sign Up
            </button>
          </>
        )}

        <div className="profile-menu-container">
          <button
            className="btn-profile-header"
            onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
            aria-label="User Profile Menu"
            aria-expanded={isProfileDropdownOpen}
            aria-haspopup="true"
            style={isLoggedIn && user?.avatarColor ? { backgroundColor: user.avatarColor, border: "none" } : {}}
          >
            <i className="ph ph-user" style={{ fontSize: "1.2rem", color: isLoggedIn && user?.avatarColor ? "#fff" : "inherit" }}></i>
          </button>
          <div
            id="profile-dropdown"
            className={`profile-dropdown ${
              isProfileDropdownOpen ? "active" : ""
            }`}
            role="menu"
          >
            <div className="dropdown-info">
              <span className="user-name">
                {isLoggedIn && user 
                  ? (user.username.includes("@") ? user.username.split("@")[0] : user.username)
                  : "Guest User"}
              </span>
              <span className="user-email">{isLoggedIn && user ? user.email : "Guest@trailtales.com"}</span>
            </div>
            <hr />
            <button
              className="dropdown-item"
              onClick={() => {
                setProfileDropdownOpen(false);
                setProfileModalOpen(true);
              }}
              role="menuitem"
            >
              <i className="ph ph-user"></i> My Profile
            </button>
            <button 
              className="dropdown-item"
              onClick={(e: any) => {
                e.preventDefault();
                alert("Settings feature coming soon!");
              }}
              role="menuitem"
            >
              <i className="ph ph-gear"></i> Settings
            </button>
            <hr />
            {isLoggedIn && (
              <button 
                className="dropdown-item logout-link" 
                onClick={(e: any) => {
                  e.preventDefault();
                  handleLogout();
                }}
                role="menuitem"
              >
                <i className="ph ph-sign-out"></i> Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

