"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Inline logo SVG - consistent 32x32 green circle with mountain icon.
 */
const Logo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="16" cy="16" r="16" fill="#14a800" />
    <path
      d="M12 10L16 20L20 10"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 15H22" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Unified Navbar used on EVERY page.
 *
 * Props:
 * - user: user object (null when logged out)
 * - onLogout: callback for logout
 * - onRoleSwitch: callback to switch active role (optional, dashboard only)
 */
export function Navbar({ user, onLogout, onRoleSwitch }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Derive role info
  const roleList = Array.isArray(user?.role)
    ? user.role
    : user?.role
      ? [user.role]
      : [];
  const activeRole = roleList[0] || "freelancer";
  const isFreelancer = activeRole === "freelancer";
  const hasBothRoles =
    roleList.includes("freelancer") && roleList.includes("client");

  const isActive = (path) => pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchRole = () => {
    setShowDropdown(false);
    const newRole = activeRole === "freelancer" ? "client" : "freelancer";
    const nextRoles = roleList.includes(newRole)
      ? [newRole, ...roleList.filter((r) => r !== newRole)]
      : [newRole, ...roleList];
    onRoleSwitch?.({ ...user, role: nextRoles });
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
    onLogout?.();
  };

  // ----- Guest (logged out) -----
  if (!user) {
    return (
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <Logo />
            <span>Neplance</span>
          </Link>

          <ul className="navbar-links">
            <li>
              <a href="/#hire-talent" className="navbar-link">
                Find Talent
              </a>
            </li>
            <li>
              <a href="/#find-opportunities" className="navbar-link">
                Find Work
              </a>
            </li>
            <li>
              <Link href="/login" className="navbar-link">
                Log In
              </Link>
            </li>
            <li>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }

  // ----- Authenticated -----
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/dashboard" className="navbar-brand">
          <Logo />
          <span>Neplance</span>
        </Link>

        <ul className="navbar-links">
          <li>
            <Link
              href="/dashboard"
              className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href={isFreelancer ? "/jobs" : "/talent"}
              className={`navbar-link ${isActive(isFreelancer ? "/jobs" : "/talent") ? "active" : ""}`}
            >
              {isFreelancer ? "Find Work" : "Find Talent"}
            </Link>
          </li>
        </ul>

        <div className="navbar-right">
          <div className="profile-menu" ref={dropdownRef}>
            <button
              type="button"
              className="profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="profile-avatar">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="profile-name">{user.name || "User"}</span>
            </button>

            {showDropdown && (
              <div className="profile-dropdown">
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    router.push("/profile");
                    setShowDropdown(false);
                  }}
                >
                  My Profile
                </button>
                {hasBothRoles && (
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={handleSwitchRole}
                  >
                    Switch to {isFreelancer ? "Client" : "Freelancer"}
                  </button>
                )}
                <div className="dropdown-divider" />
                <button
                  type="button"
                  className="dropdown-item dropdown-item-logout"
                  onClick={handleLogoutClick}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
