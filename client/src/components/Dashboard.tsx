"use client";

import type { User } from "./auth/AuthPanel";
import { EverestLogo } from "./EverestLogo";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  return (
    <div className="container-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="flex items-center gap-3">
            <EverestLogo className="h-8 w-8" />
            <span className="heading-3">Neplance</span>
          </div>
          <button type="button" onClick={onLogout} className="btn btn-ghost">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-content">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          {/* Welcome Section */}
          <div>
            <h1 className="heading-1 mb-4">Welcome, {user.name}</h1>
            <p className="text-secondary text-lg mb-8">
              You're logged in and ready to get started on your freelancing
              journey.
            </p>

            {/* User Info Card */}
            <div className="card mb-8">
              <div className="space-y-4">
                <div>
                  <p className="text-muted mb-1">Email</p>
                  <p className="text-primary font-medium break-all">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-muted mb-2">Your Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {user.role && user.role.length > 0 ? (
                      user.role.map((role) => (
                        <span key={role} className="badge capitalize">
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-secondary">No roles assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="card">
            <h2 className="heading-2 mb-6">Quick Start</h2>
            <div className="space-y-4">
              {user.role?.includes("freelancer") && (
                <div className="card-sm card-hover cursor-pointer">
                  <h3 className="heading-3 mb-1">Find Projects</h3>
                  <p className="text-muted">
                    Browse and apply for available projects
                  </p>
                </div>
              )}
              {user.role?.includes("client") && (
                <div className="card-sm card-hover cursor-pointer">
                  <h3 className="heading-3 mb-1">Post a Job</h3>
                  <p className="text-muted">
                    Create a new job and find the perfect freelancer
                  </p>
                </div>
              )}
              <div className="card-sm card-hover cursor-pointer">
                <h3 className="heading-3 mb-1">View Profile</h3>
                <p className="text-muted">
                  Update your profile and manage settings
                </p>
              </div>
              <div className="card-sm card-hover cursor-pointer">
                <h3 className="heading-3 mb-1">Notifications</h3>
                <p className="text-muted">Stay updated with your activities</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
