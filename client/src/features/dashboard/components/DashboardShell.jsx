import { DashboardSectionNav } from "@/features/dashboard/components/DashboardSectionNav";
import { Navbar } from "@/shared/components/Navbar";

export function DashboardShell({ activeRole, children, user }) {
  const config =
    activeRole === "client"
      ? {
          title: "Client Dashboard",
          subtitle: "Manage your contracts and proposals",
          items: [
            { href: "/dashboard/client/post-job", label: "Post Job" },
            { href: "/dashboard/client/my-jobs", label: "My Contracts" },
            { href: "/dashboard/client/proposals", label: "Proposals" },
          ],
        }
      : {
          title: "Freelancer Dashboard",
          subtitle: "Manage your proposals and active contracts",
          items: [
            {
              href: "/dashboard/freelancer/active-proposals",
              label: "My Proposals",
            },
            {
              href: "/dashboard/freelancer/ongoing-jobs",
              label: "Active Contracts",
            },
          ],
        };

  return (
    <>
      <Navbar user={user} />

      <div className="dashboard">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <div className="dashboard-header-row">
              <div>
                <h2 className="dashboard-title">{config.title}</h2>
                <p className="dashboard-subtitle">{config.subtitle}</p>
              </div>
            </div>
          </div>

          <DashboardSectionNav items={config.items} />

          {children}
        </div>
      </div>
    </>
  );
}
