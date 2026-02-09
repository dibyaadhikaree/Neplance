"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
// import { setAuthCookies } from "../../utils/auth-cookies";
import { EverestLogo } from "../EverestLogo";

export const Header = ({ user, onLogout, onRoleSwitch }) => {
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

  const router = useRouter();
  const pathname = usePathname();

  const handleProfileClick = () => {
    router.push("/profile");
    setShowDropdown(false);
  };

  const handleSwitchRole = () => {
    setShowDropdown(false);

    // Determine the new role
    const currentRole = user?.role?.[0] || "freelancer";
    const newRole = currentRole === "freelancer" ? "client" : "freelancer";

    // Update user with new role (first in array)
    const updatedUser = {
      ...user,
      role: [newRole, ...user.role.filter((r) => r !== newRole)],
    };

    // Update cookies with the new user data
    const token =
      localStorage.getItem("auth_token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];

    if (token) {
      setAuthCookies(token, updatedUser);
    }

    // Trigger parent component to re-render with new role
    onRoleSwitch?.(updatedUser);
  };

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };

  return (
    <header className="header sticky top-0 z-10">
      <div className="header-content">
        <Link href="/dashboard" className="header-brand-group cursor-pointer">
          <EverestLogo className="header-logo" />
          <span className="header-brand">Neplance</span>
        </Link>

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
              {pathname === "/profile" ? (
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    // Navigate to Dashboard
                    router.push("/dashboard");
                    setShowDropdown(false);
                  }}
                >
                  Dashboard
                </button>
              ) : (
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={handleProfileClick}
                >
                  My Profile
                </button>
              )}
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
