import api from "./api";

const progressSnapshotService = {
  capture: async (objectiveId) => {
    const response = await api.post(
      `/snapshots/${objectiveId}`
    );

    return response.data;
  },

  getAll: async (objectiveId) => {
    const response = await api.get(
      `/snapshots/${objectiveId}`
    );

    return response.data;
  },

  getTrend: async (objectiveId, from, to) => {
    const params = new URLSearchParams();

    params.append("from", from);
    params.append("to", to);

    const response = await api.get(
      `/snapshots/${objectiveId}/trend?${params.toString()}`
    );

    return response.data;
  },
};

export default progressSnapshotService;