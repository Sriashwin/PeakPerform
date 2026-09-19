import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================
// REQUEST INTERCEPTOR
// ========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "peakperform_token"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ========================================
// RESPONSE INTERCEPTOR
// ========================================

api.interceptors.response.use(
  (response) => {
    // Successful responses pass through unchanged
    return response;
  },

  (error) => {
    const status = error.response?.status;

    const requestUrl =
      error.config?.url || "";

    // Check whether this 401 came from the login request
    const isLoginRequest =
      requestUrl.includes("/auth/login");

    /*
     * 401 from login means invalid credentials.
     *
     * Do NOT clear storage or redirect.
     * Let the login page handle the error.
     */
    if (
      status === 401 &&
      !isLoginRequest
    ) {
      localStorage.removeItem(
        "peakperform_token"
      );

      localStorage.removeItem(
        "peakperform_refresh"
      );

      localStorage.removeItem(
        "peakperform_user"
      );

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;