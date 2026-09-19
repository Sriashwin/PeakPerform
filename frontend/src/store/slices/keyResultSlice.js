import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import keyResultService from "../../services/keyResultService";

const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data ||
  error.message ||
  fallback;

// Fetch key results for an objective
export const fetchKeyResults = createAsyncThunk(
  "keyResults/fetchKeyResults",
  async ({ objectiveId }, { rejectWithValue }) => {
    try {
      return await keyResultService.getByObjective(
        objectiveId
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch key results"
        )
      );
    }
  }
);

// Create key result
export const createKeyResult = createAsyncThunk(
  "keyResults/createKeyResult",
  async (data, { rejectWithValue }) => {
    try {
      return await keyResultService.create(data);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to create key result"
        )
      );
    }
  }
);

// Update key result
export const updateKeyResult = createAsyncThunk(
  "keyResults/updateKeyResult",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await keyResultService.update(id, data);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update key result"
        )
      );
    }
  }
);

// Update key result value
export const updateKeyResultValue = createAsyncThunk(
  "keyResults/updateKeyResultValue",
  async (
    { id, currentValue, status },
    { rejectWithValue }
  ) => {
    try {
      return await keyResultService.updateValue(
        id,
        currentValue,
        status
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update key result value"
        )
      );
    }
  }
);

// Delete key result
export const deleteKeyResult = createAsyncThunk(
  "keyResults/deleteKeyResult",
  async (id, { rejectWithValue }) => {
    try {
      await keyResultService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to delete key result"
        )
      );
    }
  }
);

const keyResultSlice = createSlice({
  name: "keyResults",

  initialState,

  reducers: {
    clearKeyResultError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch key results
      .addCase(fetchKeyResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchKeyResults.fulfilled,
        (state, action) => {
          state.loading = false;
          state.items = action.payload;
        }
      )

      .addCase(
        fetchKeyResults.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch key results";
        }
      )

      // Create key result
      .addCase(createKeyResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        createKeyResult.fulfilled,
        (state, action) => {
          state.loading = false;
          state.items.push(action.payload);
        }
      )

      .addCase(
        createKeyResult.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to create key result";
        }
      )

      // Update key result
      .addCase(updateKeyResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        updateKeyResult.fulfilled,
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
        updateKeyResult.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to update key result";
        }
      )

      // Update key result value
      .addCase(
        updateKeyResultValue.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        updateKeyResultValue.fulfilled,
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
        updateKeyResultValue.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to update key result value";
        }
      )

      // Delete key result
      .addCase(deleteKeyResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        deleteKeyResult.fulfilled,
        (state, action) => {
          state.loading = false;

          state.items = state.items.filter(
            (item) => item.id !== action.payload
          );
        }
      )

      .addCase(
        deleteKeyResult.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to delete key result";
        }
      );
  },
});

export const {
  clearKeyResultError,
} = keyResultSlice.actions;

export default keyResultSlice.reducer;