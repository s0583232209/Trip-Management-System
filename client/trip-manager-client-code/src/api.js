import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";
    const isLoginRequest = requestUrl.includes("/api/auth/login");
    const isAlreadyLoginPage = window.location.pathname === "/login";

    if (status === 401 && !isLoginRequest && !isAlreadyLoginPage) {
      window.location.href = "/login";
    } else if (status === 403) {
      window.location.href = "/access_denied";
    } else if (status === 404) {
      window.location.href = "/not-found";
    }
    return Promise.reject(error);
  },
);

export default api;
