import { apiCall } from "@/lib/api/client";

export async function getFreelancers() {
  return apiCall("/api/users/freelancers");
}

export async function getFreelancerById(id) {
  return apiCall(`/api/users/freelancers/${id}`);
}

export async function getMyProfile() {
  return apiCall("/api/users/me");
}

export async function deleteMyProfile() {
  return apiCall("/api/users/me", {
    method: "DELETE",
  });
}

export async function checkDeleteEligibility() {
  return apiCall("/api/users/me/check-delete-eligibility");
}
