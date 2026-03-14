import { FreelancerProfilePageClient } from "@/features/users/components/FreelancerProfilePageClient";
import { requireCurrentUser } from "@/lib/server/auth";

export default async function FreelancerProfilePage({ params }) {
  const user = await requireCurrentUser();
  const { id } = await params;

  return <FreelancerProfilePageClient freelancerId={id} initialUser={user} />;
}
