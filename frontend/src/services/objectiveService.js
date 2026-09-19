import api from "./api";

const objectiveService = {
  getAll: async (
    ownerId,
    cycleId,
    page = 0,
    size = 10
  ) => {
    const params = new URLSearchParams();

    if (ownerId !== undefined && ownerId !== null) {
      params.append("ownerId", ownerId);
    }

    if (cycleId !== undefined && cycleId !== null) {
      params.append("cycleId", cycleId);
    }

    params.append("page", page);
    params.append("size", size);

    const response = await api.get(
      `/objectives?${params.toString()}`
    );

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/objectives/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/objectives", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(
      `/objectives/${id}`,
      data
    );

    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(
      `/objectives/${id}`
    );

    return response.data;
  },

  activate: async (id) => {
    const response = await api.put(
      `/objectives/${id}/activate`
    );

    return response.data;
  },

  pause: async (id) => {
    const response = await api.put(
      `/objectives/${id}/pause`
    );

    return response.data;
  },

  resume: async (id) => {
    const response = await api.put(
      `/objectives/${id}/resume`
    );

    return response.data;
  },
};

export default objectiveService;