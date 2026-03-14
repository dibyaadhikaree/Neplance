import { requireCurrentUser } from "@/lib/server/auth";

export default async function AdminPanel() {
  const user = await requireCurrentUser();

  if (Array.isArray(user.role) && user.role.includes("admin")) {
    return <div>This is admin panel</div>;
  }

  return <div>This is admin panel</div>;
}
