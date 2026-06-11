import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API Error:", error);
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";
    const isAuthRequest = requestUrl.includes("/api/auth/");
    const isAlreadyLoginPage = window.location.pathname === "/login";

    if (status === 401 && code === "TOKEN_EXPIRED" && !isAuthRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post("/api/auth/refresh");
        return api(originalRequest);
      } catch (refreshErr) {
        if (!isAlreadyLoginPage) window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    if (status === 401 && !isAuthRequest && !isAlreadyLoginPage) {
      window.location.href = "/login";
    } else if (status === 403) {

      // window.location.href = "/unauthorized";
    }
    return Promise.reject(error);
  },
);

export default api;
