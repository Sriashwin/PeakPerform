import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import checkInService from "../../services/checkInService";

const initialState = {
  items: [],
  pendingItems: [],
  pagination: {
    totalPages: 0,
    number: 0,
  },
  selectedItem: null,
  loading: false,
  error: null,
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data ||
  error.message ||
  fallback;

// Fetch check-ins for a key result
export const fetchCheckins = createAsyncThunk(
  "checkins/fetchCheckins",
  async (
    { keyResultId, page = 0 } = {},
    { rejectWithValue }
  ) => {
    try {
      return await checkInService.getByKeyResult(
        keyResultId,
        page
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch check-ins"
        )
      );
    }
  }
);

// Fetch current user's check-ins
export const fetchMyCheckins = createAsyncThunk(
  "checkins/fetchMyCheckins",
  async (page = 0, { rejectWithValue }) => {
    try {
      return await checkInService.getMine(page);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch my check-ins"
        )
      );
    }
  }
);

// Fetch pending check-ins
export const fetchPendingCheckins = createAsyncThunk(
  "checkins/fetchPendingCheckins",
  async (_, { rejectWithValue }) => {
    try {
      return await checkInService.getPending();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch pending check-ins"
        )
      );
    }
  }
);

// Submit check-in
export const submitCheckin = createAsyncThunk(
  "checkins/submitCheckin",
  async (data, { rejectWithValue }) => {
    try {
      return await checkInService.submit(data);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to submit check-in"
        )
      );
    }
  }
);

// Approve check-in
export const approveCheckin = createAsyncThunk(
  "checkins/approveCheckin",
  async (id, { rejectWithValue }) => {
    try {
      return await checkInService.approve(id);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to approve check-in"
        )
      );
    }
  }
);

// Reject check-in
export const rejectCheckin = createAsyncThunk(
  "checkins/rejectCheckin",
  async (
    { id, rejectionReason },
    { rejectWithValue }
  ) => {
    try {
      return await checkInService.reject(
        id,
        rejectionReason
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to reject check-in"
        )
      );
    }
  }
);

const checkinSlice = createSlice({
  name: "checkins",

  initialState,

  reducers: {
    clearCheckInError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch check-ins
      .addCase(fetchCheckins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchCheckins.fulfilled,
        (state, action) => {
          state.loading = false;

          const payload = action.payload;

          state.items = payload?.content || [];

          if (payload) {
            state.pagination = {
              totalPages:
                payload.totalPages ?? 0,
              number: payload.number ?? 0,
            };
          }
        }
      )

      .addCase(
        fetchCheckins.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch check-ins";
        }
      )

      // Fetch my check-ins
      .addCase(fetchMyCheckins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchMyCheckins.fulfilled,
        (state, action) => {
          state.loading = false;

          const payload = action.payload;

          state.items = payload?.content || [];

          if (payload) {
            state.pagination = {
              totalPages:
                payload.totalPages ?? 0,
              number: payload.number ?? 0,
            };
          }
        }
      )

      .addCase(
        fetchMyCheckins.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch my check-ins";
        }
      )

      // Fetch pending check-ins
      .addCase(
        fetchPendingCheckins.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchPendingCheckins.fulfilled,
        (state, action) => {
          state.loading = false;
          state.pendingItems = action.payload;
        }
      )

      .addCase(
        fetchPendingCheckins.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch pending check-ins";
        }
      )

      // Submit check-in
      .addCase(submitCheckin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        submitCheckin.fulfilled,
        (state, action) => {
          state.loading = false;
          state.items.unshift(action.payload);
        }
      )

      .addCase(
        submitCheckin.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to submit check-in";
        }
      )

      // Approve check-in
      .addCase(approveCheckin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        approveCheckin.fulfilled,
        (state, action) => {
          state.loading = false;

          const approvedId = action.payload?.id;

          state.pendingItems =
            state.pendingItems.filter(
              (item) => item.id !== approvedId
            );

          const index = state.items.findIndex(
            (item) => item.id === approvedId
          );

          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )

      .addCase(
        approveCheckin.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to approve check-in";
        }
      )

      // Reject check-in
      .addCase(rejectCheckin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        rejectCheckin.fulfilled,
        (state, action) => {
          state.loading = false;

          const rejectedId = action.payload?.id;

          state.pendingItems =
            state.pendingItems.filter(
              (item) => item.id !== rejectedId
            );
        }
      )

      .addCase(
        rejectCheckin.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to reject check-in";
        }
      );
  },
});

export const {
  clearCheckInError,
} = checkinSlice.actions;

export default checkinSlice.reducer;