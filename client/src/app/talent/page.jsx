import { TalentPageClient } from "@/features/users/components/TalentPageClient";
import { requireCurrentUser } from "@/lib/server/auth";

export default async function TalentPage() {
  const user = await requireCurrentUser();

  return <TalentPageClient initialUser={user} />;
}
