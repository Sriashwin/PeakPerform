import api from "./api";

const keyResultService = {
  getByObjective: async (objectiveId) => {
    const response = await api.get(
      `/key-results?objectiveId=${encodeURIComponent(objectiveId)}`
    );

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/key-results/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(
      "/key-results",
      data
    );

    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(
      `/key-results/${id}`,
      data
    );

    return response.data;
  },

  updateValue: async (id, currentValue, status) => {
    const response = await api.patch(
      `/key-results/${id}/value`,
      {
        currentValue,
        status,
      }
    );

    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(
      `/key-results/${id}`
    );

    return response.data;
  },
};

export default keyResultService;