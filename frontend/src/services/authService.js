import api from "./api";

const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await api.post("/auth/refresh", {
      refreshToken,
    });

    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get("/auth/users");
    return response.data;
  },

  getUsersByRole: async (role) => {
    const response = await api.get(
      `/auth/users/by-role?role=${encodeURIComponent(role)}`
    );

    return response.data;
  },
};

export default authService;