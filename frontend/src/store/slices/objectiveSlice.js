import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import objectiveService from "../../services/objectiveService";

const initialState = {
  items: [],
  pagination: {
    totalPages: 0,
    totalElements: 0,
    number: 0,
  },
  selectedItem: null,
  loading: false,
  error: null,
  filterByStatus: "",
  searchQuery: "",
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data ||
  error.message ||
  fallback;

// Fetch objectives
export const fetchObjectives = createAsyncThunk(
  "objectives/fetchObjectives",
  async (
    {
      ownerId,
      cycleId,
      page = 0,
      size = 10,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      return await objectiveService.getAll(
        ownerId,
        cycleId,
        page,
        size
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch objectives"
        )
      );
    }
  }
);

// Create objective
export const createObjective = createAsyncThunk(
  "objectives/createObjective",
  async (data, { rejectWithValue }) => {
    try {
      return await objectiveService.create(data);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to create objective"
        )
      );
    }
  }
);

// Update objective
export const updateObjective = createAsyncThunk(
  "objectives/updateObjective",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await objectiveService.update(id, data);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update objective"
        )
      );
    }
  }
);

// Delete objective
export const deleteObjective = createAsyncThunk(
  "objectives/deleteObjective",
  async (id, { rejectWithValue }) => {
    try {
      await objectiveService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to delete objective"
        )
      );
    }
  }
);

// Activate objective
export const activateObjective = createAsyncThunk(
  "objectives/activateObjective",
  async (id, { rejectWithValue }) => {
    try {
      return await objectiveService.activate(id);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to activate objective"
        )
      );
    }
  }
);

// Pause objective
export const pauseObjective = createAsyncThunk(
  "objectives/pauseObjective",
  async (id, { rejectWithValue }) => {
    try {
      return await objectiveService.pause(id);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to pause objective"
        )
      );
    }
  }
);

// Resume objective
export const resumeObjective = createAsyncThunk(
  "objectives/resumeObjective",
  async (id, { rejectWithValue }) => {
    try {
      return await objectiveService.resume(id);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to resume objective"
        )
      );
    }
  }
);

const objectiveSlice = createSlice({
  name: "objectives",

  initialState,

  reducers: {
    setObjectiveFilter: (state, action) => {
      state.filterByStatus = action.payload;
    },

    setObjectiveSearch: (state, action) => {
      state.searchQuery = action.payload;
    },

    clearObjectiveError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch objectives
      .addCase(fetchObjectives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchObjectives.fulfilled,
        (state, action) => {
          state.loading = false;

          const payload = action.payload;

          state.items = Array.isArray(payload)
            ? payload
            : payload?.content || [];

          if (
            payload &&
            typeof payload.totalPages !==
              "undefined"
          ) {
            state.pagination = {
              totalPages: payload.totalPages ?? 0,
              totalElements:
                payload.totalElements ?? 0,
              number: payload.number ?? 0,
            };
          }
        }
      )

      .addCase(
        fetchObjectives.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch objectives";
        }
      )

      // Create objective
      .addCase(createObjective.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        createObjective.fulfilled,
        (state, action) => {
          state.loading = false;
          state.items.unshift(action.payload);
        }
      )

      .addCase(
        createObjective.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to create objective";
        }
      )

      // Update objective
      .addCase(updateObjective.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        updateObjective.fulfilled,
        (state, action) => {
          state.loading = false;

          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );

          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )

      .addCase(
        updateObjective.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to update objective";
        }
      )

      // Delete objective
      .addCase(deleteObjective.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        deleteObjective.fulfilled,
        (state, action) => {
          state.loading = false;

          state.items = state.items.filter(
            (item) => item.id !== action.payload
          );
        }
      )

      .addCase(
        deleteObjective.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to delete objective";
        }
      )

      // Activate objective
      .addCase(
        activateObjective.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        activateObjective.fulfilled,
        (state, action) => {
          state.loading = false;

          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );

          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )

      .addCase(
        activateObjective.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to activate objective";
        }
      )

      // Pause objective
      .addCase(
        pauseObjective.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        pauseObjective.fulfilled,
        (state, action) => {
          state.loading = false;

          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );

          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )

      .addCase(
        pauseObjective.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to pause objective";
        }
      )

      // Resume objective
      .addCase(
        resumeObjective.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        resumeObjective.fulfilled,
        (state, action) => {
          state.loading = false;

          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );

          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )

      .addCase(
        resumeObjective.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to resume objective";
        }
      );
  },
});

export const {
  setObjectiveFilter,
  setObjectiveSearch,
  clearObjectiveError,
} = objectiveSlice.actions;

export default objectiveSlice.reducer;