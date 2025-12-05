"use client";

import { EverestLogo } from "./EverestLogo";

const QuickStartCard = ({ title, description }) => (
  <div className="card-sm card-hover cursor-pointer">
    <h3 className="heading-3 mb-1">{title}</h3>
    <p className="text-muted">{description}</p>
  </div>
);

export const Dashboard = ({ user, onLogout }) => {
  const isFreelancer = user.role?.includes("freelancer");
  const isClient = user.role?.includes("client");

  return (
    <div className="container-page">
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

      <main className="container-content">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <h1 className="heading-1 mb-4">Welcome, {user.name}</h1>
            <p className="text-secondary text-lg mb-8">
              You're logged in and ready to get started on your freelancing
              journey.
            </p>

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
                    {user.role?.length > 0 ? (
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

          <div className="card">
            <h2 className="heading-2 mb-6">Quick Start</h2>
            <div className="space-y-4">
              {isFreelancer && (
                <QuickStartCard
                  title="Find Projects"
                  description="Browse and apply for available projects"
                />
              )}
              {isClient && (
                <QuickStartCard
                  title="Post a Job"
                  description="Create a new job and find the perfect freelancer"
                />
              )}
              <QuickStartCard
                title="View Profile"
                description="Update your profile and manage settings"
              />
              <QuickStartCard
                title="Notifications"
                description="Stay updated with your activities"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
