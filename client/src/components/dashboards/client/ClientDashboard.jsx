"use client";

import { Header } from "../../dashboard/Header";

export const ClientDashboard = ({ user, onLogout, onRoleSwitch }) => {
  return (
    <div className="dashboard">
      <Header user={user} onLogout={onLogout} onRoleSwitch={onRoleSwitch} />
      <div className="flex items-center justify-center h-[calc(100vh-65px)]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Client Dashboard
          </h1>
          <p className="text-gray-500">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};
