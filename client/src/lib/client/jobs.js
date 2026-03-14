import { apiCall } from "@/lib/api/client";

export async function listOpenJobs(searchParams = "") {
  return apiCall(`/api/jobs${searchParams ? `?${searchParams}` : ""}`);
}

export async function getMyJobs() {
  return apiCall("/api/jobs/myJobs");
}

export async function getJobById(jobId) {
  return apiCall(`/api/jobs/${jobId}`);
}

export async function createJob(payload) {
  return apiCall("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function publishJob(jobId) {
  return apiCall(`/api/jobs/${jobId}/publish`, {
    method: "PATCH",
  });
}

export async function deleteJob(jobId) {
  return apiCall(`/api/jobs/${jobId}`, {
    method: "DELETE",
  });
}

export async function requestJobCancellation(jobId, reason) {
  return apiCall(`/api/jobs/${jobId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason: reason?.trim() || undefined }),
  });
}

export async function respondJobCancellation(jobId, action) {
  return apiCall(`/api/jobs/${jobId}/cancel/respond`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}
