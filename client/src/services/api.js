/**
 * API utility for making authenticated requests
 */

import { getAccessToken, setAccessToken, clearAccessToken } from "@/shared/utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

export class APIError extends Error {
  constructor(message, status, errorCode = null) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.message || "Failed to refresh token",
        response.status,
        data.errorCode,
      );
    }

    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch (error) {
    throw error;
  }
};

/**
 * Make authenticated API request with automatic token refresh
 */
export async function apiCall(endpoint, options = {}) {
  const makeRequest = async (retryCount = 0) => {
    try {
      const accessToken = getAccessToken();
      
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 &&
          data.errorCode === "TOKEN_EXPIRED" &&
          retryCount === 0 &&
          !isRefreshing
        ) {
          if (!isRefreshing) {
            isRefreshing = true;
            try {
              await refreshAccessToken();
              isRefreshing = false;
              onTokenRefreshed();
              return makeRequest(retryCount + 1);
            } catch (refreshError) {
              isRefreshing = false;
              clearAccessToken();
              window.location.href = "/";
              throw new APIError("Session expired. Please log in again.", 401);
            }
          }

          return new Promise((resolve) => {
            subscribeTokenRefresh(() => {
              resolve(makeRequest(retryCount + 1));
            });
          });
        }

        if (response.status === 401) {
          clearAccessToken();
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
          throw new APIError(
            data.message || "You are not logged in",
            401,
            data.errorCode,
          );
        }

        throw new APIError(
          data.message || `Request failed with status ${response.status}`,
          response.status,
          data.errorCode,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error.message || "Network error. Please check your connection.",
        500,
      );
    }
  };

  return makeRequest();
}

/**
 * Make unauthenticated POST request (for auth endpoints)
 */
export async function apiAuthCall(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.message || "Authentication failed. Please try again.",
        response.status,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error.message || "Network error. Please check your connection.",
      500,
    );
  }
}
