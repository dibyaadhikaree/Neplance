"use client";

import { useEffect, useRef, useState } from "react";
import { EverestLogo } from "../EverestLogo";

export const Header = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const hasBothRoles =
    user?.role?.includes("freelancer") && user?.role?.includes("client");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    // TODO: Navigate to profile page
    setShowDropdown(false);
  };

  const handleSwitchRole = () => {
    // TODO: Switch role logic
    setShowDropdown(false);
    console.log("Switching role...");
  };

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };

  return (
    <header className="header sticky top-0 z-10">
      <div className="header-content">
        <div className="header-brand-group">
          <EverestLogo className="header-logo" />
          <span className="header-brand">Neplance</span>
        </div>

        <div className="profile-menu" ref={dropdownRef}>
          <button
            type="button"
            className="profile-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="profile-name">{user?.name || "User"}</span>
          </button>

          {showDropdown && (
            <div className="profile-dropdown">
              <button
                type="button"
                className="dropdown-item"
                onClick={handleProfileClick}
              >
                My Profile
              </button>
              {hasBothRoles && (
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={handleSwitchRole}
                >
                  Switch Role
                </button>
              )}
              <button
                type="button"
                className="dropdown-item dropdown-item-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import { AvailableIcon, OngoingIcon, ProposedIcon } from "./TabNav";

// Mobile Menu Component
export const MobileMenu = ({ activeTab, onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTabClick = (tab) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  return (
    <div className="mobile-menu">
      <button
        type="button"
        className={`burger-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span className="burger-line" />
        <span className="burger-line" />
        <span className="burger-line" />
      </button>

      {isOpen && (
        <div className="mobile-menu-dropdown">
          <button
            type="button"
            className="mobile-menu-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>

          <button
            type="button"
            className={`mobile-menu-item ${activeTab === "available" ? "active" : ""}`}
            onClick={() => handleTabClick("available")}
          >
            <AvailableIcon /> Available Jobs
          </button>
          <button
            type="button"
            className={`mobile-menu-item ${activeTab === "proposed" ? "active" : ""}`}
            onClick={() => handleTabClick("proposed")}
          >
            <ProposedIcon /> Proposed
          </button>
          <button
            type="button"
            className={`mobile-menu-item ${activeTab === "ongoing" ? "active" : ""}`}
            onClick={() => handleTabClick("ongoing")}
          >
            <OngoingIcon /> Ongoing
          </button>
        </div>
      )}
    </div>
  );
};
