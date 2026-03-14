import { apiCall } from "@/lib/api/client";

export async function getMyProposals() {
  return apiCall("/api/proposals/myProposals");
}

export async function getJobProposals(jobId) {
  return apiCall(`/api/proposals/job/${jobId}`);
}

export async function getProposalById(proposalId) {
  return apiCall(`/api/proposals/${proposalId}`);
}
