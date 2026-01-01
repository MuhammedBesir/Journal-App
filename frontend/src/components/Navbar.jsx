import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          📔 Sevgili Ben
        </Link>

        <div className="navbar-menu">
          {user && (
            <>
              <Link to="/" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/calendar" className="navbar-link">
                Calendar
              </Link>
              <Link to="/analytics" className="navbar-link">
                Analytics
              </Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          <button
            onClick={toggleDarkMode}
            className="theme-toggle"
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {user && (
            <>
              <span className="user-name">Hello, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
