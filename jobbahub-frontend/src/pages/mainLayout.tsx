import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="main-layout">
      <header className="site-header">
        <div
          className="container header-inner"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Left Navigation */}
          <nav
            className="nav-links"
            style={{
              display: "flex",
              gap: "30px",
              justifyContent: "flex-start",
            }}
          >
            <Link
              to="/modules"
              className="nav-link"
              style={{ color: "#a855f7" }}
            >
              Keuzemodules
            </Link>
            <Link to="/about" className="nav-link" style={{ color: "#a855f7" }}>
              About
            </Link>
          </nav>

          {/* Center Logo */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <h1
              className="logo"
              style={{
                fontSize: "1.8rem",
                textAlign: "center",
              }}
            >
              Jobbahub
            </h1>
          </Link>

          {/* Right Navigation */}
          <nav
            className="nav-links"
            style={{
              display: "flex",
              gap: "30px",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="nav-link"
                  style={{ color: "#a855f7" }}
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="nav-link"
                  style={{ color: "#a855f7" }}
                >
                  Dashboard
                </Link>
                <button onClick={logout} className="btn btn-logout">
                  Uitloggen
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="page-content container">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          &copy; {new Date().getFullYear()} Jobbahub
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
