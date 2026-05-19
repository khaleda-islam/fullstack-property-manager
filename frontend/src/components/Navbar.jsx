import logo from '../assets/Logo.jpeg';
import React, {useState} from 'react';
import { Link } from 'react-router-dom';

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../context/UserContext";

  const PUBLIC_NAV_ITEMS = [
  { path: "/",        icon: "bi-house",   label: "Home"              },
  { path: "/contact", icon: "bi-headset", label: "Technical Support" },
];

// Shown when logged in (resident & contractor)
const PRIVATE_NAV_ITEMS = [
  { path: "/",         icon: "bi-house",         label: "Home"              },
  { path: "/messages", icon: "bi-chat-dots",     label: "Messages"          },
  { path: "/contact",  icon: "bi-headset",       label: "Technical Support" },
  { path: "/profile",  icon: "bi-person-circle", label: "Profile"           },
];

// Shown when logged in as landlord — Home goes to welcome page
const LANDLORD_NAV_ITEMS = [
  { path: "/",         icon: "bi-house",         label: "Home"              },
  { path: "/messages", icon: "bi-chat-dots",     label: "Messages"          },
  { path: "/contact",  icon: "bi-headset",       label: "Technical Support" },
  { path: "/profile",  icon: "bi-person-circle", label: "Profile"           },
];

// Extra — shown only for landlords
const LANDLORD_NAV_ITEM = { path: "/landlord", icon: "bi-speedometer2", label: "My Dashboard" };
// Extra — shown only for residents
const RESIDENT_NAV_ITEM  = { path: "/resident",  icon: "bi-speedometer2", label: "My Dashboard" };

// Extra — shown only for contractors
const CONTRACTOR_NAV_ITEM = { path: "/contractor", icon: "bi-speedometer2", label: "My Dashboard" };

const ROLE_BADGES = {
  resident:   "success",
  landlord:   "primary",
  contractor: "warning",
};

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); //mobile menu state
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const { dbUser }   = useUser();
  const navigate     = useNavigate();
  const location     = useLocation();

  const isActive = (path) => {
      if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }
  // Build nav items based on role
  const getDashboardItem = () => {
    if (dbUser?.role === "landlord")    return LANDLORD_NAV_ITEM;
    if (dbUser?.role === "resident")    return RESIDENT_NAV_ITEM;
    if (dbUser?.role === "contractor")  return CONTRACTOR_NAV_ITEM;
    return null;
  };

  const dashboardItem = getDashboardItem();
  const navItems = isAuthenticated
    ? dashboardItem
      ? [...(dbUser?.role === "landlord" ? LANDLORD_NAV_ITEMS : PRIVATE_NAV_ITEMS), dashboardItem]
      : PRIVATE_NAV_ITEMS
    : PUBLIC_NAV_ITEMS;


    // function to toggle mobile menu
    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };


  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
      <div className="container-fluid">

        {/* Logo */}
        <span
          className="navbar-brand fw-bold"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img
    src={logo}
    alt="Logo"
    style={{ height: "30px", marginRight: "8px" }}
  />
          T6PMS
        </span>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          onClick={toggleMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="mainNav">

          {/* Nav links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <button
                  className={`nav-link btn btn-link text-white text-decoration-none ${isActive(item.path) ? "fw-bold border-bottom border-2 border-white" : "opacity-75"}`}
                  onClick={() => navigate(item.path)}
                >
                  <i className={`bi ${item.icon} me-1`} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated && dbUser ? (
              <>
                <div
                  className="d-flex align-items-center gap-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/profile")}
                >
                  <span className={`badge bg-${ROLE_BADGES[dbUser.role]}`}>
                    {dbUser?.role ? dbUser.role.charAt(0).toUpperCase() + dbUser.role.slice(1) : "Guest"};
                  </span>
                  <span className="text-white fw-semibold small">{dbUser.name}</span>
                </div>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  <i className="bi bi-box-arrow-right me-1" />Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => {
                    console.log("🔵 Sign In button clicked - Redirecting to Auth0...");
                    console.log("🔵 Config:", { authorizationParams: { screen_hint: "login" } });
                    console.log("⚠️ EXPECTED: Page will redirect away - no code after this will execute");
                    console.log("⚠️ After Auth0 login, you'll be redirected back and App.jsx useEffect will run");
                    
                    // This causes a browser redirect - execution stops here
                    loginWithRedirect({ authorizationParams: { screen_hint: "login" } });
                    
                    // ⚠️ THIS CODE NEVER RUNS - page redirects away before reaching here
                  }}
                >
                  <i className="bi bi-box-arrow-in-right me-1" />Sign In
                </button>
                <button
                  className="btn btn-light btn-sm fw-semibold"
                  onClick={() => {
                    console.log("🔵 Sign Up button clicked - Redirecting to Auth0...");
                    console.log("🔵 Config:", { authorizationParams: { screen_hint: "signup", prompt: "login" } });
                    console.log("⚠️ EXPECTED: Page will redirect away - no code after this will execute");
                    
                    // This causes a browser redirect - execution stops here
                    loginWithRedirect({ authorizationParams: { screen_hint: "signup", prompt: "login" } });
                    
                    // ⚠️ THIS CODE NEVER RUNS - page redirects away before reaching here
                  }}
                >
                  <i className="bi bi-person-plus me-1" />Sign Up
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
