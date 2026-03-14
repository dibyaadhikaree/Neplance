import { apiServerCall } from "@/lib/api/server";

export async function getMyProfileServer() {
  const data = await apiServerCall("/api/users/me");
  return data?.data?.user || null;
}

export async function checkDeleteEligibilityServer() {
  return apiServerCall("/api/users/me/check-delete-eligibility");
}
