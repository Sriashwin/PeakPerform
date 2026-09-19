import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import okrCycleService from "../../services/okrCycleService";

const initialState = {
  items: [],
  selectedItem: null,
  cycleStats: null,
  loading: false,
  error: null,
  filterByStatus: "",
};

export const fetchCycles = createAsyncThunk(
  "okrCycles/fetchCycles",
  async (_, { rejectWithValue }) => {
    try {
      return await okrCycleService.getAll();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to fetch cycles"
      );
    }
  }
);

export const createCycle = createAsyncThunk(
  "okrCycles/createCycle",
  async (data, { rejectWithValue }) => {
    try {
      return await okrCycleService.create(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to create cycle"
      );
    }
  }
);

export const updateCycle = createAsyncThunk(
  "okrCycles/updateCycle",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await okrCycleService.update(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to update cycle"
      );
    }
  }
);

export const deleteCycle = createAsyncThunk(
  "okrCycles/deleteCycle",
  async (id, { rejectWithValue }) => {
    try {
      await okrCycleService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to delete cycle"
      );
    }
  }
);

export const activateCycle = createAsyncThunk(
  "okrCycles/activateCycle",
  async (id, { rejectWithValue }) => {
    try {
      return await okrCycleService.activate(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to activate cycle"
      );
    }
  }
);

export const closeCycle = createAsyncThunk(
  "okrCycles/closeCycle",
  async (id, { rejectWithValue }) => {
    try {
      return await okrCycleService.close(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to close cycle"
      );
    }
  }
);

export const fetchCycleStats = createAsyncThunk(
  "okrCycles/fetchCycleStats",
  async (id, { rejectWithValue }) => {
    try {
      return await okrCycleService.getStats(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to fetch cycle stats"
      );
    }
  }
);

const okrCycleSlice = createSlice({
  name: "okrCycles",

  initialState,

  reducers: {
    setFilterByStatus: (state, action) => {
      state.filterByStatus = action.payload;
    },

    clearCycleError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch cycles
      .addCase(fetchCycles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCycles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })

      .addCase(fetchCycles.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch cycles";
      })

      // Create cycle
      .addCase(createCycle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createCycle.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })

      .addCase(createCycle.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to create cycle";
      })

      // Update cycle
      .addCase(updateCycle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateCycle.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(updateCycle.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to update cycle";
      })

      // Delete cycle
      .addCase(deleteCycle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteCycle.fulfilled, (state, action) => {
        state.loading = false;

        state.items = state.items.filter(
          (item) => item.id !== action.payload
        );
      })

      .addCase(deleteCycle.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to delete cycle";
      })

      // Activate cycle
      .addCase(activateCycle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(activateCycle.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(activateCycle.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to activate cycle";
      })

      // Close cycle
      .addCase(closeCycle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(closeCycle.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(closeCycle.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to close cycle";
      })

      // Cycle stats
      .addCase(fetchCycleStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCycleStats.fulfilled, (state, action) => {
        state.loading = false;
        state.cycleStats = action.payload;
      })

      .addCase(fetchCycleStats.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch cycle stats";
      });
  },
});

export const {
  setFilterByStatus,
  clearCycleError,
} = okrCycleSlice.actions;

export default okrCycleSlice.reducer;