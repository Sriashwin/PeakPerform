import api from "./api";

const checkInService = {
  getByKeyResult: async (keyResultId, page = 0) => {
    const params = new URLSearchParams();

    params.append("keyResultId", keyResultId);
    params.append("page", page);
    params.append("size", 10);

    const response = await api.get(
      `/check-ins?${params.toString()}`
    );

    return response.data;
  },

  getMine: async (page = 0) => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("size", 10);

    const response = await api.get(
      `/check-ins/mine?${params.toString()}`
    );

    return response.data;
  },

  getPending: async () => {
    const response = await api.get(
      "/check-ins/pending"
    );

    return response.data;
  },

  submit: async (data) => {
    const response = await api.post(
      "/check-ins",
      data
    );

    return response.data;
  },

  approve: async (id) => {
    const response = await api.put(
      `/check-ins/${id}/approve`
    );

    return response.data;
  },

  reject: async (id, rejectionReason) => {
    const response = await api.put(
      `/check-ins/${id}/reject`,
      {
        rejectionReason,
      }
    );

    return response.data;
  },
};

export default checkInService;