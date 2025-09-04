import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // ms
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // withCredentials: true, // <-- only if you use httpOnly cookies
});

// REQUEST: attach bearer token (works for Axios v1 too)
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token"); // ensure this is the raw token string
    if (accessToken) {
      if (typeof config.headers?.set === "function") {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      } else {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple guard to avoid redirect storms
let redirectingToLogin = false;

// RESPONSE: handle timeouts, network errors, then HTTP errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Timeout (no response)
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
      return Promise.reject(error);
    }

    // Network error (no response received)
    if (!error.response) {
      console.error("Network error. Check your connection or server.");
      return Promise.reject(error);
    }

    // HTTP errors
    const { status } = error.response;

    if (status === 401) {
      if (!redirectingToLogin) {
        redirectingToLogin = true;
        // optionally clear token
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } else if (status === 403) {
      console.warn("Forbidden");
    } else if (status >= 500) {
      console.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
