/**
 * API utility for making authenticated requests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/jobs', '/proposals/myProposals')
 * @param {string} token - Auth token
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 * @throws {APIError} If request fails
 */
export async function apiCall(endpoint, token, options = {}) {
  if (!token) {
    throw new APIError("Authentication token required", 401);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.message || `Request failed with status ${response.status}`,
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

/**
 * Make unauthenticated POST request (for auth endpoints)
 * @param {string} endpoint - API endpoint (e.g., '/auth/login', '/auth/register')
 * @param {object} body - Request body
 * @returns {Promise<any>} Response data
 * @throws {APIError} If request fails
 */
export async function apiAuthCall(endpoint, body) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
