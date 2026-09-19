import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import progressSnapshotService from "../../services/progressSnapshotService";

const initialState = {
  items: [],
  trendData: [],
  selectedItem: null,
  loading: false,
  error: null,
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data ||
  error.message ||
  fallback;

// Fetch all snapshots for an objective
export const fetchSnapshots = createAsyncThunk(
  "progressSnapshots/fetchSnapshots",
  async (objectiveId, { rejectWithValue }) => {
    try {
      return await progressSnapshotService.getAll(
        objectiveId
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch snapshots"
        )
      );
    }
  }
);

// Capture a new snapshot
export const captureSnapshot = createAsyncThunk(
  "progressSnapshots/captureSnapshot",
  async (objectiveId, { rejectWithValue }) => {
    try {
      return await progressSnapshotService.capture(
        objectiveId
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to capture snapshot"
        )
      );
    }
  }
);

// Fetch snapshot trend
export const fetchTrend = createAsyncThunk(
  "progressSnapshots/fetchTrend",
  async (
    { objectiveId, from, to },
    { rejectWithValue }
  ) => {
    try {
      return await progressSnapshotService.getTrend(
        objectiveId,
        from,
        to
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch snapshot trend"
        )
      );
    }
  }
);

const progressSnapshotSlice = createSlice({
  name: "progressSnapshots",

  initialState,

  reducers: {
    clearSnapshotError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch snapshots
      .addCase(fetchSnapshots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchSnapshots.fulfilled,
        (state, action) => {
          state.loading = false;
          state.items = action.payload;
        }
      )

      .addCase(
        fetchSnapshots.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch snapshots";
        }
      )

      // Capture snapshot
      .addCase(captureSnapshot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        captureSnapshot.fulfilled,
        (state, action) => {
          state.loading = false;
          state.items.push(action.payload);
        }
      )

      .addCase(
        captureSnapshot.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to capture snapshot";
        }
      )

      // Fetch trend
      .addCase(fetchTrend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchTrend.fulfilled,
        (state, action) => {
          state.loading = false;
          state.trendData = action.payload;
        }
      )

      .addCase(
        fetchTrend.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch snapshot trend";
        }
      );
  },
});

export const {
  clearSnapshotError,
} = progressSnapshotSlice.actions;

export default progressSnapshotSlice.reducer;