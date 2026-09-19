import api from "./api";

const okrCycleService = {
  getAll: async () => {
    const response = await api.get("/cycles");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/cycles/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/cycles", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/cycles/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/cycles/${id}`);
    return response.data;
  },

  activate: async (id) => {
    const response = await api.put(
      `/cycles/${id}/activate`
    );
    return response.data;
  },

  close: async (id) => {
    const response = await api.put(
      `/cycles/${id}/close`
    );
    return response.data;
  },

  getStats: async (id) => {
    const response = await api.get(
      `/cycles/${id}/stats`
    );
    return response.data;
  },
};

export default okrCycleService;